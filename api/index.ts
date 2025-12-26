import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import type { RequestHandler } from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ==================== INLINE ROUTE HANDLERS ====================

// ==================== EMAIL HELPERS ====================

/**
 * Helper function to send verification email
 */
async function sendVerificationEmail(
  email: string,
  userName: string,
  code: number,
): Promise<boolean> {
  try {
    console.log("🔍 Checking environment variables:");
    console.log("   SMTP_HOST:", process.env.SMTP_HOST || "NOT SET");
    console.log("   SMTP_PORT:", process.env.SMTP_PORT || "NOT SET");
    console.log("   SMTP_SECURE:", process.env.SMTP_SECURE || "NOT SET");
    console.log("   SMTP_USER:", process.env.SMTP_USER || "NOT SET");
    console.log(
      "   SMTP_PASSWORD:",
      process.env.SMTP_PASSWORD ? "SET (hidden)" : "NOT SET",
    );

    // For development/testing without SMTP config, use Ethereal test account
    let transportConfig: any;

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log(
        "⚠️  No SMTP credentials found. Using Ethereal test account...",
      );

      // Create test account on the fly (for development only)
      const testAccount = await nodemailer.createTestAccount();

      transportConfig = {
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      };

      console.log("📧 Ethereal test account created:");
      console.log("   User:", testAccount.user);
      console.log("   Pass:", testAccount.pass);
    } else {
      // Use configured SMTP settings (Hostgator)
      transportConfig = {
        host: process.env.SMTP_HOST || "mail.disruptinglabs.com",
        port: parseInt(process.env.SMTP_PORT || "465"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      };

      console.log("📧 Using configured SMTP settings:");
      console.log("   Host:", transportConfig.host);
      console.log("   Port:", transportConfig.port);
      console.log("   Secure:", transportConfig.secure);
      console.log("   User:", transportConfig.auth.user);
    }

    // Configure email transporter
    console.log("🔧 Creating transporter...");
    const transporter = nodemailer.createTransport(transportConfig);

    // Verify SMTP connection
    console.log("🔍 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified!");

    // Email template
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { background-color: white; border-radius: 10px; padding: 30px; max-width: 600px; margin: 0 auto; }
          .code { font-size: 32px; font-weight: bold; color: #10b981; text-align: center; padding: 20px; background-color: #f0f0f0; border-radius: 5px; margin: 20px 0; }
          .footer { color: #666; font-size: 12px; text-align: center; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Hola ${userName},</h1>
          <p>Tu código de verificación para InteliPadel es:</p>
          <div class="code">${code}</div>
          <p>Este código expirará en 10 minutos.</p>
          <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>
          <div class="footer">
            <p>InteliPadel - Tu plataforma de reservas de pádel</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log("📤 Sending email to:", email);
    console.log(
      "   From field:",
      process.env.SMTP_FROM || `"InteliPadel" <${process.env.SMTP_USER}>`,
    );
    console.log(
      "   Subject:",
      `${code} es tu código de verificación de InteliPadel`,
    );

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"InteliPadel" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `${code} es tu código de verificación de InteliPadel`,
      html: emailBody,
    });

    console.log("✅ Email sent successfully!");
    console.log("   Message ID:", info.messageId);
    console.log("   Response:", JSON.stringify(info.response || "No response"));
    console.log("   Envelope:", JSON.stringify(info.envelope || "No envelope"));
    console.log("   Accepted:", JSON.stringify(info.accepted || []));
    console.log("   Rejected:", JSON.stringify(info.rejected || []));

    // If using Ethereal (test mode), log the preview URL
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      const previewUrl = nodemailer.getTestMessageUrl(info as any);
      console.log("📬 Preview URL:", previewUrl);
      console.log("🔑 Verification code:", code);
    } else {
      // Production mode - log additional debug info
      console.log("🏭 PRODUCTION EMAIL SENT:");
      console.log("   Production SMTP used: mail.disruptinglabs.com");
      console.log("   Target email:", email);
      console.log("   User name:", userName);
      console.log("   Verification code:", code);
      console.log("   Environment check:");
      console.log("     NODE_ENV:", process.env.NODE_ENV);
      console.log("     SMTP_FROM:", process.env.SMTP_FROM || "NOT SET");
    }

    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    if (error instanceof Error) {
      console.error("   Error name:", error.name);
      console.error("   Error message:", error.message);
      console.error("   Error stack:", error.stack);
    }
    return false;
  }
}

