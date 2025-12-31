import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import type { RequestHandler } from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";
import type { Event, EventCourtSchedule, CreateEventData } from "@shared/types";

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
    console.log("� Sending user verification email");
    console.log("   User email:", email);
    console.log("   User name:", userName);

    // Always use configured SMTP settings for both dev and prod
    const transportConfig = {
      host: process.env.SMTP_HOST || "mail.disruptinglabs.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_SECURE === "true" || true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    if (!transportConfig.auth.user || !transportConfig.auth.pass) {
      console.error("❌ SMTP credentials not configured!");
      console.log("   Please set SMTP_USER and SMTP_PASSWORD in .env file");
      return false;
    }

    console.log("📧 Using SMTP settings:");
    console.log("   Host:", transportConfig.host);
    console.log("   Port:", transportConfig.port);
    console.log("   Secure:", transportConfig.secure);
    console.log("   User:", transportConfig.auth.user);

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

    console.log("✅ User verification email sent successfully!");
    console.log("   Message ID:", info.messageId);
    console.log("   Target:", email);
    console.log("   Code:", code);

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

/**
 * Helper function to send admin verification email
 */
async function sendAdminVerificationEmail(
  email: string,
  adminName: string,
  code: number,
): Promise<boolean> {
  try {
    console.log("🔐 Sending admin verification email");
    console.log("   Admin email:", email);
    console.log("   Admin name:", adminName);

    // Always use configured SMTP settings for both dev and prod
    const transportConfig = {
      host: process.env.SMTP_HOST || "mail.disruptinglabs.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_SECURE === "true" || true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    if (!transportConfig.auth.user || !transportConfig.auth.pass) {
      console.error("❌ SMTP credentials not configured!");
      console.log("   Please set SMTP_USER and SMTP_PASSWORD in .env file");
      return false;
    }

    console.log("📧 Using SMTP settings:");
    console.log("   Host:", transportConfig.host);
    console.log("   Port:", transportConfig.port);
    console.log("   Secure:", transportConfig.secure);
    console.log("   User:", transportConfig.auth.user);

    // Configure email transporter
    const transporter = nodemailer.createTransport(transportConfig);

    // Verify SMTP connection
    console.log("🔍 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified!");

    // Admin-specific email template
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background-color: #f4f4f4; 
            padding: 20px; 
            margin: 0;
          }
          .container { 
            background-color: white; 
            border-radius: 10px; 
            padding: 30px; 
            max-width: 600px; 
            margin: 0 auto;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }
          .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .code { 
            font-size: 36px; 
            font-weight: bold; 
            color: #667eea; 
            text-align: center; 
            padding: 25px; 
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 8px; 
            margin: 25px 0;
            letter-spacing: 8px;
          }
          .info-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-box p {
            margin: 5px 0;
            color: #856404;
            font-size: 14px;
          }
          .footer { 
            color: #666; 
            font-size: 12px; 
            text-align: center; 
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
          }
          .security-note {
            background-color: #e7f3ff;
            border-left: 4px solid #2196f3;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 13px;
            color: #0c5460;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ InteliPadel Admin Panel</h1>
            <p>Código de Verificación Administrativo</p>
          </div>
          
          <h2 style="color: #333; margin-top: 0;">Hola ${adminName},</h2>
          <p style="color: #555; line-height: 1.6;">
            Has solicitado acceso al panel de administración de InteliPadel. 
            Por favor, utiliza el siguiente código para completar tu inicio de sesión:
          </p>
          
          <div class="code">${code}</div>
          
          <div class="info-box">
            <p><strong>⏱️ Validez:</strong> Este código expirará en <strong>15 minutos</strong></p>
            <p><strong>🔐 Tipo:</strong> Acceso Administrativo</p>
          </div>
          
          <div class="security-note">
            <strong>🔒 Nota de Seguridad:</strong> Este código proporciona acceso administrativo al sistema. 
            Si no solicitaste este código, por favor contacta al administrador del sistema inmediatamente.
          </div>
          
          <p style="color: #777; font-size: 14px; margin-top: 20px;">
            Este es un correo automático del sistema administrativo. Los códigos de verificación 
            son únicos y de un solo uso.
          </p>
          
          <div class="footer">
            <p><strong>InteliPadel</strong> - Panel de Administración</p>
            <p>Sistema de gestión de reservas de pádel</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log("📤 Sending admin verification email...");
    const info = await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        `"InteliPadel Admin" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `${code} - Código de Acceso Administrativo InteliPadel`,
      html: emailBody,
    });

    console.log("✅ Admin verification email sent successfully!");
    console.log("   Message ID:", info.messageId);
    console.log("   Target:", email);
    console.log("   Code:", code);

    return true;
  } catch (error) {
    console.error("❌ Error sending admin verification email:", error);
    if (error instanceof Error) {
      console.error("   Error name:", error.name);
      console.error("   Error message:", error.message);
      console.error("   Error stack:", error.stack);
    }
    return false;
  }
}

/**
 * Helper function to send welcome email
 */
async function sendWelcomeEmail(
  email: string,
  userName: string,
  isManualCreation: boolean = false,
  clubName: string = "InteliPadel",
): Promise<boolean> {
  try {
    console.log("👋 Sending welcome email");
    console.log("   User email:", email);
    console.log("   User name:", userName);
    console.log("   Manual creation:", isManualCreation);
    console.log("   Club:", clubName);

    // Always use configured SMTP settings
    const transportConfig = {
      host: process.env.SMTP_HOST || "mail.disruptinglabs.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_SECURE === "true" || true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    if (!transportConfig.auth.user || !transportConfig.auth.pass) {
      console.error("❌ SMTP credentials not configured!");
      return false;
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport(transportConfig);

    // Verify SMTP connection
    await transporter.verify();

    // Welcome email template
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background-color: #f4f4f4; 
            padding: 20px; 
            margin: 0;
          }
          .container { 
            background-color: white; 
            border-radius: 10px; 
            padding: 40px; 
            max-width: 600px; 
            margin: 0 auto;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.95;
          }
          .welcome-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .content {
            color: #333;
            line-height: 1.8;
          }
          .content h2 {
            color: #10b981;
            margin-top: 0;
          }
          .features {
            background-color: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
          }
          .features h3 {
            margin-top: 0;
            color: #059669;
            font-size: 18px;
          }
          .features ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .features li {
            margin: 8px 0;
            color: #065f46;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .footer { 
            color: #666; 
            font-size: 12px; 
            text-align: center; 
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="welcome-icon">🎾</div>
            <h1>¡Bienvenido a ${clubName}!</h1>
            <p>Tu cuenta ha sido creada exitosamente</p>
          </div>
          
          <div class="content">
            <h2>Hola ${userName},</h2>
            <p>
              ${
                isManualCreation
                  ? `Un administrador ha creado tu cuenta en ${clubName}.`
                  : `¡Gracias por registrarte en ${clubName}!`
              }
              Ahora puedes disfrutar de la mejor experiencia para reservar tus partidos de pádel.
            </p>
            
            <div class="features">
              <h3>✨ ¿Qué puedes hacer ahora?</h3>
              <ul>
                <li>🏟️ <strong>Reservar pistas</strong> en los mejores clubes</li>
                <li>📅 <strong>Ver tu historial</strong> de reservas</li>
                <li>🎯 <strong>Registrarte en eventos</strong> y torneos</li>
                <li>👥 <strong>Gestionar tus datos</strong> de perfil</li>
                <li>💳 <strong>Pagos seguros</strong> con Stripe</li>
              </ul>
            </div>
            
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || "https://intelipadel.com"}" class="cta-button">
                Ir a InteliPadel
              </a>
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 25px;">
              Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. 
              ¡Estamos aquí para ayudarte!
            </p>
          </div>
          
          <div class="footer">
            <p><strong>${clubName}</strong></p>
            <p>Tu plataforma de reservas de pádel</p>
            <p style="margin-top: 10px; color: #999;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"${clubName}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `¡Bienvenido a ${clubName}! 🎾`,
      html: emailBody,
    });

    console.log("✅ Welcome email sent successfully!");
    console.log("   Message ID:", info.messageId);
    console.log("   Target:", email);

    return true;
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    if (error instanceof Error) {
      console.error("   Error name:", error.name);
      console.error("   Error message:", error.message);
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
 * Check if a user exists by email (and optionally club_id)
 */
const handleCheckUser: RequestHandler = async (req, res) => {
  try {
    const { email, club_id } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Check for user with club_id if provided, otherwise check without club scope
    const query = club_id
      ? `SELECT id, club_id, email, name, phone, avatar_url, stripe_customer_id, is_active, created_at, updated_at, last_login_at
         FROM users WHERE email = ? AND club_id = ?`
      : `SELECT id, club_id, email, name, phone, avatar_url, stripe_customer_id, is_active, created_at, updated_at, last_login_at
         FROM users WHERE email = ? AND club_id IS NULL`;

    const params = club_id ? [email, club_id] : [email];
    const [rows] = await pool.query<any[]>(query, params);

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
    const { email, first_name, last_name, phone, date_of_birth, club_id } =
      req.body;

    if (!email || !first_name || !last_name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Email, first name, last name, and phone are required",
      });
    }

    // Check if user already exists for this club
    const checkQuery = club_id
      ? "SELECT id FROM users WHERE email = ? AND club_id = ?"
      : "SELECT id FROM users WHERE email = ? AND club_id IS NULL";
    const checkParams = club_id ? [email, club_id] : [email];

    const [existingUsers] = await pool.query<any[]>(checkQuery, checkParams);

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists for this club",
      });
    }

    // Fetch club name if club_id is provided
    let clubName = "InteliPadel";
    if (club_id) {
      const [clubs] = await pool.query<any[]>(
        "SELECT name FROM clubs WHERE id = ?",
        [club_id],
      );
      if (clubs.length > 0) {
        clubName = clubs[0].name;
      }
    }

    // Create new user
    const fullName = `${first_name} ${last_name}`;
    const [result] = await pool.query<any>(
      `INSERT INTO users (club_id, email, name, phone, is_active, created_at)
       VALUES (?, ?, ?, ?, 1, NOW())`,
      [club_id || null, email, fullName, phone],
    );

    const userId = result.insertId;

    // Get the created user
    const [users] = await pool.query<any[]>(
      `SELECT id, club_id, email, name, phone, created_at
       FROM users WHERE id = ?`,
      [userId],
    );

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, fullName, false, clubName).catch((error) => {
      console.error("Failed to send welcome email:", error);
    });

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
 * POST /api/admin/bookings/manual
 * Create a manual booking (admin only)
 */
const handleCreateManualBooking: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const {
      user_id,
      club_id,
      court_id,
      booking_date,
      start_time,
      end_time,
      total_price,
      notes,
    } = req.body;

    // Verify admin has access to this club
    if (admin.club_id && club_id !== admin.club_id) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para crear reservas en este club",
      });
    }

    // Check if court exists and belongs to the club
    const [courts] = await pool.query<any[]>(
      "SELECT * FROM courts WHERE id = ? AND club_id = ?",
      [court_id, club_id],
    );

    if (courts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cancha no encontrada",
      });
    }

    // Verify admin exists in database
    const adminId = admin.admin_id || admin.id;
    const [admins] = await pool.query<any[]>(
      "SELECT id FROM admins WHERE id = ?",
      [adminId],
    );

    if (admins.length === 0) {
      console.error("Admin not found in database:", adminId);
      return res.status(403).json({
        success: false,
        message: "Sesión de administrador inválida",
      });
    }

    // Check for existing bookings at this time
    const [existingBookings] = await pool.query<any[]>(
      `SELECT * FROM bookings 
       WHERE court_id = ? 
       AND booking_date = ? 
       AND status IN ('pending', 'confirmed')
       AND (
         (start_time < ? AND end_time > ?) OR
         (start_time >= ? AND start_time < ?)
       )`,
      [court_id, booking_date, end_time, start_time, start_time, end_time],
    );

    if (existingBookings.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una reserva en este horario",
      });
    }

    // Calculate duration in minutes
    const durationMinutes = Math.round(
      (new Date(`2000-01-01 ${end_time}`).getTime() -
        new Date(`2000-01-01 ${start_time}`).getTime()) /
        (1000 * 60),
    );

    // Use transaction to create both time_slot and booking
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
          durationMinutes,
          total_price,
        ],
      );

      const timeSlotId = (timeSlotResult as any).insertId;

      // Create booking with manual payment method
      const bookingNumber = `BK${Date.now()}`;
      const [bookingResult] = await connection.execute(
        `INSERT INTO bookings (
          user_id, club_id, court_id, time_slot_id, booking_number, booking_date,
          start_time, end_time, duration_minutes, total_price, status, payment_status,
          payment_method, notes, created_by_admin_id, confirmed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid', 'manual', ?, ?, NOW())`,
        [
          user_id,
          club_id,
          court_id,
          timeSlotId,
          bookingNumber,
          booking_date,
          start_time,
          end_time,
          durationMinutes,
          total_price,
          notes || null,
          adminId,
        ],
      );

      const bookingId = (bookingResult as any).insertId;

      await connection.commit();
      connection.release();

      // Fetch the created booking with details
      const [bookings] = await pool.query<any[]>(
        `SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
                c.name as club_name, co.name as court_name
         FROM bookings b
         JOIN users u ON b.user_id = u.id
         JOIN clubs c ON b.club_id = c.id
         JOIN courts co ON b.court_id = co.id
         WHERE b.id = ?`,
        [bookingId],
      );

      const booking = bookings[0];

      // Send confirmation email (async, same as Stripe booking flow)
      sendBookingConfirmationEmail(
        booking.user_email,
        booking.user_name,
        bookingNumber,
        booking.club_name,
        booking.court_name,
        booking_date,
        start_time,
        end_time,
        total_price,
      ).catch((error) => {
        console.error(
          "Failed to send manual booking confirmation email:",
          error,
        );
      });

      res.json({
        success: true,
        data: booking,
        message: "Reserva manual creada exitosamente",
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error creating manual booking:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear la reserva manual",
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
 * Get instructors for a club
 * GET /api/instructors/:clubId
 */
const handleGetInstructors: RequestHandler = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { date } = req.query;

    let query = `
      SELECT DISTINCT i.id, i.club_id, i.name, i.email, i.phone, i.bio, 
             i.specialties, i.hourly_rate, i.avatar_url, i.rating, 
             i.review_count, i.is_active,
             ia.start_time, ia.end_time, ia.day_of_week
      FROM instructors i
      INNER JOIN instructor_availability ia ON i.id = ia.instructor_id
      WHERE i.club_id = ? AND i.is_active = 1 AND ia.is_active = 1
    `;

    const params: any[] = [clubId];

    // If date is provided, filter by day of week
    if (date && typeof date === "string") {
      // Get day of week from date (0 = Sunday, 6 = Saturday)
      // DAYOFWEEK returns 1-7 (1=Sunday), so we subtract 1 to match our 0-6 format
      query += ` AND ia.day_of_week = (DAYOFWEEK(?) - 1)`;
      params.push(date);
    }

    query += ` ORDER BY i.rating DESC, i.name ASC`;

    const [instructors] = await pool.query(query, params);

    // Parse specialties JSON field and group availability by instructor
    const instructorMap = new Map();
    (instructors as any[]).forEach((row) => {
      if (!instructorMap.has(row.id)) {
        instructorMap.set(row.id, {
          id: row.id,
          club_id: row.club_id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          bio: row.bio,
          specialties:
            typeof row.specialties === "string"
              ? JSON.parse(row.specialties)
              : row.specialties || [],
          hourly_rate: row.hourly_rate,
          avatar_url: row.avatar_url,
          rating: row.rating,
          review_count: row.review_count,
          is_active: row.is_active,
          availability: [],
        });
      }

      // Add availability slot to instructor
      instructorMap.get(row.id).availability.push({
        day_of_week: row.day_of_week,
        start_time: row.start_time,
        end_time: row.end_time,
      });
    });

    const parsedInstructors = Array.from(instructorMap.values());

    res.json({
      success: true,
      data: parsedInstructors,
    });
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch instructors",
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

    // Get events for the date range (tournaments, clinics, etc.) - parse courts_used JSON
    const [rawEvents]: any = await pool.query(
      `SELECT * FROM events 
       WHERE club_id = ? 
       AND event_date BETWEEN ? AND ?
       AND status IN ('open', 'full', 'in_progress')`,
      [clubId, startDate, endDate],
    );

    // Parse courts_used JSON field (handle both string and already-parsed object)
    const events = rawEvents.map((event: any) => ({
      ...event,
      courts_used:
        typeof event.courts_used === "string"
          ? JSON.parse(event.courts_used)
          : event.courts_used || [],
    }));

    // Get granular event court schedules (for events with specific court-time assignments)
    const [eventCourtSchedules]: any = await pool.query(
      `SELECT ecs.*, e.event_date 
       FROM event_court_schedules ecs
       JOIN events e ON ecs.event_id = e.id
       WHERE e.club_id = ? 
       AND e.event_date BETWEEN ? AND ?
       AND e.status IN ('open', 'full', 'in_progress')
       ${courtId ? "AND ecs.court_id = ?" : ""}`,
      courtId
        ? [clubId, startDate, endDate, courtId]
        : [clubId, startDate, endDate],
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
        eventCourtSchedules,
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

/**
 * Send event registration confirmation email
 */
async function sendEventRegistrationEmail(
  email: string,
  userName: string,
  registrationNumber: string,
  eventTitle: string,
  eventType: string,
  eventDate: string,
  startTime: string,
  endTime: string,
  clubName: string,
  registrationFee: number,
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

    const eventTypeLabels: Record<string, string> = {
      tournament: "Torneo",
      league: "Liga",
      clinic: "Clínica",
      social: "Social",
      championship: "Campeonato",
    };

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { background-color: white; border-radius: 10px; padding: 30px; max-width: 600px; margin: 0 auto; }
          .header { background-color: #ea580c; color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .event-badge { background-color: #fed7aa; color: #9a3412; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; font-weight: bold; }
          .event-details { background-color: #fff7ed; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ea580c; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #fed7aa; }
          .label { font-weight: bold; color: #9a3412; }
          .value { color: #333; }
          .total { font-size: 20px; font-weight: bold; color: #ea580c; }
          .footer { color: #666; font-size: 12px; text-align: center; margin-top: 30px; }
          .highlight { background-color: #fed7aa; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Inscripción Confirmada! 🏆</h1>
          </div>
          <p>Hola ${userName},</p>
          <p>Tu inscripción al evento ha sido confirmada exitosamente.</p>
          <div class="highlight">
            <span class="event-badge">${eventTypeLabels[eventType] || eventType}</span>
            <h2 style="margin: 10px 0; color: #9a3412;">${eventTitle}</h2>
          </div>
          <div class="event-details">
            <div class="detail-row">
              <span class="label">Número de Inscripción:</span>
              <span class="value">${registrationNumber}</span>
            </div>
            <div class="detail-row">
              <span class="label">Club:</span>
              <span class="value">${clubName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Fecha del Evento:</span>
              <span class="value">${eventDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">Horario:</span>
              <span class="value">${startTime} - ${endTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">Cuota de Inscripción:</span>
              <span class="value total">$${registrationFee.toFixed(2)} MXN</span>
            </div>
          </div>
          <p><strong>Importante:</strong> Llega al menos 15 minutos antes del inicio del evento para el registro.</p>
          <p>¡Nos vemos en ${clubName}. Mucha suerte!</p>
          <div class="footer">
            <p>InteliPadel - Tu plataforma de reservas y eventos de pádel</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"InteliPadel" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Confirmación de Inscripción - ${eventTitle}`,
      html: emailBody,
    });

    console.log("Event registration email sent to:", email);
  } catch (error) {
    console.error("Failed to send event registration email:", error);
    throw error;
  }
}

// ==================== EVENT REGISTRATION HANDLERS ====================

/**
 * Create Payment Intent for Event Registration
 * POST /api/events/payment/create-intent
 */
const handleCreateEventPaymentIntent: RequestHandler = async (req, res) => {
  try {
    const { user_id, event_id, registration_fee } = req.body;

    if (!user_id || !event_id || registration_fee === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Get event details
    const [events]: any = await pool.query(
      `SELECT e.*, c.name as club_name 
       FROM events e 
       JOIN clubs c ON e.club_id = c.id 
       WHERE e.id = ?`,
      [event_id],
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const event = events[0];

    // Check if event is open for registration
    if (event.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "Event is not open for registration",
      });
    }

    // Check if user is already registered
    const [participants]: any = await pool.query(
      "SELECT id FROM event_participants WHERE event_id = ? AND user_id = ?",
      [event_id, user_id],
    );

    if (participants.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    // Check if event is full
    if (
      event.max_participants &&
      event.current_participants >= event.max_participants
    ) {
      return res.status(400).json({
        success: false,
        message: "Event is full",
      });
    }

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(registration_fee * 100), // Convert to cents
      currency: "mxn",
      metadata: {
        user_id: user_id.toString(),
        event_id: event_id.toString(),
        event_title: event.title,
        transaction_type: "event_registration",
      },
    });

    // Generate transaction number
    const transactionNumber = `EVT${Date.now()}${Math.floor(Math.random() * 1000)}`;

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
        event.club_id,
        "event_registration",
        registration_fee,
        "MXN",
        "pending",
        "stripe",
        paymentIntent.id,
        JSON.stringify({
          event_id,
          event_title: event.title,
          event_date: event.event_date,
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
    console.error("Create event payment intent error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment intent",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Confirm Event Registration Payment
 * POST /api/events/payment/confirm
 */
const handleConfirmEventPayment: RequestHandler = async (req, res) => {
  try {
    const { payment_intent_id, user_id, event_id, registration_fee } = req.body;

    if (!payment_intent_id || !user_id || !event_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
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

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check again if user is already registered (race condition protection)
      const [existingParticipants]: any = await connection.query(
        "SELECT id FROM event_participants WHERE event_id = ? AND user_id = ?",
        [event_id, user_id],
      );

      if (existingParticipants.length > 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: "You are already registered for this event",
        });
      }

      // Generate registration number
      const registrationNumber = `REG${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Register participant
      const [participantResult] = await connection.execute(
        `INSERT INTO event_participants (
          event_id, user_id, registration_date, payment_status, status
        ) VALUES (?, ?, NOW(), 'paid', 'confirmed')`,
        [event_id, user_id],
      );

      const participantId = (participantResult as any).insertId;

      // Update event participant count
      await connection.execute(
        `UPDATE events 
         SET current_participants = current_participants + 1 
         WHERE id = ?`,
        [event_id],
      );

      // Update payment transaction
      await connection.execute(
        `UPDATE payment_transactions 
         SET status = 'completed',
             stripe_charge_id = ?,
             paid_at = NOW(),
             updated_at = NOW(),
             metadata = JSON_SET(metadata, '$.participant_id', ?)
         WHERE stripe_payment_intent_id = ?`,
        [paymentIntent.latest_charge, participantId, payment_intent_id],
      );

      // Get event and user details for email
      const [events]: any = await connection.execute(
        `SELECT e.*, c.name as club_name 
         FROM events e 
         JOIN clubs c ON e.club_id = c.id 
         WHERE e.id = ?`,
        [event_id],
      );
      const event = events[0];

      const [users]: any = await connection.execute(
        "SELECT email, name FROM users WHERE id = ?",
        [user_id],
      );
      const user = users[0];

      // Commit transaction
      await connection.commit();
      connection.release();

      // Send confirmation email (async, don't wait)
      sendEventRegistrationEmail(
        user.email,
        user.name,
        registrationNumber,
        event.title,
        event.event_type,
        event.event_date,
        event.start_time,
        event.end_time,
        event.club_name,
        parseFloat(registration_fee),
      ).catch((error) => {
        console.error("Failed to send event registration email:", error);
      });

      res.json({
        success: true,
        data: {
          participantId,
          registrationNumber,
          eventTitle: event.title,
        },
        message: "Event registration successful",
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Confirm event payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm event registration",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/admin/events/:eventId/participants
 * Get all participants for an event with user details and payment info
 */
const handleGetEventParticipants: RequestHandler = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [rows]: any = await pool.execute(
      `SELECT 
        ep.id as participant_id,
        ep.registration_date,
        ep.payment_status,
        ep.status,
        u.id as user_id,
        u.name,
        u.email,
        u.phone,
        pt.amount as payment_amount,
        pt.stripe_payment_intent_id,
        pt.paid_at
      FROM event_participants ep
      JOIN users u ON ep.user_id = u.id
      LEFT JOIN (
        SELECT 
          JSON_EXTRACT(metadata, '$.event_id') as event_id,
          JSON_EXTRACT(metadata, '$.user_id') as user_id,
          stripe_payment_intent_id,
          amount,
          paid_at,
          created_at
        FROM payment_transactions
        WHERE transaction_type = 'event_registration'
          AND JSON_EXTRACT(metadata, '$.event_id') = ?
        ORDER BY created_at DESC
      ) pt ON pt.event_id = ? AND pt.user_id = u.id
      WHERE ep.event_id = ?
      GROUP BY ep.id
      ORDER BY ep.registration_date DESC`,
      [eventId, eventId, eventId],
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get event participants error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event participants",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/admin/events/:eventId/participants
 * Manually add a participant to an event (follows same pattern as Stripe but with manual payment)
 */
const handleAddEventParticipant: RequestHandler = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { user_id, payment_status = "paid", notes } = req.body;
    const admin = (req as any).admin;

    // Validate required fields
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "El ID del jugador es requerido",
      });
    }

    // Check if event exists and get details
    const [events] = await pool.query<any[]>(
      "SELECT * FROM events WHERE id = ? AND club_id = ?",
      [eventId, admin.club_id],
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Evento no encontrado",
      });
    }

    const event = events[0];

    // Check if user exists
    const [users] = await pool.query<any[]>(
      "SELECT id, name, email FROM users WHERE id = ?",
      [user_id],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Jugador no encontrado",
      });
    }

    const user = users[0];

    // Verify admin exists
    const adminId = admin.admin_id || admin.id;
    const [admins] = await pool.query<any[]>(
      "SELECT id FROM admins WHERE id = ?",
      [adminId],
    );

    if (admins.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Sesión de administrador inválida",
      });
    }

    // Start transaction (same pattern as Stripe payment confirmation)
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if already registered (race condition protection, same as Stripe)
      const [existing] = await connection.query<any[]>(
        "SELECT id FROM event_participants WHERE event_id = ? AND user_id = ?",
        [eventId, user_id],
      );

      if (existing.length > 0) {
        await connection.rollback();
        connection.release();
        return res.status(409).json({
          success: false,
          message: "El jugador ya está registrado en este evento",
        });
      }

      // Check if event is full
      if (event.max_participants) {
        const [countResult] = await connection.query<any[]>(
          "SELECT COUNT(*) as count FROM event_participants WHERE event_id = ?",
          [eventId],
        );
        if (countResult[0].count >= event.max_participants) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({
            success: false,
            message: "El evento está lleno",
          });
        }
      }

      // Generate registration number
      const registrationNumber = `REG${Date.now()}`;

      // Add participant with 'confirmed' status (same as Stripe flow)
      // Note: registration_number and created_by_admin_id require migration 008
      const [participantResult] = await connection.execute(
        `INSERT INTO event_participants 
         (event_id, user_id, registration_date, payment_status, status, notes) 
         VALUES (?, ?, NOW(), ?, 'confirmed', ?)`,
        [eventId, user_id, payment_status, notes || null],
      );

      const participantId = (participantResult as any).insertId;

      // Update event participant count
      await connection.execute(
        "UPDATE events SET current_participants = current_participants + 1 WHERE id = ?",
        [eventId],
      );

      // Create payment transaction record (follows Stripe pattern but marks as manual)
      const transactionNumber = `TXN${Date.now()}`;
      await connection.execute(
        `INSERT INTO payment_transactions (
          transaction_number, user_id, club_id, transaction_type, event_participant_id, 
          amount, currency, status, payment_provider, metadata, created_at, paid_at
        ) VALUES (?, ?, ?, 'event', ?, ?, 'mxn', 'completed', 'manual', ?, NOW(), NOW())`,
        [
          transactionNumber,
          user_id,
          admin.club_id,
          participantId,
          event.registration_fee || 0,
          JSON.stringify({
            type: "event_registration",
            event_id: eventId,
            participant_id: participantId,
            created_by_admin_id: adminId,
            admin_name: admin.name,
            event_title: event.title,
            notes: notes || null,
          }),
        ],
      );

      // Commit transaction
      await connection.commit();
      connection.release();

      // Send confirmation email (async, same as Stripe flow)
      if (event.event_date && event.start_time) {
        const clubName = event.club_name || "Club";
        sendEventRegistrationEmail(
          user.email,
          user.name,
          registrationNumber,
          event.title,
          event.event_type,
          event.event_date,
          event.start_time,
          event.end_time,
          clubName,
          parseFloat(event.registration_fee || 0),
        ).catch((error) => {
          console.error("Error sending event registration email:", error);
        });
      }

      res.json({
        success: true,
        message: "Participante agregado exitosamente",
        data: { registrationNumber },
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Add event participant error:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar participante",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/users/:userId/event-registrations
 * Get all event registrations for a user
 */
const handleGetUserEventRegistrations: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows]: any = await pool.execute(
      `SELECT 
        ep.id as registration_id,
        ep.registration_date,
        ep.payment_status,
        ep.status,
        e.id as event_id,
        e.title,
        e.description,
        e.event_type,
        e.event_date,
        e.start_time,
        e.end_time,
        e.registration_fee,
        e.prize_pool,
        e.skill_level,
        c.id as club_id,
        c.name as club_name,
        c.address as club_address,
        pt.amount as payment_amount,
        pt.paid_at
      FROM event_participants ep
      JOIN events e ON ep.event_id = e.id
      JOIN clubs c ON e.club_id = c.id
      LEFT JOIN (
        SELECT 
          JSON_EXTRACT(metadata, '$.event_id') as event_id,
          JSON_EXTRACT(metadata, '$.user_id') as user_id,
          stripe_payment_intent_id,
          amount,
          paid_at,
          created_at
        FROM payment_transactions
        WHERE transaction_type = 'event_registration'
          AND JSON_EXTRACT(metadata, '$.user_id') = ?
        ORDER BY created_at DESC
      ) pt ON pt.event_id = e.id AND pt.user_id = ?
      WHERE ep.user_id = ?
      GROUP BY ep.id
      ORDER BY e.event_date DESC, e.start_time DESC`,
      [userId, userId, userId],
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get user event registrations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event registrations",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/users/:userId/private-classes
 * Get all private classes for a user
 */
const handleGetUserPrivateClasses: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows]: any = await pool.execute(
      `SELECT 
        pc.id,
        pc.booking_number,
        pc.class_date,
        pc.start_time,
        pc.end_time,
        pc.duration_minutes,
        pc.class_type,
        pc.number_of_students,
        pc.total_price,
        pc.status,
        pc.payment_status,
        pc.notes,
        pc.confirmed_at,
        pc.created_at,
        i.name as instructor_name,
        i.email as instructor_email,
        i.bio as instructor_bio,
        c.id as club_id,
        c.name as club_name,
        ct.id as court_id,
        ct.name as court_name
      FROM private_classes pc
      JOIN instructors i ON pc.instructor_id = i.id
      JOIN clubs c ON pc.club_id = c.id
      LEFT JOIN courts ct ON pc.court_id = ct.id
      WHERE pc.user_id = ?
      ORDER BY pc.class_date DESC, pc.start_time DESC`,
      [userId],
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get user private classes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch private classes",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ==================== PRIVATE CLASS BOOKING HANDLERS ====================

/**
 * Send private class confirmation email
 */
async function sendPrivateClassConfirmationEmail(
  email: string,
  userName: string,
  bookingNumber: string,
  classType: string,
  classDate: string,
  startTime: string,
  endTime: string,
  clubName: string,
  instructorName: string,
  totalPrice: number,
  numberOfStudents: number,
  focusAreas: string[] | null,
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

    const classTypeLabels: Record<string, string> = {
      individual: "Individual",
      group: "Grupal",
      semi_private: "Semi-Privada",
    };

    const focusAreasHtml =
      focusAreas && focusAreas.length > 0
        ? `
        <div class="detail-row">
          <span class="label">Áreas de Enfoque:</span>
          <span class="value">${focusAreas.join(", ")}</span>
        </div>
      `
        : "";

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { background-color: white; border-radius: 10px; padding: 30px; max-width: 600px; margin: 0 auto; }
          .header { background-color: #10b981; color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .class-badge { background-color: #d1fae5; color: #065f46; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; font-weight: bold; }
          .class-details { background-color: #f0fdf4; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #d1fae5; }
          .label { font-weight: bold; color: #065f46; }
          .value { color: #333; }
          .total { font-size: 20px; font-weight: bold; color: #10b981; }
          .footer { color: #666; font-size: 12px; text-align: center; margin-top: 30px; }
          .highlight { background-color: #d1fae5; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Clase Confirmada! 🎾</h1>
          </div>
          <p>Hola ${userName},</p>
          <p>Tu clase privada ha sido confirmada exitosamente.</p>
          <div class="highlight">
            <span class="class-badge">${classTypeLabels[classType] || classType}</span>
            <h2 style="margin: 10px 0; color: #065f46;">Clase Privada de Pádel</h2>
          </div>
          <div class="class-details">
            <div class="detail-row">
              <span class="label">Número de Reserva:</span>
              <span class="value">${bookingNumber}</span>
            </div>
            <div class="detail-row">
              <span class="label">Club:</span>
              <span class="value">${clubName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Instructor:</span>
              <span class="value">${instructorName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Fecha:</span>
              <span class="value">${classDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">Horario:</span>
              <span class="value">${startTime} - ${endTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">Tipo de Clase:</span>
              <span class="value">${classTypeLabels[classType] || classType}</span>
            </div>
            <div class="detail-row">
              <span class="label">Número de Estudiantes:</span>
              <span class="value">${numberOfStudents}</span>
            </div>
            ${focusAreasHtml}
            <div class="detail-row">
              <span class="label">Total:</span>
              <span class="value total">$${totalPrice.toFixed(2)} MXN</span>
            </div>
          </div>
          <p><strong>Importante:</strong> Llega al menos 10 minutos antes para prepararte y aprovechar al máximo tu clase.</p>
          <p>¡Nos vemos en ${clubName}!</p>
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
      subject: `Confirmación de Clase Privada - ${bookingNumber}`,
      html: emailBody,
    });

    console.log("Private class confirmation email sent to:", email);
  } catch (error) {
    console.error("Failed to send private class confirmation email:", error);
    throw error;
  }
}

/**
 * Create Payment Intent for Private Class
 * POST /api/private-classes/payment/create-intent
 */
const handleCreateClassPaymentIntent: RequestHandler = async (req, res) => {
  try {
    const {
      user_id,
      instructor_id,
      club_id,
      court_id,
      class_type,
      class_date,
      start_time,
      end_time,
      duration_minutes,
      number_of_students,
      total_price,
      focus_areas,
      student_level,
      notes,
    } = req.body;

    if (
      !user_id ||
      !instructor_id ||
      !club_id ||
      !class_type ||
      !class_date ||
      !start_time ||
      !end_time ||
      !duration_minutes ||
      total_price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if instructor exists
    const [instructors]: any = await pool.query(
      "SELECT id, name FROM instructors WHERE id = ? AND club_id = ? AND is_active = 1",
      [instructor_id, club_id],
    );

    if (instructors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found or not available",
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
        instructor_id: instructor_id.toString(),
        club_id: club_id.toString(),
        class_type,
        class_date,
        start_time,
        end_time,
        transaction_type: "private_class",
      },
    });

    // Generate transaction number
    const transactionNumber = `CLS${Date.now()}${Math.floor(Math.random() * 1000)}`;

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
        "private_class",
        total_price,
        "MXN",
        "pending",
        "stripe",
        paymentIntent.id,
        JSON.stringify({
          instructor_id,
          court_id,
          class_type,
          class_date,
          start_time,
          end_time,
          duration_minutes,
          number_of_students: number_of_students || 1,
          focus_areas,
          student_level,
          notes,
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
    console.error("Create class payment intent error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment intent",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Confirm Private Class Payment
 * POST /api/private-classes/payment/confirm
 */
const handleConfirmClassPayment: RequestHandler = async (req, res) => {
  try {
    const {
      payment_intent_id,
      user_id,
      instructor_id,
      club_id,
      court_id,
      class_type,
      class_date,
      start_time,
      end_time,
      duration_minutes,
      number_of_students,
      total_price,
      focus_areas,
      student_level,
      notes,
    } = req.body;

    if (!payment_intent_id || !user_id || !instructor_id || !club_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
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

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Generate booking number
      const bookingNumber = `PCL${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Create private class booking
      const [classResult] = await connection.execute(
        `INSERT INTO private_classes (
          booking_number, user_id, instructor_id, club_id, court_id,
          class_type, class_date, start_time, end_time, duration_minutes,
          number_of_students, total_price, status, payment_status,
          focus_areas, student_level, notes, confirmed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          bookingNumber,
          user_id,
          instructor_id,
          club_id,
          court_id || null,
          class_type,
          class_date,
          start_time,
          end_time,
          duration_minutes,
          number_of_students || 1,
          total_price,
          "confirmed",
          "paid",
          focus_areas ? JSON.stringify(focus_areas) : null,
          student_level || null,
          notes || null,
        ],
      );

      const classId = (classResult as any).insertId;

      // Update payment transaction
      await connection.execute(
        `UPDATE payment_transactions 
         SET status = 'completed',
             private_class_id = ?,
             stripe_charge_id = ?,
             paid_at = NOW(),
             updated_at = NOW()
         WHERE stripe_payment_intent_id = ?`,
        [classId, paymentIntent.latest_charge, payment_intent_id],
      );

      // Get class details for email
      const [classes]: any = await connection.execute(
        `SELECT pc.*, i.name as instructor_name, c.name as club_name
         FROM private_classes pc
         JOIN instructors i ON pc.instructor_id = i.id
         JOIN clubs c ON pc.club_id = c.id
         WHERE pc.id = ?`,
        [classId],
      );
      const privateClass = classes[0];

      const [users]: any = await connection.execute(
        "SELECT email, name FROM users WHERE id = ?",
        [user_id],
      );
      const user = users[0];

      // Commit transaction
      await connection.commit();
      connection.release();

      // Send confirmation email (async, don't wait)
      sendPrivateClassConfirmationEmail(
        user.email,
        user.name,
        bookingNumber,
        privateClass.class_type,
        privateClass.class_date,
        privateClass.start_time,
        privateClass.end_time,
        privateClass.club_name,
        privateClass.instructor_name,
        parseFloat(total_price),
        privateClass.number_of_students,
        focus_areas,
      ).catch((error) => {
        console.error("Failed to send class confirmation email:", error);
      });

      res.json({
        success: true,
        data: {
          classId,
          bookingNumber,
        },
        message: "Private class booking successful",
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Confirm class payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm class booking",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

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

// ==================== ADMIN API ENDPOINTS ====================

/**
 * POST /api/admin/auth/send-code
 * Send verification code to admin email
 */
const handleAdminSendCode: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if admin exists and is active
    const [admins] = await pool.query<any[]>(
      `SELECT a.id, a.email, a.name, a.role, a.club_id, a.is_active,
              c.name as club_name
       FROM admins a
       LEFT JOIN clubs c ON a.club_id = c.id
       WHERE a.email = ? AND a.is_active = 1`,
      [email],
    );

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Administrador no encontrado o inactivo",
      });
    }

    const admin = admins[0];

    // Additional validation for club admins
    if (admin.role === "club_admin" && !admin.club_id) {
      return res.status(403).json({
        success: false,
        message: "Admin de club debe estar asignado a un club",
      });
    }

    console.log("✅ Admin validated:", {
      email: admin.email,
      role: admin.role,
      club_id: admin.club_id,
      club_name: admin.club_name,
    });

    // Delete old auth codes for this admin
    await pool.query(
      "DELETE FROM auth_codes WHERE email = ? AND user_type = 'admin'",
      [email],
    );

    // Generate 6-digit code
    const code =
      email === "admin@intelipadel.com"
        ? "123456"
        : Math.floor(100000 + Math.random() * 900000).toString();

    // Insert new auth code
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await pool.query(
      `INSERT INTO auth_codes (email, code, user_type, expires_at, is_used) 
       VALUES (?, ?, 'admin', ?, 0)`,
      [email, code, expiresAt],
    );

    // Send admin verification email
    const emailSent = await sendAdminVerificationEmail(
      email,
      admin.name,
      parseInt(code),
    );

    res.json({
      success: true,
      message: emailSent
        ? "Verification code sent to your email"
        : "Code generated but email sending failed",
      // Include debug code in development
      debug_code: process.env.NODE_ENV === "development" ? code : undefined,
    });
  } catch (error) {
    console.error("Error sending admin verification code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification code",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/admin/auth/verify-code
 * Verify code and create admin session
 */
const handleAdminVerifyCode: RequestHandler = async (req, res) => {
  try {
    const { email, code } = req.body;

    console.log("🔍 Admin Verify Code Debug:");
    console.log("   Email:", email);
    console.log("   Code:", code);

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and code are required",
      });
    }

    // Check if code is valid (simplified - no expiration check, just match)
    const [codes] = await pool.query<any[]>(
      `SELECT * FROM auth_codes 
       WHERE email = ? AND code = ? AND user_type = 'admin' 
       AND is_used = 0`,
      [email, code],
    );

    console.log("   Found codes:", codes.length);
    if (codes.length > 0) {
      console.log("   Code data:", {
        id: codes[0].id,
        expires_at: codes[0].expires_at,
        is_used: codes[0].is_used,
      });
    }

    if (codes.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Código inválido o ya utilizado",
      });
    }

    // Mark code as used
    await pool.query("UPDATE auth_codes SET is_used = 1 WHERE id = ?", [
      codes[0].id,
    ]);

    // Get admin details with club info
    const [admins] = await pool.query<any[]>(
      `SELECT a.id, a.email, a.name, a.phone, a.role, a.club_id, a.is_active,
              c.name as club_name, c.logo_url as club_logo
       FROM admins a
       LEFT JOIN clubs c ON a.club_id = c.id
       WHERE a.email = ? AND a.is_active = 1`,
      [email],
    );

    console.log("   Found admins:", admins.length);

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found or inactive",
      });
    }

    const admin = admins[0];

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    console.log("   Creating session for admin:", admin.id);
    console.log(
      "   📝 Generated session token:",
      sessionToken.substring(0, 20) + "...",
    );
    console.log("   ⏰ Expires at:", expiresAt);

    // Create admin session
    await pool.query(
      `INSERT INTO admin_sessions (admin_id, session_token, expires_at, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        admin.id,
        sessionToken,
        expiresAt,
        req.ip,
        req.headers["user-agent"] || null,
      ],
    );

    console.log("   💾 Session saved to database");

    // Update last login
    await pool.query(
      "UPDATE admins SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?",
      [admin.id],
    );

    console.log("✅ Admin login successful!");

    res.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        phone: admin.phone,
        role: admin.role,
        club_id: admin.club_id,
        club_name: admin.club_name,
        club_logo: admin.club_logo,
        is_active: admin.is_active,
      },
      sessionToken,
    });
  } catch (error) {
    console.error("Error verifying admin code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify code",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/admin/auth/validate
 * Validate admin session
 */
const handleAdminValidateSession: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    console.log(
      "🔍 Validating session - Auth header:",
      authHeader?.substring(0, 20) + "...",
    );

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No valid Authorization header");
      return res.status(401).json({
        success: false,
        message: "No session token provided",
      });
    }

    const sessionToken = authHeader.substring(7);
    console.log("🔑 Validating token:", sessionToken.substring(0, 20) + "...");

    // Check if session exists and is valid (SIMPLIFIED - no is_active check)
    const [sessions] = await pool.query<any[]>(
      `SELECT s.*, a.id, a.email, a.name, a.phone, a.role, a.club_id, a.is_active,
              c.name as club_name, c.logo_url as club_logo
       FROM admin_sessions s
       JOIN admins a ON s.admin_id = a.id
       LEFT JOIN clubs c ON a.club_id = c.id
       WHERE s.session_token = ? AND s.expires_at > NOW()`,
      [sessionToken],
    );

    console.log("📊 Validate sessions found:", sessions.length);

    if (sessions.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    const session = sessions[0];

    // Update last activity
    await pool.query(
      "UPDATE admin_sessions SET last_activity_at = CURRENT_TIMESTAMP WHERE id = ?",
      [session.id],
    );

    res.json({
      success: true,
      admin: {
        id: session.id,
        email: session.email,
        name: session.name,
        phone: session.phone,
        role: session.role,
        club_id: session.club_id,
        club_name: session.club_name,
        club_logo: session.club_logo,
        is_active: session.is_active,
      },
    });
  } catch (error) {
    console.error("Error validating admin session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate session",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/admin/auth/logout
 * Logout admin and delete session
 */
const handleAdminLogout: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(200).json({ success: true });
    }

    const sessionToken = authHeader.substring(7);

    // Delete session
    await pool.query("DELETE FROM admin_sessions WHERE session_token = ?", [
      sessionToken,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error("Error logging out admin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Middleware to verify admin session
 */
const verifyAdminSession = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    console.log(
      "🔐 Verifying admin session - Auth header:",
      authHeader?.substring(0, 20) + "...",
    );

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No valid Authorization header");
      return res.status(401).json({
        success: false,
        message: "No session token provided",
      });
    }

    const sessionToken = authHeader.substring(7);
    console.log("🔑 Session token:", sessionToken.substring(0, 20) + "...");

    // SIMPLIFIED: Just check session exists and isn't expired
    const [sessions] = await pool.query<any[]>(
      `SELECT s.*, a.id as admin_id, a.email, a.name, a.role, a.club_id,
              c.name as club_name, c.logo_url as club_logo
       FROM admin_sessions s
       JOIN admins a ON s.admin_id = a.id
       LEFT JOIN clubs c ON a.club_id = c.id
       WHERE s.session_token = ? AND s.expires_at > NOW()`,
      [sessionToken],
    );

    console.log("📊 Sessions found:", sessions.length);

    if (sessions.length === 0) {
      console.log("❌ No valid session found for token");
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    console.log(
      "✅ Admin session verified:",
      sessions[0].email,
      sessions[0].role,
    );

    // Attach admin info (including club data) to request
    (req as any).admin = sessions[0];

    // Skip update for now to avoid any potential issues
    // TODO: Re-enable last activity tracking after debugging

    next();
  } catch (error) {
    console.error("Error verifying admin session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify session",
    });
  }
};

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard statistics
 */
const handleGetDashboardStats: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const clubFilter = admin.club_id
      ? `WHERE b.club_id = ${admin.club_id}`
      : "";

    // Total bookings
    const [bookingsCount] = await pool.query<any[]>(
      `SELECT COUNT(*) as total FROM bookings b ${clubFilter}`,
    );

    // Total revenue
    const [revenue] = await pool.query<any[]>(
      `SELECT SUM(b.total_price) as total FROM bookings b
       WHERE b.payment_status = 'paid' ${clubFilter ? "AND b.club_id = " + admin.club_id : ""}`,
    );

    // Total players
    const [playersCount] = await pool.query<any[]>(
      "SELECT COUNT(*) as total FROM users WHERE is_active = 1",
    );

    // Upcoming bookings
    const [upcomingCount] = await pool.query<any[]>(
      `SELECT COUNT(*) as total FROM bookings b
       WHERE b.booking_date >= CURDATE() AND b.status != 'cancelled' ${clubFilter ? "AND b.club_id = " + admin.club_id : ""}`,
    );

    // Recent bookings
    const [recentBookings] = await pool.query<any[]>(
      `SELECT b.*, u.name as user_name, u.email as user_email, 
              c.name as club_name, co.name as court_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN clubs c ON b.club_id = c.id
       JOIN courts co ON b.court_id = co.id
       ${clubFilter}
       ORDER BY b.created_at DESC
       LIMIT 10`,
    );

    res.json({
      success: true,
      data: {
        totalBookings: bookingsCount[0].total,
        totalRevenue: revenue[0].total || 0,
        totalPlayers: playersCount[0].total,
        upcomingBookings: upcomingCount[0].total,
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/admin/bookings
 * Get all bookings with filters
 */
const handleGetAdminBookings: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { startDate, endDate, status } = req.query;

    // Admin must have a club_id
    if (!admin.club_id) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Always filter by admin's club_id
    let query = `
      SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
             c.name as club_name, co.name as court_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN clubs c ON b.club_id = c.id
      JOIN courts co ON b.court_id = co.id
      WHERE b.club_id = ?
    `;

    const params: any[] = [admin.club_id];

    if (startDate) {
      query += " AND b.booking_date >= ?";
      params.push(startDate);
    }

    if (endDate) {
      query += " AND b.booking_date <= ?";
      params.push(endDate);
    }

    if (status) {
      query += " AND b.status = ?";
      params.push(status);
    }

    query += " ORDER BY b.booking_date DESC, b.start_time DESC LIMIT 200";

    const [bookings] = await pool.query<any[]>(query, params);

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching admin bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/admin/private-classes
 * Get all private classes with filters
 */
const handleGetAdminPrivateClasses: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { startDate, endDate, status } = req.query;

    // Admin must have a club_id
    if (!admin.club_id) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Query private classes for admin's club
    let query = `
      SELECT pc.*, 
             u.name as user_name, u.email as user_email, u.phone as user_phone,
             c.name as club_name, 
             co.name as court_name,
             i.name as instructor_name
      FROM private_classes pc
      JOIN users u ON pc.user_id = u.id
      JOIN clubs c ON pc.club_id = c.id
      LEFT JOIN courts co ON pc.court_id = co.id
      LEFT JOIN instructors i ON pc.instructor_id = i.id
      WHERE pc.club_id = ?
    `;

    const params: any[] = [admin.club_id];

    if (startDate) {
      query += " AND pc.class_date >= ?";
      params.push(startDate);
    }

    if (endDate) {
      query += " AND pc.class_date <= ?";
      params.push(endDate);
    }

    if (status) {
      query += " AND pc.status = ?";
      params.push(status);
    }

    query += " ORDER BY pc.class_date DESC, pc.start_time DESC LIMIT 200";

    const [classes] = await pool.query<any[]>(query, params);

    res.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error("Error fetching admin private classes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch private classes",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/admin/private-classes/manual
 * Create a manual private class booking
 */
const handleCreateManualPrivateClass: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const {
      user_id,
      instructor_id,
      club_id,
      court_id,
      class_date,
      start_time,
      end_time,
      class_type,
      number_of_students,
      total_price,
      notes,
    } = req.body;

    // Validate admin has access to this club
    if (admin.club_id !== club_id) {
      return res.status(403).json({
        success: false,
        error: "No tienes permiso para crear clases en este club",
      });
    }

    // Validate required fields
    if (
      !user_id ||
      !instructor_id ||
      !club_id ||
      !court_id ||
      !class_date ||
      !start_time ||
      !end_time ||
      !class_type ||
      !number_of_students ||
      total_price === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: "Faltan campos requeridos",
      });
    }

    // Check for conflicts - existing bookings
    const [conflicts] = await pool.query<any[]>(
      `SELECT id FROM bookings 
       WHERE court_id = ? 
       AND booking_date = ? 
       AND status IN ('confirmed', 'pending')
       AND (
         (start_time < ? AND end_time > ?) OR
         (start_time < ? AND end_time > ?) OR
         (start_time >= ? AND end_time <= ?)
       )`,
      [
        court_id,
        class_date,
        end_time,
        start_time,
        end_time,
        end_time,
        start_time,
        end_time,
      ],
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Ya existe una reserva en este horario",
      });
    }

    // Check for conflicts - existing classes
    const [classConflicts] = await pool.query<any[]>(
      `SELECT id FROM private_classes 
       WHERE court_id = ? 
       AND class_date = ? 
       AND status IN ('confirmed', 'pending')
       AND (
         (start_time < ? AND end_time > ?) OR
         (start_time < ? AND end_time > ?) OR
         (start_time >= ? AND end_time <= ?)
       )`,
      [
        court_id,
        class_date,
        end_time,
        start_time,
        end_time,
        end_time,
        start_time,
        end_time,
      ],
    );

    if (classConflicts.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Ya existe una clase en este horario",
      });
    }

    // Check for conflicts - existing events
    const [eventConflicts] = await pool.query<any[]>(
      `SELECT e.id FROM events e
       JOIN event_court_schedules ecs ON e.id = ecs.event_id
       WHERE ecs.court_id = ?
       AND e.event_date = ?
       AND e.status IN ('open', 'full', 'in_progress')
       AND (
         (ecs.start_time < ? AND ecs.end_time > ?) OR
         (ecs.start_time < ? AND ecs.end_time > ?) OR
         (ecs.start_time >= ? AND ecs.end_time <= ?)
       )`,
      [
        court_id,
        class_date,
        end_time,
        start_time,
        end_time,
        end_time,
        start_time,
        end_time,
      ],
    );

    if (eventConflicts.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Ya existe un evento en este horario",
      });
    }

    // Calculate duration in minutes
    const startParts = start_time.split(":");
    const endParts = end_time.split(":");
    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
    const durationMinutes = endMinutes - startMinutes;

    // Generate booking number
    const bookingNumber = `PCL${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // Insert the private class
    const [result] = await pool.query<any>(
      `INSERT INTO private_classes 
       (booking_number, user_id, instructor_id, club_id, court_id, class_date, start_time, end_time, 
        duration_minutes, class_type, number_of_students, total_price, status, payment_status, notes, 
        created_by_admin_id, confirmed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid', ?, ?, NOW())`,
      [
        bookingNumber,
        user_id,
        instructor_id,
        club_id,
        court_id,
        class_date,
        start_time,
        end_time,
        durationMinutes,
        class_type,
        number_of_students,
        total_price,
        notes || null,
        admin.id, // created_by_admin_id for audit tracking
      ],
    );

    res.json({
      success: true,
      data: {
        id: result.insertId,
        message: "Clase privada creada exitosamente",
      },
    });
  } catch (error) {
    console.error("Error creating manual private class:", error);
    res.status(500).json({
      success: false,
      error: "Error al crear la clase privada",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/admin/players
 * Get players for admin's club only
 */
const handleGetAdminPlayers: RequestHandler = async (req, res) => {
  try {
    console.log("📋 Fetching admin players...");
    const { search, limit = 100 } = req.query;

    // Get admin's club_id from session token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No session token provided",
      });
    }

    const sessionToken = authHeader.substring(7);

    // Get admin info from session
    const [sessions] = await pool.query<any[]>(
      `SELECT a.club_id, a.role
       FROM admin_sessions s
       JOIN admins a ON s.admin_id = a.id
       WHERE s.session_token = ? AND s.expires_at > NOW()`,
      [sessionToken],
    );

    if (sessions.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    const admin = sessions[0];
    console.log("👤 Admin club_id:", admin.club_id, "role:", admin.role);

    // Admin must have a club_id to see players
    if (!admin.club_id) {
      console.log("⚠️ Admin has no club_id - returning empty list");
      return res.json({
        success: true,
        data: [],
      });
    }

    // Build query - ALWAYS filter by admin's club_id
    let query = `
      SELECT u.*, 
             COUNT(DISTINCT b.id) as total_bookings,
             SUM(CASE WHEN b.payment_status = 'paid' THEN b.total_price ELSE 0 END) as total_spent
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      WHERE u.club_id = ?
    `;

    const params: any[] = [admin.club_id];
    console.log("🔒 Filtering players for club_id:", admin.club_id);

    if (search) {
      query += " AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += " GROUP BY u.id ORDER BY u.created_at DESC LIMIT ?";
    params.push(parseInt(limit as string));

    const [players] = await pool.query<any[]>(query, params);
    console.log("✅ Found", players.length, "players for admin's club");

    res.json({
      success: true,
      data: players,
    });
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch players",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Create a new player manually by admin
 */
const handleCreateAdminPlayer: RequestHandler = async (req, res) => {
  try {
    const { name, email, phone, club_id } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Nombre y email son requeridos",
      });
    }

    // If club_id not provided, try to get it from admin session
    let clubId = club_id;
    if (!clubId && req.body.admin_id) {
      const [admins] = await pool.query<any[]>(
        "SELECT club_id FROM admins WHERE id = ?",
        [req.body.admin_id],
      );
      if (admins.length > 0) {
        clubId = admins[0].club_id;
      }
    }

    // Fetch club name
    let clubName = "InteliPadel";
    if (clubId) {
      const [clubs] = await pool.query<any[]>(
        "SELECT name FROM clubs WHERE id = ?",
        [clubId],
      );
      if (clubs.length > 0) {
        clubName = clubs[0].name;
      }
    }

    // Check if email already exists for this club
    const checkQuery = clubId
      ? "SELECT id FROM users WHERE email = ? AND club_id = ?"
      : "SELECT id FROM users WHERE email = ? AND club_id IS NULL";
    const checkParams = clubId ? [email, clubId] : [email];

    const [existingUsers] = await pool.query<any[]>(checkQuery, checkParams);

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un jugador con este email en este club",
      });
    }

    // Create the player
    const [result] = await pool.query<any>(
      `INSERT INTO users (club_id, name, email, phone, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
      [clubId || null, name, email, phone || null],
    );

    // Fetch the created player
    const [players] = await pool.query<any[]>(
      "SELECT * FROM users WHERE id = ?",
      [result.insertId],
    );

    // Send welcome email (non-blocking, mark as manual creation)
    sendWelcomeEmail(email, name, true, clubName).catch((error) => {
      console.error("Failed to send welcome email:", error);
    });

    res.json({
      success: true,
      data: players[0],
      message: "Jugador creado exitosamente",
    });
  } catch (error) {
    console.error("Error creating player:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el jugador",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/admin/instructors
 * Get all instructors for admin management
 */
const handleGetAdminInstructors: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;

    // Admin must have a club_id
    if (!admin.club_id) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Always filter by admin's club_id
    const query = `
      SELECT i.*, c.name as club_name
      FROM instructors i
      JOIN clubs c ON i.club_id = c.id
      WHERE i.club_id = ?
      ORDER BY i.name
    `;

    const params: any[] = [admin.club_id];

    const [instructors] = await pool.query<any[]>(query, params);

    res.json({
      success: true,
      data: instructors,
    });
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch instructors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/admin/instructors
 * Create new instructor
 */
const handleCreateAdminInstructor: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const {
      name,
      email,
      phone,
      bio,
      specialties,
      years_of_experience,
      rating,
      hourly_rate,
      profile_image_url,
      is_active,
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Club admin can only create instructors for their club
    if (!admin.club_id) {
      return res.status(403).json({
        success: false,
        message: "You must be associated with a club to create instructors",
      });
    }

    const [result] = await pool.query<any>(
      `INSERT INTO instructors 
       (club_id, name, email, phone, bio, specialties, years_of_experience, rating, hourly_rate, profile_image_url, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        admin.club_id,
        name,
        email,
        phone || null,
        bio || null,
        specialties || null,
        years_of_experience || 0,
        rating || 5.0,
        hourly_rate,
        profile_image_url || null,
        is_active !== undefined ? is_active : 1,
      ],
    );

    // Fetch the created instructor
    const [instructors] = await pool.query<any[]>(
      `SELECT i.*, c.name as club_name
       FROM instructors i
       JOIN clubs c ON i.club_id = c.id
       WHERE i.id = ?`,
      [result.insertId],
    );

    res.json({
      success: true,
      data: instructors[0],
      message: "Instructor creado exitosamente",
    });
  } catch (error) {
    console.error("Error creating instructor:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el instructor",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * PUT /api/admin/instructors/:id
 * Update instructor
 */
const handleUpdateAdminInstructor: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      bio,
      specialties,
      years_of_experience,
      rating,
      hourly_rate,
      profile_image_url,
      is_active,
    } = req.body;

    // Check if instructor exists and belongs to admin's club
    const [instructors] = await pool.query<any[]>(
      `SELECT * FROM instructors WHERE id = ? AND club_id = ?`,
      [id, admin.club_id],
    );

    if (instructors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found or access denied",
      });
    }

    await pool.query(
      `UPDATE instructors 
       SET name = ?, email = ?, phone = ?, bio = ?, specialties = ?, 
           years_of_experience = ?, rating = ?, hourly_rate = ?, 
           profile_image_url = ?, is_active = ?
       WHERE id = ? AND club_id = ?`,
      [
        name,
        email,
        phone || null,
        bio || null,
        specialties || null,
        years_of_experience || 0,
        rating || 5.0,
        hourly_rate,
        profile_image_url || null,
        is_active !== undefined ? is_active : 1,
        id,
        admin.club_id,
      ],
    );

    // Fetch updated instructor
    const [updatedInstructors] = await pool.query<any[]>(
      `SELECT i.*, c.name as club_name
       FROM instructors i
       JOIN clubs c ON i.club_id = c.id
       WHERE i.id = ?`,
      [id],
    );

    res.json({
      success: true,
      data: updatedInstructors[0],
      message: "Instructor actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating instructor:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el instructor",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * DELETE /api/admin/instructors/:id
 * Delete instructor
 */
const handleDeleteAdminInstructor: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { id } = req.params;

    // Check if instructor exists and belongs to admin's club
    const [instructors] = await pool.query<any[]>(
      `SELECT * FROM instructors WHERE id = ? AND club_id = ?`,
      [id, admin.club_id],
    );

    if (instructors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found or access denied",
      });
    }

    // Check if instructor has any private classes
    const [classes] = await pool.query<any[]>(
      `SELECT COUNT(*) as count FROM private_classes WHERE instructor_id = ?`,
      [id],
    );

    if (classes[0].count > 0) {
      return res.status(400).json({
        success: false,
        message:
          "No se puede eliminar el instructor porque tiene clases asociadas",
      });
    }

    await pool.query(`DELETE FROM instructors WHERE id = ? AND club_id = ?`, [
      id,
      admin.club_id,
    ]);

    res.json({
      success: true,
      message: "Instructor eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting instructor:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el instructor",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/admin/instructors/:id/availability
 * Get instructor availability schedule
 */
const handleGetInstructorAvailability: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { id } = req.params;

    // Verify instructor belongs to admin's club
    const [instructors] = await pool.query<any[]>(
      `SELECT * FROM instructors WHERE id = ? AND club_id = ?`,
      [id, admin.club_id],
    );

    if (instructors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found or access denied",
      });
    }

    const [availability] = await pool.query<any[]>(
      `SELECT * FROM instructor_availability 
       WHERE instructor_id = ? AND is_active = 1
       ORDER BY day_of_week, start_time`,
      [id],
    );

    res.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Error fetching instructor availability:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch availability",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/admin/instructors/:id/availability
 * Add availability slot for instructor
 */
const handleAddInstructorAvailability: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { id } = req.params;
    const { day_of_week, start_time, end_time } = req.body;

    // Verify instructor belongs to admin's club
    const [instructors] = await pool.query<any[]>(
      `SELECT * FROM instructors WHERE id = ? AND club_id = ?`,
      [id, admin.club_id],
    );

    if (instructors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found or access denied",
      });
    }

    // Validate input
    if (day_of_week < 0 || day_of_week > 6 || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability data",
      });
    }

    const [result] = await pool.query<any>(
      `INSERT INTO instructor_availability 
       (instructor_id, day_of_week, start_time, end_time) 
       VALUES (?, ?, ?, ?)`,
      [id, day_of_week, start_time, end_time],
    );

    const [newSlot] = await pool.query<any[]>(
      `SELECT * FROM instructor_availability WHERE id = ?`,
      [result.insertId],
    );

    res.json({
      success: true,
      data: newSlot[0],
      message: "Disponibilidad agregada exitosamente",
    });
  } catch (error) {
    console.error("Error adding instructor availability:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar disponibilidad",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * DELETE /api/admin/instructors/availability/:availabilityId
 * Delete availability slot
 */
const handleDeleteInstructorAvailability: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { availabilityId } = req.params;

    // Verify availability slot belongs to instructor in admin's club
    const [slots] = await pool.query<any[]>(
      `SELECT ia.*, i.club_id 
       FROM instructor_availability ia
       JOIN instructors i ON ia.instructor_id = i.id
       WHERE ia.id = ? AND i.club_id = ?`,
      [availabilityId, admin.club_id],
    );

    if (slots.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Availability slot not found or access denied",
      });
    }

    await pool.query(`DELETE FROM instructor_availability WHERE id = ?`, [
      availabilityId,
    ]);

    res.json({
      success: true,
      message: "Disponibilidad eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error deleting instructor availability:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar disponibilidad",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/admin/courts
 * Get all courts for admin management
 */
const handleGetAdminCourts: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;

    // Admin must have a club_id
    if (!admin.club_id) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Always filter by admin's club_id
    const query = `
      SELECT co.*, c.name as club_name
      FROM courts co
      JOIN clubs c ON co.club_id = c.id
      WHERE co.club_id = ?
      ORDER BY c.name, co.name
    `;

    const params: any[] = [admin.club_id];

    const [courts] = await pool.query<any[]>(query, params);

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
 * POST /api/admin/courts
 * Create new court
 */
const handleCreateCourt: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { club_id, name, court_type, is_active } = req.body;

    // Club admin can only create courts for their club
    if (
      admin.role === "club_admin" &&
      admin.club_id &&
      admin.club_id !== club_id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only create courts for your club",
      });
    }

    const [result] = await pool.query<any>(
      `INSERT INTO courts (club_id, name, court_type, is_active) 
       VALUES (?, ?, ?, ?)`,
      [club_id, name, court_type, is_active ?? 1],
    );

    res.json({
      success: true,
      message: "Court created successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("Error creating court:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create court",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * PUT /api/admin/courts/:id
 * Update court
 */
const handleUpdateCourt: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { id } = req.params;
    const { name, type, is_active } = req.body;

    // Filter by admin's club
    if (admin.club_id) {
      const [courts] = await pool.query<any[]>(
        "SELECT club_id FROM courts WHERE id = ?",
        [id],
      );

      if (courts.length === 0 || courts[0].club_id !== admin.club_id) {
        return res.status(403).json({
          success: false,
          message: "You can only update courts for your club",
        });
      }
    }

    await pool.query(
      `UPDATE courts SET name = ?, court_type = ?, is_active = ? WHERE id = ?`,
      [name, type, is_active, id],
    );

    // Fetch the updated court with club name
    const [updatedCourts] = await pool.query<any[]>(
      `SELECT c.*, cl.name as club_name 
       FROM courts c 
       LEFT JOIN clubs cl ON c.club_id = cl.id 
       WHERE c.id = ?`,
      [id],
    );

    res.json({
      success: true,
      message: "Court updated successfully",
      data: updatedCourts[0],
    });
  } catch (error) {
    console.error("Error updating court:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update court",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/admin/blocked-slots
 * Get blocked slots
 */
const handleGetBlockedSlots: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { startDate, endDate } = req.query;

    // Admin must have a club_id
    if (!admin.club_id) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Always filter by admin's club_id
    let query = `
      SELECT bs.*, c.name as club_name, co.name as court_name, a.name as created_by_name
      FROM blocked_slots bs
      JOIN clubs c ON bs.club_id = c.id
      LEFT JOIN courts co ON bs.court_id = co.id
      LEFT JOIN admins a ON bs.created_by_admin_id = a.id
      WHERE bs.club_id = ?
    `;

    const params: any[] = [admin.club_id];

    if (startDate) {
      query += " AND bs.block_date >= ?";
      params.push(startDate);
    }

    if (endDate) {
      query += " AND bs.block_date <= ?";
      params.push(endDate);
    }

    query += " ORDER BY bs.block_date DESC, bs.start_time DESC";

    const [slots] = await pool.query<any[]>(query, params);

    res.json({
      success: true,
      data: slots,
    });
  } catch (error) {
    console.error("Error fetching blocked slots:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blocked slots",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/admin/blocked-slots
 * Create blocked slot
 */
const handleCreateBlockedSlot: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const {
      club_id,
      court_id,
      block_type,
      block_date,
      start_time,
      end_time,
      is_all_day,
      reason,
      notes,
    } = req.body;

    if (
      admin.role === "club_admin" &&
      admin.club_id &&
      admin.club_id !== club_id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only create blocked slots for your club",
      });
    }

    const [result] = await pool.query<any>(
      `INSERT INTO blocked_slots 
       (club_id, court_id, block_type, block_date, start_time, end_time, is_all_day, reason, notes, created_by_admin_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        club_id,
        court_id,
        block_type,
        block_date,
        start_time,
        end_time,
        is_all_day ?? 0,
        reason,
        notes,
        admin.admin_id,
      ],
    );

    res.json({
      success: true,
      message: "Blocked slot created successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("Error creating blocked slot:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create blocked slot",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * DELETE /api/admin/blocked-slots/:id
 * Delete blocked slot
 */
const handleDeleteBlockedSlot: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { id } = req.params;

    if (admin.role === "club_admin" && admin.club_id) {
      const [slots] = await pool.query<any[]>(
        "SELECT club_id FROM blocked_slots WHERE id = ?",
        [id],
      );

      if (slots.length === 0 || slots[0].club_id !== admin.club_id) {
        return res.status(403).json({
          success: false,
          message: "You can only delete blocked slots for your club",
        });
      }
    }

    await pool.query("DELETE FROM blocked_slots WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Blocked slot deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blocked slot:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete blocked slot",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/admin/admins
 * Get all admin users (super admin only)
 */
const handleGetAdmins: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;

    if (admin.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admins can view admin users",
      });
    }

    // Only show admins from the same club
    const query = admin.club_id
      ? `SELECT a.*, c.name as club_name
         FROM admins a
         LEFT JOIN clubs c ON a.club_id = c.id
         WHERE a.club_id = ?
         ORDER BY a.created_at DESC`
      : `SELECT a.*, c.name as club_name
         FROM admins a
         LEFT JOIN clubs c ON a.club_id = c.id
         ORDER BY a.created_at DESC`;

    const params = admin.club_id ? [admin.club_id] : [];
    const [admins] = await pool.query<any[]>(query, params);

    res.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admins",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/admin/admins
 * Create new admin (super admin only)
 */
const handleCreateAdmin: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;

    if (admin.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admins can create admin users",
      });
    }

    const { email, name, phone, role, club_id } = req.body;

    const [result] = await pool.query<any>(
      `INSERT INTO admins (email, name, phone, role, club_id, is_active) 
       VALUES (?, ?, ?, ?, ?, 1)`,
      [email, name, phone, role, club_id],
    );

    res.json({
      success: true,
      message: "Admin created successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create admin",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * PUT /api/admin/admins/:id
 * Update admin (super admin only)
 */
const handleUpdateAdmin: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;

    if (admin.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admins can update admin users",
      });
    }

    const { id } = req.params;
    const { name, phone, role, club_id, is_active } = req.body;

    await pool.query(
      `UPDATE admins SET name = ?, phone = ?, role = ?, club_id = ?, is_active = ? WHERE id = ?`,
      [name, phone, role, club_id, is_active, id],
    );

    res.json({
      success: true,
      message: "Admin updated successfully",
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update admin",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * PUT /api/admin/clubs/:id/policies/:policyType
 * Update club policy (HTML content)
 */
/**
 * GET /api/admin/events
 * Get all events for admin's club
 */
const handleGetAdminEvents: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;

    // Admin must have a club_id
    if (!admin.club_id) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Always filter by admin's club_id
    const query = `
      SELECT e.*, c.name as club_name
      FROM events e
      JOIN clubs c ON e.club_id = c.id
      WHERE e.club_id = ?
      ORDER BY e.event_date DESC, e.start_time ASC
    `;

    const params: any[] = [admin.club_id];

    const [events] = await pool.query<any[]>(query, params);

    // Fetch court schedules for all events
    const eventIds = events.map((e) => e.id);
    let courtSchedules: any[] = [];

    if (eventIds.length > 0) {
      const [schedules] = await pool.query<any[]>(
        `SELECT * FROM event_court_schedules WHERE event_id IN (?)`,
        [eventIds],
      );
      courtSchedules = schedules;
    }

    // Attach court schedules to events
    const eventsWithSchedules = events.map((event) => ({
      ...event,
      court_schedules: courtSchedules.filter((s) => s.event_id === event.id),
    }));

    res.json({
      success: true,
      data: eventsWithSchedules,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/admin/events
 * Create new event
 */
const handleCreateAdminEvent: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const {
      club_id,
      event_type,
      title,
      description,
      event_date,
      start_time,
      end_time,
      max_participants,
      registration_fee,
      prize_pool,
      skill_level,
      status,
      courts_used,
      court_schedules,
      image_url,
      rules,
      organizer_name,
      organizer_email,
    } = req.body as CreateEventData;

    // Verify club access
    if (admin.club_id && club_id !== admin.club_id) {
      return res.status(403).json({
        success: false,
        message: "You can only create events for your club",
      });
    }

    // Check for existing bookings that would conflict with this event
    const courtsToCheck = courts_used;
    let bookingConflicts: any[] = [];

    if (court_schedules && court_schedules.length > 0) {
      // Check each court schedule for conflicts
      for (const schedule of court_schedules) {
        const [conflicts] = await pool.query<any[]>(
          `SELECT b.id, b.booking_date, b.start_time, b.end_time, b.court_id, 
                  c.name as court_name, u.name as user_name
           FROM bookings b
           JOIN courts c ON b.court_id = c.id
           LEFT JOIN users u ON b.user_id = u.id
           WHERE b.court_id = ?
           AND b.booking_date = ?
           AND b.status IN ('pending', 'confirmed')
           AND (
             (b.start_time < ? AND b.end_time > ?) OR
             (b.start_time >= ? AND b.start_time < ?)
           )`,
          [
            schedule.court_id,
            event_date,
            schedule.end_time,
            schedule.start_time,
            schedule.start_time,
            schedule.end_time,
          ],
        );
        bookingConflicts.push(...conflicts);
      }
    } else {
      // No specific court schedules - check all courts for the entire event time
      for (const courtId of courtsToCheck) {
        const [conflicts] = await pool.query<any[]>(
          `SELECT b.id, b.booking_date, b.start_time, b.end_time, b.court_id, 
                  c.name as court_name, u.name as user_name
           FROM bookings b
           JOIN courts c ON b.court_id = c.id
           LEFT JOIN users u ON b.user_id = u.id
           WHERE b.court_id = ?
           AND b.booking_date = ?
           AND b.status IN ('pending', 'confirmed')
           AND (
             (b.start_time < ? AND b.end_time > ?) OR
             (b.start_time >= ? AND b.start_time < ?)
           )`,
          [courtId, event_date, end_time, start_time, start_time, end_time],
        );
        bookingConflicts.push(...conflicts);
      }
    }

    if (bookingConflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede crear el evento. Existen reservas confirmadas en las canchas seleccionadas durante este horario.",
        conflicts: bookingConflicts.map((c) => ({
          booking_id: c.id,
          court_name: c.court_name,
          user_name: c.user_name,
          date: c.booking_date,
          time: `${c.start_time} - ${c.end_time}`,
        })),
      });
    }

    const [result] = await pool.query<any>(
      `INSERT INTO events (
        club_id, event_type, title, description, event_date, 
        start_time, end_time, max_participants, registration_fee, 
        prize_pool, skill_level, status, courts_used, image_url, 
        rules, organizer_name, organizer_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        club_id,
        event_type,
        title,
        description,
        event_date,
        start_time,
        end_time,
        max_participants,
        registration_fee,
        prize_pool,
        skill_level,
        status,
        JSON.stringify(courts_used),
        image_url,
        rules,
        organizer_name,
        organizer_email,
      ],
    );

    const eventId = result.insertId;

    // Insert court schedules if provided (granular court-time assignments)
    if (court_schedules && court_schedules.length > 0) {
      const scheduleValues = court_schedules.map((schedule) => [
        eventId,
        schedule.court_id,
        schedule.start_time,
        schedule.end_time,
        schedule.notes || null,
      ]);

      await pool.query(
        `INSERT INTO event_court_schedules 
         (event_id, court_id, start_time, end_time, notes) 
         VALUES ?`,
        [scheduleValues],
      );
    }

    // Fetch created event with club name and court schedules
    const [events] = await pool.query<any[]>(
      `SELECT e.*, c.name as club_name
       FROM events e
       JOIN clubs c ON e.club_id = c.id
       WHERE e.id = ?`,
      [eventId],
    );

    const [schedules] = await pool.query<any[]>(
      `SELECT * FROM event_court_schedules WHERE event_id = ?`,
      [eventId],
    );

    const eventData = {
      ...events[0],
      court_schedules: schedules,
    };

    res.json({
      success: true,
      data: eventData,
      message: "Event created successfully",
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * PUT /api/admin/events/:id
 * Update event
 */
const handleUpdateAdminEvent: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { id } = req.params;
    const {
      event_type,
      title,
      description,
      event_date,
      start_time,
      end_time,
      max_participants,
      registration_fee,
      prize_pool,
      skill_level,
      status,
      courts_used,
      court_schedules,
      image_url,
      rules,
      organizer_name,
      organizer_email,
    } = req.body;

    // Verify event belongs to admin's club
    if (admin.club_id) {
      const [events] = await pool.query<any[]>(
        "SELECT club_id FROM events WHERE id = ?",
        [id],
      );

      if (events.length === 0 || events[0].club_id !== admin.club_id) {
        return res.status(403).json({
          success: false,
          message: "You can only update events for your club",
        });
      }
    }

    // Check for existing bookings that would conflict with the updated event
    const courtsToCheck = courts_used;
    let bookingConflicts: any[] = [];

    if (court_schedules && court_schedules.length > 0) {
      // Check each court schedule for conflicts
      for (const schedule of court_schedules) {
        const [conflicts] = await pool.query<any[]>(
          `SELECT b.id, b.booking_date, b.start_time, b.end_time, b.court_id, 
                  c.name as court_name, u.name as user_name
           FROM bookings b
           JOIN courts c ON b.court_id = c.id
           LEFT JOIN users u ON b.user_id = u.id
           WHERE b.court_id = ?
           AND b.booking_date = ?
           AND b.status IN ('pending', 'confirmed')
           AND (
             (b.start_time < ? AND b.end_time > ?) OR
             (b.start_time >= ? AND b.start_time < ?)
           )`,
          [
            schedule.court_id,
            event_date,
            schedule.end_time,
            schedule.start_time,
            schedule.start_time,
            schedule.end_time,
          ],
        );
        bookingConflicts.push(...conflicts);
      }
    } else {
      // No specific court schedules - check all courts for the entire event time
      for (const courtId of courtsToCheck) {
        const [conflicts] = await pool.query<any[]>(
          `SELECT b.id, b.booking_date, b.start_time, b.end_time, b.court_id, 
                  c.name as court_name, u.name as user_name
           FROM bookings b
           JOIN courts c ON b.court_id = c.id
           LEFT JOIN users u ON b.user_id = u.id
           WHERE b.court_id = ?
           AND b.booking_date = ?
           AND b.status IN ('pending', 'confirmed')
           AND (
             (b.start_time < ? AND b.end_time > ?) OR
             (b.start_time >= ? AND b.start_time < ?)
           )`,
          [courtId, event_date, end_time, start_time, start_time, end_time],
        );
        bookingConflicts.push(...conflicts);
      }
    }

    if (bookingConflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede actualizar el evento. Existen reservas confirmadas en las canchas seleccionadas durante este horario.",
        conflicts: bookingConflicts.map((c) => ({
          booking_id: c.id,
          court_name: c.court_name,
          user_name: c.user_name,
          date: c.booking_date,
          time: `${c.start_time} - ${c.end_time}`,
        })),
      });
    }

    await pool.query(
      `UPDATE events SET 
        event_type = ?, title = ?, description = ?, event_date = ?,
        start_time = ?, end_time = ?, max_participants = ?, 
        registration_fee = ?, prize_pool = ?, skill_level = ?,
        status = ?, courts_used = ?, image_url = ?, rules = ?,
        organizer_name = ?, organizer_email = ?
       WHERE id = ?`,
      [
        event_type,
        title,
        description,
        event_date,
        start_time,
        end_time,
        max_participants,
        registration_fee,
        prize_pool,
        skill_level,
        status,
        JSON.stringify(courts_used),
        image_url,
        rules,
        organizer_name,
        organizer_email,
        id,
      ],
    );

    // Update court schedules if provided
    if (court_schedules !== undefined) {
      // Delete existing schedules
      await pool.query(`DELETE FROM event_court_schedules WHERE event_id = ?`, [
        id,
      ]);

      // Insert new schedules if provided
      if (court_schedules && court_schedules.length > 0) {
        const scheduleValues = court_schedules.map((schedule: any) => [
          id,
          schedule.court_id,
          schedule.start_time,
          schedule.end_time,
          schedule.notes || null,
        ]);

        await pool.query(
          `INSERT INTO event_court_schedules 
           (event_id, court_id, start_time, end_time, notes) 
           VALUES ?`,
          [scheduleValues],
        );
      }
    }

    // Fetch updated event with court schedules
    const [events] = await pool.query<any[]>(
      `SELECT e.*, c.name as club_name
       FROM events e
       JOIN clubs c ON e.club_id = c.id
       WHERE e.id = ?`,
      [id],
    );

    const [schedules] = await pool.query<any[]>(
      `SELECT * FROM event_court_schedules WHERE event_id = ?`,
      [id],
    );

    const eventData = {
      ...events[0],
      court_schedules: schedules,
    };

    res.json({
      success: true,
      data: eventData,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * DELETE /api/admin/events/:id
 * Delete event
 */
const handleDeleteAdminEvent: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { id } = req.params;

    // Verify event belongs to admin's club
    if (admin.club_id) {
      const [events] = await pool.query<any[]>(
        "SELECT club_id FROM events WHERE id = ?",
        [id],
      );

      if (events.length === 0 || events[0].club_id !== admin.club_id) {
        return res.status(403).json({
          success: false,
          message: "You can only delete events for your club",
        });
      }
    }

    await pool.query("DELETE FROM events WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/events
 * Get public events (for users to view and register)
 */
const handleGetPublicEvents: RequestHandler = async (req, res) => {
  try {
    const { clubId, startDate, endDate } = req.query;

    let query = `
      SELECT e.*, c.name as club_name, c.image_url as club_image_url
      FROM events e
      JOIN clubs c ON e.club_id = c.id
      WHERE e.status IN ('open', 'full', 'in_progress')
    `;

    const params: any[] = [];

    if (clubId) {
      query += " AND e.club_id = ?";
      params.push(clubId);
    }

    if (startDate) {
      query += " AND e.event_date >= ?";
      params.push(startDate);
    }

    if (endDate) {
      query += " AND e.event_date <= ?";
      params.push(endDate);
    }

    query += " ORDER BY e.event_date ASC, e.start_time ASC";

    const [events] = await pool.query<any[]>(query, params);

    // Fetch court schedules for all events
    const eventIds = events.map((e) => e.id);
    let courtSchedules: any[] = [];

    if (eventIds.length > 0) {
      const [schedules] = await pool.query<any[]>(
        `SELECT * FROM event_court_schedules WHERE event_id IN (?)`,
        [eventIds],
      );
      courtSchedules = schedules;
    }

    // Attach court schedules to events
    const eventsWithSchedules = events.map((event) => ({
      ...event,
      court_schedules: courtSchedules.filter((s) => s.event_id === event.id),
    }));

    res.json({
      success: true,
      data: eventsWithSchedules,
    });
  } catch (error) {
    console.error("Error fetching public events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const handleUpdateClubPolicy: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { id, policyType } = req.params;
    const { content } = req.body;

    if (
      admin.role === "club_admin" &&
      admin.club_id &&
      parseInt(id) !== admin.club_id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update policies for your club",
      });
    }

    if (
      !["booking_policy", "privacy_policy", "terms_of_service"].includes(
        policyType,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid policy type",
      });
    }

    await pool.query(`UPDATE clubs SET ${policyType} = ? WHERE id = ?`, [
      content,
      id,
    ]);

    res.json({
      success: true,
      message: "Policy updated successfully",
    });
  } catch (error) {
    console.error("Error updating club policy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update policy",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ==================== SETTINGS ROUTES ====================

/**
 * GET /api/admin/price-rules
 * Get price rules for a club
 */
const handleGetPriceRules: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const clubId = admin.club_id || req.query.club_id;

    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: "Club ID is required",
      });
    }

    const [priceRules] = await pool.query(
      `SELECT * FROM price_rules WHERE club_id = ? ORDER BY priority DESC, created_at DESC`,
      [clubId],
    );

    // Parse JSON fields for each rule
    const parsedRules = (priceRules as any[]).map((rule) => ({
      ...rule,
      days_of_week: rule.days_of_week
        ? typeof rule.days_of_week === "string"
          ? JSON.parse(rule.days_of_week)
          : rule.days_of_week
        : null,
    }));

    res.json({
      success: true,
      priceRules: parsedRules,
    });
  } catch (error) {
    console.error("Error fetching price rules:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch price rules",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/admin/price-rules
 * Create a new price rule
 */
const handleCreatePriceRule: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const {
      club_id,
      court_id,
      rule_name,
      rule_type,
      start_time,
      end_time,
      days_of_week,
      start_date,
      end_date,
      price_per_hour,
      priority,
      is_active,
    } = req.body;

    if (
      admin.role === "club_admin" &&
      admin.club_id &&
      parseInt(club_id) !== admin.club_id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only create rules for your club",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO price_rules 
      (club_id, court_id, rule_name, rule_type, start_time, end_time, days_of_week, start_date, end_date, price_per_hour, priority, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        club_id,
        court_id,
        rule_name,
        rule_type,
        start_time,
        end_time,
        days_of_week ? JSON.stringify(days_of_week) : null,
        start_date,
        end_date,
        price_per_hour,
        priority || 0,
        is_active !== undefined ? is_active : true,
      ],
    );

    res.json({
      success: true,
      message: "Price rule created successfully",
      ruleId: (result as any).insertId,
    });
  } catch (error) {
    console.error("Error creating price rule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create price rule",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * PUT /api/admin/price-rules/:id
 * Update a price rule
 */
const handleUpdatePriceRule: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { id } = req.params;
    const {
      court_id,
      rule_name,
      rule_type,
      start_time,
      end_time,
      days_of_week,
      start_date,
      end_date,
      price_per_hour,
      priority,
      is_active,
    } = req.body;

    // Verify ownership
    const [existing] = await pool.query(
      `SELECT club_id FROM price_rules WHERE id = ?`,
      [id],
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Price rule not found",
      });
    }

    const rule = existing[0] as any;
    if (
      admin.role === "club_admin" &&
      admin.club_id &&
      rule.club_id !== admin.club_id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update rules for your club",
      });
    }

    await pool.query(
      `UPDATE price_rules 
      SET court_id = ?, rule_name = ?, rule_type = ?, start_time = ?, end_time = ?, 
          days_of_week = ?, start_date = ?, end_date = ?, price_per_hour = ?, priority = ?, is_active = ?
      WHERE id = ?`,
      [
        court_id,
        rule_name,
        rule_type,
        start_time,
        end_time,
        days_of_week ? JSON.stringify(days_of_week) : null,
        start_date,
        end_date,
        price_per_hour,
        priority,
        is_active,
        id,
      ],
    );

    res.json({
      success: true,
      message: "Price rule updated successfully",
    });
  } catch (error) {
    console.error("Error updating price rule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update price rule",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * DELETE /api/admin/price-rules/:id
 * Delete a price rule
 */
const handleDeletePriceRule: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { id } = req.params;

    // Verify ownership
    const [existing] = await pool.query(
      `SELECT club_id FROM price_rules WHERE id = ?`,
      [id],
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Price rule not found",
      });
    }

    const rule = existing[0] as any;
    if (
      admin.role === "club_admin" &&
      admin.club_id &&
      rule.club_id !== admin.club_id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete rules for your club",
      });
    }

    await pool.query(`DELETE FROM price_rules WHERE id = ?`, [id]);

    res.json({
      success: true,
      message: "Price rule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting price rule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete price rule",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/calculate-price
 * Calculate price for a booking based on price rules
 */
const handleCalculatePrice: RequestHandler = async (req, res) => {
  try {
    const { club_id, court_id, booking_date, start_time, duration_minutes } =
      req.body;

    if (!club_id || !booking_date || !start_time || !duration_minutes) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: club_id, booking_date, start_time, duration_minutes",
      });
    }

    // Get base price from club
    const [clubRows] = await pool.query<any[]>(
      `SELECT price_per_hour FROM clubs WHERE id = ?`,
      [club_id],
    );

    if (clubRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    let pricePerHour = parseFloat(clubRows[0].price_per_hour);

    // Get active price rules for this club, ordered by priority (higher priority first)
    const [rules] = await pool.query<any[]>(
      `SELECT * FROM price_rules 
       WHERE club_id = ? 
       AND is_active = TRUE 
       AND (court_id IS NULL OR court_id = ?)
       ORDER BY priority DESC, created_at DESC`,
      [club_id, court_id || null],
    );

    // Parse booking date and time
    const bookingDateTime = new Date(`${booking_date}T${start_time}`);
    const dayOfWeek = bookingDateTime.getDay(); // 0 = Sunday, 6 = Saturday
    const timeString = start_time; // HH:MM format

    console.log(
      `[PRICE CALC] Booking: ${booking_date} ${start_time}, Day: ${dayOfWeek}, Rules found: ${rules.length}`,
    );

    // Find the first matching rule (highest priority)
    for (const rule of rules) {
      let matches = false;

      // Parse days_of_week JSON if exists
      let ruleDaysOfWeek: number[] | null = null;
      if (rule.days_of_week) {
        try {
          ruleDaysOfWeek =
            typeof rule.days_of_week === "string"
              ? JSON.parse(rule.days_of_week)
              : rule.days_of_week;
        } catch (e) {
          console.error("Failed to parse days_of_week:", e);
        }
      }

      // Check rule type and conditions
      switch (rule.rule_type) {
        case "time_of_day":
          // Match if time is within range
          if (rule.start_time && rule.end_time) {
            matches =
              timeString >= rule.start_time && timeString < rule.end_time;
          }
          break;

        case "day_of_week":
          // Match if day is in the list
          if (ruleDaysOfWeek && ruleDaysOfWeek.includes(dayOfWeek)) {
            matches = true;
          }
          break;

        case "seasonal":
          // Match if date is within range
          if (rule.start_date && rule.end_date) {
            const ruleStartDate = new Date(rule.start_date);
            const ruleEndDate = new Date(rule.end_date);
            const bookingDateOnly = new Date(booking_date);
            matches =
              bookingDateOnly >= ruleStartDate &&
              bookingDateOnly <= ruleEndDate;
          }
          break;

        case "special_date":
          // Match if date is within range AND time is within range
          if (rule.start_date && rule.end_date) {
            const ruleStartDate = new Date(rule.start_date);
            const ruleEndDate = new Date(rule.end_date);
            const bookingDateOnly = new Date(booking_date);
            const dateMatches =
              bookingDateOnly >= ruleStartDate &&
              bookingDateOnly <= ruleEndDate;

            let timeMatches = true;
            if (rule.start_time && rule.end_time) {
              timeMatches =
                timeString >= rule.start_time && timeString < rule.end_time;
            }

            matches = dateMatches && timeMatches;
          }
          break;
      }

      // If rule matches, use its price and stop checking
      if (matches) {
        console.log(
          `[PRICE CALC] ✓ Rule matched: ${rule.rule_name}, Price: ${rule.price_per_hour}`,
        );
        pricePerHour = parseFloat(rule.price_per_hour);
        break;
      }
    }

    console.log(
      `[PRICE CALC] Final price: ${pricePerHour} for ${duration_minutes} minutes`,
    );

    // Price is fixed for the duration block, not per hour
    const totalPrice = pricePerHour;

    res.json({
      success: true,
      data: {
        price_per_hour: pricePerHour,
        duration_minutes: duration_minutes,
        duration_hours: duration_minutes / 60,
        total_price: totalPrice,
      },
    });
  } catch (error) {
    console.error("Error calculating price:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate price",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/admin/schedules
 * Get club schedules
 */
const handleGetSchedules: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const clubId = admin.club_id || req.query.club_id;

    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: "Club ID is required",
      });
    }

    const [schedules] = await pool.query(
      `SELECT * FROM club_schedules WHERE club_id = ? ORDER BY day_of_week`,
      [clubId],
    );

    res.json({
      success: true,
      schedules,
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedules",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * PUT /api/admin/schedules/:id
 * Update a club schedule
 */
const handleUpdateSchedule: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { id } = req.params;
    const { opens_at, closes_at, is_closed } = req.body;

    // Verify ownership
    const [existing] = await pool.query(
      `SELECT club_id FROM club_schedules WHERE id = ?`,
      [id],
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    const schedule = existing[0] as any;
    if (
      admin.role === "club_admin" &&
      admin.club_id &&
      schedule.club_id !== admin.club_id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update schedules for your club",
      });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (opens_at !== undefined) {
      updates.push("opens_at = ?");
      values.push(opens_at);
    }
    if (closes_at !== undefined) {
      updates.push("closes_at = ?");
      values.push(closes_at);
    }
    if (is_closed !== undefined) {
      updates.push("is_closed = ?");
      values.push(is_closed);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No updates provided",
      });
    }

    values.push(id);
    await pool.query(
      `UPDATE club_schedules SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    res.json({
      success: true,
      message: "Schedule updated successfully",
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update schedule",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * PUT /api/admin/club-settings
 * Update club settings (base price, etc.)
 */
const handleUpdateClubSettings: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { club_id, price_per_hour, default_booking_duration } = req.body;

    if (
      admin.role === "club_admin" &&
      admin.club_id &&
      parseInt(club_id) !== admin.club_id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update settings for your club",
      });
    }

    // Build dynamic UPDATE query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (price_per_hour !== undefined) {
      updates.push("price_per_hour = ?");
      values.push(price_per_hour);
    }

    if (default_booking_duration !== undefined) {
      updates.push("default_booking_duration = ?");
      values.push(default_booking_duration);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No settings provided to update",
      });
    }

    values.push(club_id);

    await pool.query(
      `UPDATE clubs SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    res.json({
      success: true,
      message: "Club settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating club settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update club settings",
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
  expressApp.get("/api/instructors/:clubId", handleGetInstructors);

  // Auth routes
  expressApp.post("/api/auth/check-user", handleCheckUser);
  expressApp.post("/api/auth/create-user", handleCreateUser);
  expressApp.post("/api/auth/send-code", handleSendCode);
  expressApp.post("/api/auth/verify-code", handleVerifyCode);

  // User routes
  expressApp.put("/api/users/:id", handleUpdateUser);
  expressApp.get(
    "/api/users/:userId/event-registrations",
    handleGetUserEventRegistrations,
  );
  expressApp.get(
    "/api/users/:userId/private-classes",
    handleGetUserPrivateClasses,
  );

  // Payment routes
  expressApp.post("/api/payment/create-intent", handleCreatePaymentIntent);
  expressApp.post("/api/payment/confirm", handleConfirmPayment);

  // Event registration payment routes
  expressApp.post(
    "/api/events/payment/create-intent",
    handleCreateEventPaymentIntent,
  );
  expressApp.post("/api/events/payment/confirm", handleConfirmEventPayment);

  // Private class payment routes
  expressApp.post(
    "/api/private-classes/payment/create-intent",
    handleCreateClassPaymentIntent,
  );
  expressApp.post(
    "/api/private-classes/payment/confirm",
    handleConfirmClassPayment,
  );

  // Admin event routes
  expressApp.get(
    "/api/admin/events/:eventId/participants",
    handleGetEventParticipants,
  );
  expressApp.post(
    "/api/admin/events/:eventId/participants",
    verifyAdminSession,
    handleAddEventParticipant,
  );

  // Admin auth routes (no auth required)
  expressApp.post("/api/admin/auth/send-code", handleAdminSendCode);
  expressApp.post("/api/admin/auth/verify-code", handleAdminVerifyCode);
  expressApp.get("/api/admin/auth/validate", handleAdminValidateSession);
  expressApp.post("/api/admin/auth/logout", handleAdminLogout);

  // Admin routes (auth required)
  expressApp.get(
    "/api/admin/dashboard/stats",
    verifyAdminSession,
    handleGetDashboardStats,
  );
  expressApp.get(
    "/api/admin/bookings",
    verifyAdminSession,
    handleGetAdminBookings,
  );
  expressApp.get(
    "/api/admin/private-classes",
    verifyAdminSession,
    handleGetAdminPrivateClasses,
  );
  expressApp.post(
    "/api/admin/private-classes/manual",
    verifyAdminSession,
    handleCreateManualPrivateClass,
  );
  expressApp.post(
    "/api/admin/bookings/manual",
    verifyAdminSession,
    handleCreateManualBooking,
  );
  expressApp.get(
    "/api/admin/players",
    verifyAdminSession,
    handleGetAdminPlayers,
  );
  expressApp.post(
    "/api/admin/players",
    verifyAdminSession,
    handleCreateAdminPlayer,
  );

  // Instructors routes
  expressApp.get(
    "/api/admin/instructors",
    verifyAdminSession,
    handleGetAdminInstructors,
  );
  expressApp.post(
    "/api/admin/instructors",
    verifyAdminSession,
    handleCreateAdminInstructor,
  );
  expressApp.put(
    "/api/admin/instructors/:id",
    verifyAdminSession,
    handleUpdateAdminInstructor,
  );
  expressApp.delete(
    "/api/admin/instructors/:id",
    verifyAdminSession,
    handleDeleteAdminInstructor,
  );

  // Instructor availability routes
  expressApp.get(
    "/api/admin/instructors/:id/availability",
    verifyAdminSession,
    handleGetInstructorAvailability,
  );
  expressApp.post(
    "/api/admin/instructors/:id/availability",
    verifyAdminSession,
    handleAddInstructorAvailability,
  );
  expressApp.delete(
    "/api/admin/instructors/availability/:availabilityId",
    verifyAdminSession,
    handleDeleteInstructorAvailability,
  );

  expressApp.get("/api/admin/courts", verifyAdminSession, handleGetAdminCourts);
  expressApp.post("/api/admin/courts", verifyAdminSession, handleCreateCourt);
  expressApp.put(
    "/api/admin/courts/:id",
    verifyAdminSession,
    handleUpdateCourt,
  );
  expressApp.get(
    "/api/admin/blocked-slots",
    verifyAdminSession,
    handleGetBlockedSlots,
  );
  expressApp.post(
    "/api/admin/blocked-slots",
    verifyAdminSession,
    handleCreateBlockedSlot,
  );
  expressApp.delete(
    "/api/admin/blocked-slots/:id",
    verifyAdminSession,
    handleDeleteBlockedSlot,
  );
  expressApp.get("/api/admin/admins", verifyAdminSession, handleGetAdmins);
  expressApp.post("/api/admin/admins", verifyAdminSession, handleCreateAdmin);
  expressApp.put(
    "/api/admin/admins/:id",
    verifyAdminSession,
    handleUpdateAdmin,
  );
  expressApp.put(
    "/api/admin/clubs/:id/policies/:policyType",
    verifyAdminSession,
    handleUpdateClubPolicy,
  );

  // Settings routes
  expressApp.get(
    "/api/admin/price-rules",
    verifyAdminSession,
    handleGetPriceRules,
  );
  expressApp.post(
    "/api/admin/price-rules",
    verifyAdminSession,
    handleCreatePriceRule,
  );
  expressApp.put(
    "/api/admin/price-rules/:id",
    verifyAdminSession,
    handleUpdatePriceRule,
  );
  expressApp.delete(
    "/api/admin/price-rules/:id",
    verifyAdminSession,
    handleDeletePriceRule,
  );
  expressApp.get(
    "/api/admin/schedules",
    verifyAdminSession,
    handleGetSchedules,
  );
  expressApp.put(
    "/api/admin/schedules/:id",
    verifyAdminSession,
    handleUpdateSchedule,
  );
  expressApp.put(
    "/api/admin/club-settings",
    verifyAdminSession,
    handleUpdateClubSettings,
  );

  // Price calculation
  expressApp.post("/api/calculate-price", handleCalculatePrice);

  // Events routes
  expressApp.get("/api/admin/events", verifyAdminSession, handleGetAdminEvents);
  expressApp.post(
    "/api/admin/events",
    verifyAdminSession,
    handleCreateAdminEvent,
  );
  expressApp.put(
    "/api/admin/events/:id",
    verifyAdminSession,
    handleUpdateAdminEvent,
  );
  expressApp.delete(
    "/api/admin/events/:id",
    verifyAdminSession,
    handleDeleteAdminEvent,
  );
  expressApp.get("/api/events", handleGetPublicEvents);

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
