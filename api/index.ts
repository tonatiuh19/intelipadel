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
      `SELECT id, email, name as first_name, name as last_name, phone, created_at, last_login_at as last_login
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
      "SELECT name FROM users WHERE id = ?",
      [user_id],
    );

    if (userRows.length === 0) {
      console.log("❌ User not found in database");
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userName = userRows[0].name;
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
    const nameParts = user.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    res.json({
      success: true,
      patient: {
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        phone: user.phone,
        role: "user",
        is_active: user.is_active,
        is_email_verified: true,
        created_at: user.created_at,
        last_login: user.last_login_at,
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

  // Bookings routes
  expressApp.get("/api/bookings", handleGetBookings);
  expressApp.post("/api/bookings", handleCreateBooking);

  // Auth routes
  expressApp.post("/api/auth/check-user", handleCheckUser);
  expressApp.post("/api/auth/create-user", handleCreateUser);
  expressApp.post("/api/auth/send-code", handleSendCode);
  expressApp.post("/api/auth/verify-code", handleVerifyCode);

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