// ==================== ROUTE HANDLERS ====================

/**
 * GET /api/health
 * Health check endpoint
 */
const handleHealth: RequestHandler = async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      success: true,
      message: "InteliPadel API is running",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/ping
 * Simple ping endpoint
 */
const handlePing: RequestHandler = (_req, res) => {
  res.json({ message: "pong" });
};

/**
 * GET /api/clubs
 * Fetch all active clubs with court count
 */
const handleGetClubs: RequestHandler = async (_req, res) => {
  try {
    const [rows] = await pool.query<any[]>(`
      SELECT c.*, COUNT(ct.id) as court_count 
      FROM clubs c 
      LEFT JOIN courts ct ON c.id = ct.club_id AND ct.is_active = TRUE
      WHERE c.is_active = TRUE 
      GROUP BY c.id
      ORDER BY c.featured DESC, c.rating DESC
    `);

    const clubs = rows.map((club) => ({
      ...club,
      amenities:
        typeof club.amenities === "string"
          ? JSON.parse(club.amenities)
          : club.amenities,
      gallery:
        typeof club.gallery === "string"
          ? JSON.parse(club.gallery)
          : club.gallery,
    }));

    res.json({
      success: true,
      data: clubs,
    });
  } catch (error) {
    console.error("Error fetching clubs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch clubs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/clubs/:id
 * Fetch a specific club by ID
 */
const handleGetClubById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query<any[]>(
      `SELECT c.*, COUNT(ct.id) as court_count 
       FROM clubs c 
       LEFT JOIN courts ct ON c.id = ct.club_id AND ct.is_active = TRUE
       WHERE c.id = ? AND c.is_active = TRUE 
       GROUP BY c.id`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    const club = {
      ...rows[0],
      amenities:
        typeof rows[0].amenities === "string"
          ? JSON.parse(rows[0].amenities)
          : rows[0].amenities,
      gallery:
        typeof rows[0].gallery === "string"
          ? JSON.parse(rows[0].gallery)
          : rows[0].gallery,
    };

    res.json({
      success: true,
      data: club,
    });
  } catch (error) {
    console.error("Error fetching club:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch club",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/bookings
 * Get bookings for a user
 */
const handleGetBookings: RequestHandler = async (req, res) => {
  try {
    const userId = req.query.userId || req.query.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const [rows] = await pool.query<any[]>(
      `SELECT 
        b.*,
        c.name as club_name,
        co.name as court_name
       FROM bookings b
       JOIN clubs c ON b.club_id = c.id
       JOIN courts co ON b.court_id = co.id
       WHERE b.user_id = ?
       ORDER BY b.booking_date DESC, b.start_time DESC
       LIMIT 50`,
      [userId],
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/auth/check-user
 * Check if a user exists by email
 */
const handleCheckUser: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const [rows] = await pool.query<any[]>(
      `SELECT id, email, name, phone, avatar_url, stripe_customer_id, is_active, created_at, updated_at, last_login_at
       FROM users WHERE email = ?`,
      [email],
    );

    if (rows.length > 0) {
      res.json({ success: true, exists: true, patient: rows[0] });
    } else {
      res.json({ success: true, exists: false });
    }
  } catch (error) {
    console.error("Error checking user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/auth/create-user
 * Create a new user
 */
const handleCreateUser: RequestHandler = async (req, res) => {
  try {
    const { email, first_name, last_name, phone, date_of_birth } = req.body;

    if (!email || !first_name || !last_name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Email, first name, last name, and phone are required",
      });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query<any[]>(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const fullName = `${first_name} ${last_name}`;
    const [result] = await pool.query<any>(
      `INSERT INTO users (email, name, phone, is_active, created_at)
       VALUES (?, ?, ?, 1, NOW())`,
      [email, fullName, phone],
    );

    const userId = result.insertId;

    // Get the created user
    const [users] = await pool.query<any[]>(
      `SELECT id, email, name, phone, created_at
       FROM users WHERE id = ?`,
      [userId],
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: users[0],
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/auth/send-code
 * Send verification code to user's email
 */
const handleSendCode: RequestHandler = async (req, res) => {
  try {
    console.log("🔵 sendCode endpoint called");
    console.log("   Request body:", req.body);

    const { user_id, email } = req.body;

    if (!user_id || !email) {
      console.log("❌ Missing user_id or email");
      return res.status(400).json({
        success: false,
        message: "User ID and email are required",
      });
    }

    console.log("   User ID:", user_id);
    console.log("   Email:", email);

    // Get user name from DB
    console.log("📊 Querying user from database...");
    const [userRows] = await pool.query<any[]>(
      "SELECT name, email FROM users WHERE id = ?",
      [user_id],
    );

    if (userRows.length === 0) {
      console.log("❌ User not found in database");
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userName = userRows[0].name || userRows[0].email.split("@")[0];
    console.log("✅ User found:", userName);

    // Delete old session codes for this user
    console.log("🗑️  Deleting old session codes...");
    await pool.query("DELETE FROM users_sessions WHERE user_id = ?", [user_id]);

    // Generate session code (fixed for test email, random otherwise)
    let session_code: number;
    if (email === "test@intelipadel.com") {
      session_code = 123456;
      console.log("🧪 Using test code:", session_code);
    } else {
      // Generate unique code
      let isUnique = false;
      do {
        session_code = Math.floor(100000 + Math.random() * 900000);
        const [existingCodes] = await pool.query<any[]>(
          "SELECT COUNT(*) as count FROM users_sessions WHERE session_code = ?",
          [session_code],
        );
        isUnique = existingCodes[0].count === 0;
      } while (!isUnique);
      console.log("🔢 Generated unique code:", session_code);
    }

    // Insert new session code
    console.log("💾 Inserting session code into database...");
    const date_start = new Date();
    await pool.query(
      `INSERT INTO users_sessions (user_id, session_code, user_session, user_session_date_start)
       VALUES (?, ?, 0, ?)`,
      [user_id, session_code, date_start],
    );
    console.log("✅ Session code saved");

    // Send email with verification code
    console.log("📧 Calling sendVerificationEmail...");
    const emailSent = await sendVerificationEmail(
      email,
      userName,
      session_code,
    );

    if (emailSent) {
      console.log("✅ Email sent successfully");
      res.json({
        success: true,
        message: "Verification code sent",
        // Remove this in production - only for testing
        debug_code:
          process.env.NODE_ENV === "development" ? session_code : undefined,
      });
    } else {
      console.log("❌ Email sending failed");
      res.status(500).json({ success: false, message: "Failed to send email" });
    }
  } catch (error) {
    console.error("❌ Error in sendCode endpoint:", error);
    if (error instanceof Error) {
      console.error("   Error name:", error.name);
      console.error("   Error message:", error.message);
      console.error("   Error stack:", error.stack);
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/auth/verify-code
 * Verify the code and login the user
 */
const handleVerifyCode: RequestHandler = async (req, res) => {
  try {
    const { user_id, code } = req.body;

    if (!user_id || !code) {
      return res.status(400).json({
        success: false,
        message: "User ID and code are required",
      });
    }

    // Check if code matches
    const [sessions] = await pool.query<any[]>(
      `SELECT id, user_id, session_code, user_session, user_session_date_start
       FROM users_sessions
       WHERE user_id = ? AND session_code = ?`,
      [user_id, code],
    );

    console.log("🔍 Verify Code Debug:");
    console.log("   Looking for user_id:", user_id, "code:", code);
    console.log("   Found sessions:", sessions.length);
    if (sessions.length > 0) {
      console.log("   Session data:", sessions[0]);
    }

    if (sessions.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid code - no matching session found",
      });
    }

    // Check if code expired (10 minutes)
    const sessionDate = new Date(sessions[0].user_session_date_start);
    const now = new Date();
    const minutesPassed = (now.getTime() - sessionDate.getTime()) / (1000 * 60);

    if (minutesPassed > 10) {
      return res.status(401).json({
        success: false,
        message: "Code has expired. Please request a new one.",
      });
    }

    // Mark session as active
    await pool.query(
      "UPDATE users_sessions SET user_session = 1 WHERE id = ?",
      [sessions[0].id],
    );

    // Update last login
    await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = ?", [
      user_id,
    ]);

    // Get updated user data
    const [users] = await pool.query<any[]>(
      `SELECT id, email, name, phone, is_active, created_at, last_login_at
       FROM users WHERE id = ?`,
      [user_id],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    res.json({
      success: true,
      patient: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        is_active: user.is_active,
        created_at: user.created_at,
        last_login_at: user.last_login_at,
      },
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ success: false, message: "Failed to verify code" });
  }
};

/**
 * POST /api/bookings
 * Create a new booking
 */
const handleCreateBooking: RequestHandler = async (req, res) => {
  try {
    const {
      user_id,
      club_id,
      court_id,
      time_slot_id,
      booking_date,
      start_time,
      end_time,
      duration_minutes,
      total_price,
    } = req.body;

    if (!user_id || !club_id || !court_id || !booking_date || !start_time) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Generate booking number
    const bookingNumber = `BK${Date.now()}`;

    const [result] = await pool.query<any>(
      `INSERT INTO bookings (
        booking_number,
        user_id,
        club_id,
        court_id,
        time_slot_id,
        booking_date,
        start_time,
        end_time,
        duration_minutes,
        total_price,
        status,
        payment_status,
        confirmed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'pending', NOW())`,
      [
        bookingNumber,
        user_id,
        club_id,
        court_id,
        time_slot_id,
        booking_date,
        start_time,
        end_time,
        duration_minutes || 90,
        total_price,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        id: result.insertId,
        booking_number: bookingNumber,
        status: "confirmed",
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get courts for a club
 */
const handleGetCourts: RequestHandler = async (req, res) => {
  try {
    const { clubId } = req.params;

    const [courts] = await pool.query(
      `SELECT * FROM courts WHERE club_id = ? AND is_active = 1 ORDER BY display_order`,
      [clubId],
    );

    res.json({
      success: true,
      data: courts,
    });
  } catch (error) {
    console.error("Error fetching courts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get availability for a specific club and date range
 * Includes: time slots, existing bookings, blocked slots
 */
const handleGetAvailability: RequestHandler = async (req, res) => {
  try {
    const { clubId, startDate, endDate, courtId } = req.query;

    if (!clubId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "clubId, startDate, and endDate are required",
      });
    }

    // Get club schedule
    const [schedules]: any = await pool.query(
      `SELECT * FROM club_schedules WHERE club_id = ?`,
      [clubId],
    );

    // Get blocked slots for the date range
    const [blockedSlots]: any = await pool.query(
      `SELECT * FROM blocked_slots 
       WHERE club_id = ? 
       AND block_date BETWEEN ? AND ?
       ${courtId ? "AND (court_id = ? OR court_id IS NULL)" : ""}`,
      courtId
        ? [clubId, startDate, endDate, courtId]
        : [clubId, startDate, endDate],
    );

    // Get existing bookings for the date range
    const [bookings]: any = await pool.query(
      `SELECT b.*, c.name as court_name 
       FROM bookings b
       LEFT JOIN courts c ON b.court_id = c.id
       WHERE b.club_id = ? 
       AND b.booking_date BETWEEN ? AND ?
       AND b.status IN ('confirmed', 'pending')
       ${courtId ? "AND b.court_id = ?" : ""}`,
      courtId
        ? [clubId, startDate, endDate, courtId]
        : [clubId, startDate, endDate],
    );

    // Get all courts for the club
    const [courts]: any = await pool.query(
      `SELECT * FROM courts WHERE club_id = ? AND is_active = 1 ${courtId ? "AND id = ?" : ""} ORDER BY display_order`,
      courtId ? [clubId, courtId] : [clubId],
    );

    // Get events for the date range (tournaments, clinics, etc.)
    const [events]: any = await pool.query(
      `SELECT * FROM events 
       WHERE club_id = ? 
       AND event_date BETWEEN ? AND ?
       AND status IN ('open', 'full', 'in_progress')`,
      [clubId, startDate, endDate],
    );

    // Get private classes for the date range
    const [privateClasses]: any = await pool.query(
      `SELECT * FROM private_classes 
       WHERE club_id = ? 
       AND class_date BETWEEN ? AND ?
       AND status IN ('confirmed', 'pending')
       ${courtId ? "AND court_id = ?" : ""}`,
      courtId
        ? [clubId, startDate, endDate, courtId]
        : [clubId, startDate, endDate],
    );

    res.json({
      success: true,
      data: {
        schedules,
        blockedSlots,
        bookings,
        courts,
        events,
        privateClasses,
      },
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch availability",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ==================== PAYMENT HANDLERS ====================

/**
 * Create Stripe Payment Intent
 * POST /api/payment/create-intent
 */
const handleCreatePaymentIntent: RequestHandler = async (req, res) => {
  try {
    const {
      user_id,
      club_id,
      court_id,
      booking_date,
      start_time,
      end_time,
      duration_minutes,
      total_price,
    } = req.body;

    if (
      !user_id ||
      !club_id ||
      !court_id ||
      !booking_date ||
      !start_time ||
      !end_time ||
      !total_price
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total_price * 100), // Convert to cents
      currency: "mxn",
      metadata: {
        user_id: user_id.toString(),
        club_id: club_id.toString(),
        court_id: court_id.toString(),
        booking_date,
        start_time,
        end_time,
      },
    });

    // Generate transaction number
    const transactionNumber = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create pending payment transaction record
    const [result] = await pool.execute(
      `INSERT INTO payment_transactions (
        transaction_number, user_id, club_id, transaction_type,
        amount, currency, status, payment_provider,
        stripe_payment_intent_id, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        transactionNumber,
        user_id,
        club_id,
        "booking",
        total_price,
        "MXN",
        "pending",
        "stripe",
        paymentIntent.id,
        JSON.stringify({
          court_id,
          booking_date,
          start_time,
          end_time,
          duration_minutes,
        }),
      ],
    );

    const transactionId = (result as any).insertId;

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      transactionId,
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment intent",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Confirm Payment and Create Booking
 * POST /api/payment/confirm
 */
const handleConfirmPayment: RequestHandler = async (req, res) => {
  try {
    const {
      payment_intent_id,
      user_id,
      club_id,
      court_id,
      booking_date,
      start_time,
      end_time,
      duration_minutes,
      total_price,
    } = req.body;

    if (!payment_intent_id) {
      return res.status(400).json({
        success: false,
        message: "Payment intent ID is required",
      });
    }

    // Initialize Stripe and retrieve payment intent
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    const paymentIntent =
      await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Payment has not been completed",
      });
    }

    // Generate booking number
    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // First, create the time_slot entry
      const [timeSlotResult] = await connection.execute(
        `INSERT INTO time_slots (
          court_id, date, start_time, end_time, duration_minutes, 
          price, is_available, availability_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, 'booked', NOW(), NOW())`,
        [
          court_id,
          booking_date,
          start_time,
          end_time,
          duration_minutes || 60,
          total_price,
        ],
      );

      const timeSlotId = (timeSlotResult as any).insertId;

      // Create booking
      const [bookingResult] = await connection.execute(
        `INSERT INTO bookings (
          booking_number, user_id, club_id, court_id, time_slot_id, booking_date,
          start_time, end_time, duration_minutes, total_price,
          status, payment_status, payment_method, stripe_payment_intent_id, confirmed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          bookingNumber,
          user_id,
          club_id,
          court_id,
          timeSlotId,
          booking_date,
          start_time,
          end_time,
          duration_minutes || 60,
          total_price,
          "confirmed",
          "paid",
          "card",
          payment_intent_id,
        ],
      );

      const bookingId = (bookingResult as any).insertId;

      // Update payment transaction
      await connection.execute(
        `UPDATE payment_transactions 
         SET status = 'completed', 
             booking_id = ?,
             stripe_charge_id = ?,
             paid_at = NOW(),
             updated_at = NOW()
         WHERE stripe_payment_intent_id = ?`,
        [bookingId, paymentIntent.latest_charge, payment_intent_id],
      );

      // Get user details for email
      const [userRows]: any = await connection.execute(
        "SELECT email, name FROM users WHERE id = ?",
        [user_id],
      );
      const user = userRows[0];

      // Get club and court details
      const [clubRows]: any = await connection.execute(
        "SELECT name, email FROM clubs WHERE id = ?",
        [club_id],
      );
      const club = clubRows[0];

      const [courtRows]: any = await connection.execute(
        "SELECT name FROM courts WHERE id = ?",
        [court_id],
      );
      const court = courtRows[0];

      // Commit transaction
      await connection.commit();
      connection.release();

      // Send confirmation email (async, don't wait)
      sendBookingConfirmationEmail(
        user.email,
        user.name,
        bookingNumber,
        club.name,
        court.name,
        booking_date,
        start_time,
        end_time,
        total_price,
      ).catch((error) => {
        console.error("Failed to send confirmation email:", error);
      });

      res.json({
        success: true,
        data: {
          bookingId,
          bookingNumber,
        },
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm payment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Send booking confirmation email
 */
async function sendBookingConfirmationEmail(
  email: string,
  userName: string,
  bookingNumber: string,
  clubName: string,
  courtName: string,
  bookingDate: string,
  startTime: string,
  endTime: string,
  totalPrice: number,
): Promise<void> {
  try {
    let transportConfig: any;

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      const testAccount = await nodemailer.createTestAccount();
      transportConfig = {
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      };
    } else {
      transportConfig = {
        host: process.env.SMTP_HOST || "mail.disruptinglabs.com",
        port: parseInt(process.env.SMTP_PORT || "465"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { background-color: white; border-radius: 10px; padding: 30px; max-width: 600px; margin: 0 auto; }
          .header { background-color: #10b981; color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .booking-details { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
          .total { font-size: 20px; font-weight: bold; color: #10b981; }
          .footer { color: #666; font-size: 12px; text-align: center; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Reserva Confirmada!</h1>
          </div>
          <p>Hola ${userName},</p>
          <p>Tu reserva ha sido confirmada exitosamente. Aquí están los detalles:</p>
          <div class="booking-details">
            <div class="detail-row">
              <span class="label">Número de Reserva:</span>
              <span class="value">${bookingNumber}</span>
            </div>
            <div class="detail-row">
              <span class="label">Club:</span>
              <span class="value">${clubName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Cancha:</span>
              <span class="value">${courtName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Fecha:</span>
              <span class="value">${bookingDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">Horario:</span>
              <span class="value">${startTime} - ${endTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">Total Pagado:</span>
              <span class="value total">$${totalPrice.toFixed(2)} MXN</span>
            </div>
          </div>
          <p>Te esperamos en ${clubName}. ¡Disfruta tu partido!</p>
          <div class="footer">
            <p>InteliPadel - Tu plataforma de reservas de pádel</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"InteliPadel" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Confirmación de Reserva - ${bookingNumber}`,
      html: emailBody,
    });

    console.log("Booking confirmation email sent to:", email);
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error);
    throw error;
  }
}

// ==================== CLUB POLICIES HANDLERS ====================

/**
 * GET /api/clubs/:clubId/policies/:policyType
 * Get active policy for a club (terms, privacy, or cancellation)
 */
const handleGetClubPolicy: RequestHandler = async (req, res) => {
  try {
    const { clubId, policyType } = req.params;

    // Validate policy type
    const validTypes = ["terms", "privacy", "cancellation"];
    if (!validTypes.includes(policyType)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid policy type. Must be 'terms', 'privacy', or 'cancellation'",
      });
    }

    // Determine table and fields based on policy type
    let tableName: string;
    let selectFields: string;
    let notFoundMessage: string;

    switch (policyType) {
      case "terms":
        tableName = "club_terms_conditions";
        selectFields =
          "id, club_id, version, content, effective_date, created_at, updated_at";
        notFoundMessage = "Terms and conditions not found for this club";
        break;
      case "privacy":
        tableName = "club_privacy_policy";
        selectFields =
          "id, club_id, version, content, effective_date, created_at, updated_at";
        notFoundMessage = "Privacy policy not found for this club";
        break;
      case "cancellation":
        tableName = "club_cancellation_policy";
        selectFields =
          "id, club_id, version, content, hours_before_cancellation, refund_percentage, effective_date, created_at, updated_at";
        notFoundMessage = "Cancellation policy not found for this club";
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid policy type",
        });
    }

    const [rows] = await pool.query<any[]>(
      `SELECT ${selectFields}
       FROM ${tableName}
       WHERE club_id = ? AND is_active = 1
       ORDER BY effective_date DESC, created_at DESC
       LIMIT 1`,
      [clubId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: notFoundMessage,
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error(
      `Error fetching club ${req.params.policyType} policy:`,
      error,
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch policy",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ==================== BOOKING MANAGEMENT HANDLERS ====================

/**
 * POST /api/bookings/:id/cancel
 * Cancel a booking
 */
const handleCancelBooking: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellation_reason, user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Get booking to verify ownership and status
    const [bookings] = await pool.query<any[]>(
      `SELECT id, user_id, status, booking_date, start_time 
       FROM bookings WHERE id = ?`,
      [id],
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    // Verify ownership
    if (booking.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to cancel this booking",
      });
    }

    // Check if already cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // Check if booking is in the past
    const bookingDateTime = new Date(
      `${booking.booking_date} ${booking.start_time}`,
    );
    const now = new Date();
    if (bookingDateTime < now) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel past bookings",
      });
    }

    // Update booking status
    await pool.query(
      `UPDATE bookings 
       SET status = 'cancelled',
           cancellation_reason = ?,
           cancelled_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [cancellation_reason || null, id],
    );

    // Update time slot availability
    await pool.query(
      `UPDATE time_slots 
       SET is_available = 1, 
           availability_status = 'available',
           updated_at = NOW()
       WHERE id = (SELECT time_slot_id FROM bookings WHERE id = ?)`,
      [id],
    );

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/bookings/:id/request-invoice
 * Request an invoice for a booking
 */
const handleRequestInvoice: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Get booking to verify ownership and status
    const [bookings] = await pool.query<any[]>(
      `SELECT b.id, b.user_id, b.status, b.payment_status, b.factura_requested,
              c.name as club_name, c.email as club_email,
              u.email as user_email, u.name as user_name
       FROM bookings b
       JOIN clubs c ON b.club_id = c.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [id],
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    // Verify ownership
    if (booking.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to request invoice for this booking",
      });
    }

    // Check if payment is completed
    if (booking.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Invoice can only be requested for paid bookings",
      });
    }

    // Check if already requested
    if (booking.factura_requested) {
      return res.json({
        success: true,
        message: "Invoice has already been requested",
      });
    }

    // Update booking to mark invoice requested
    await pool.query(
      `UPDATE bookings 
       SET factura_requested = 1,
           factura_requested_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [id],
    );

    // Send notification email to club
    try {
      let transportConfig: any;

      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        const testAccount = await nodemailer.createTestAccount();
        transportConfig = {
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        };
      } else {
        transportConfig = {
          host: process.env.SMTP_HOST || "mail.disruptinglabs.com",
          port: parseInt(process.env.SMTP_PORT || "465"),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        };
      }

      const transporter = nodemailer.createTransport(transportConfig);

      await transporter.sendMail({
        from:
          process.env.SMTP_FROM || `"InteliPadel" <${process.env.SMTP_USER}>`,
        to: booking.club_email,
        subject: `Solicitud de Factura - Reserva #${id}`,
        html: `
          <h2>Solicitud de Factura</h2>
          <p>El usuario ${booking.user_name} (${booking.user_email}) ha solicitado una factura para la reserva #${id}.</p>
          <p>Por favor, genera y envía la factura a la brevedad posible.</p>
        `,
      });

      console.log("Invoice request notification sent to club");
    } catch (emailError) {
      console.error("Failed to send invoice request notification:", emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: "Invoice request submitted successfully",
    });
  } catch (error) {
    console.error("Error requesting invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to request invoice",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * PUT /api/users/:id
 * Update user profile information
 */
const handleUpdateUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, requesting_user_id } = req.body;

    // Verify the requesting user is updating their own profile
    if (parseInt(id) !== requesting_user_id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile",
      });
    }

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Update user information
    await pool.query(
      `UPDATE users 
       SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name.trim(), phone?.trim() || null, id],
    );

    // Fetch updated user data
    const [users] = await pool.query<any[]>(
      `SELECT id, email, name, phone, avatar_url, stripe_customer_id, 
              is_active, created_at, updated_at, last_login_at
       FROM users 
       WHERE id = ?`,
      [id],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found after update",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: users[0],
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ==================== SERVER INITIALIZATION ====================

// Create the Express app once (reused across invocations)
let app: express.Application | null = null;

function createServer() {
  console.log("Creating Express server for Vercel...");

  const expressApp = express();

  // Middleware
  expressApp.use(cors());
  expressApp.use(express.json({ limit: "10mb" }));
  expressApp.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Log requests
  expressApp.use((req, _res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // ==================== CONFIGURE API ROUTES ====================

  // Health check
  expressApp.get("/api/health", handleHealth);

  // Ping endpoint
  expressApp.get("/api/ping", handlePing);

  // Clubs routes
  expressApp.get("/api/clubs", handleGetClubs);
  expressApp.get("/api/clubs/:id", handleGetClubById);
  expressApp.get(
    "/api/clubs/:clubId/policies/:policyType",
    handleGetClubPolicy,
  );

  // Bookings routes
  expressApp.get("/api/bookings", handleGetBookings);
  expressApp.post("/api/bookings", handleCreateBooking);
  expressApp.post("/api/bookings/:id/cancel", handleCancelBooking);
  expressApp.post("/api/bookings/:id/request-invoice", handleRequestInvoice);
  expressApp.get("/api/availability", handleGetAvailability);
  expressApp.get("/api/courts/:clubId", handleGetCourts);

  // Auth routes
  expressApp.post("/api/auth/check-user", handleCheckUser);
  expressApp.post("/api/auth/create-user", handleCreateUser);
  expressApp.post("/api/auth/send-code", handleSendCode);
  expressApp.post("/api/auth/verify-code", handleVerifyCode);

  // User routes
  expressApp.put("/api/users/:id", handleUpdateUser);

  // Payment routes
  expressApp.post("/api/payment/create-intent", handleCreatePaymentIntent);
  expressApp.post("/api/payment/confirm", handleConfirmPayment);

  // 404 handler - only for API routes
  expressApp.use("/api", (_req, res, next) => {
    if (!res.headersSent) {
      res.status(404).json({
        success: false,
        message: "API endpoint not found",
      });
    } else {
      next();
    }
  });

  // Error handler
  expressApp.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error("Express error:", err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message,
      });
    },
  );

  return expressApp;
}

function getApp() {
  if (!app) {
    console.log("Initializing Express app for serverless...");
    app = createServer();
  }
  return app;
}

// Export createServer for development use
export { createServer };

// Export handler for Vercel serverless
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const expressApp = getApp();
    expressApp(req as any, res as any);
  } catch (error) {
    console.error("API Handler Error:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: {
          code: "500",
          message: "A server error has occurred",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }
};
