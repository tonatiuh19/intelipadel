import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import type { RowDataPacket } from "mysql2/promise";
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
 * Send subscription confirmation email
 */
async function sendSubscriptionConfirmationEmail(
  email: string,
  userName: string,
  subscriptionName: string,
  clubName: string,
  price: number,
  currency: string,
  benefits: { discount?: number; credits?: number; extras?: string[] },
): Promise<boolean> {
  try {
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

    const transporter = nodemailer.createTransport(transportConfig);

    // Process extras - they can be strings or objects with description
    const extrasList = (benefits.extras || [])
      .map((extra) =>
        typeof extra === "string" ? extra : (extra as any).description || "",
      )
      .filter(Boolean);

    const benefitsList = [
      benefits.discount && `✓ ${benefits.discount}% de descuento en reservas`,
      benefits.credits && `✓ ${benefits.credits} créditos mensuales`,
      ...extrasList.map((extra) => `✓ ${extra}`),
    ]
      .filter(Boolean)
      .map((b) => `<div class="benefit">${b}</div>`)
      .join("");

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { background-color: white; border-radius: 10px; padding: 30px; max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #84cc16 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
          .badge { display: inline-block; background-color: #fbbf24; color: #78350f; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; }
          .price { font-size: 36px; font-weight: bold; color: #84cc16; margin: 20px 0; }
          .benefits { background-color: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .benefit { padding: 10px 0; border-bottom: 1px solid #fcd34d; }
          .benefit:last-child { border-bottom: none; }
          .footer { color: #666; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
          .button { background-color: #84cc16; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Suscripción Activada!</h1>
            <span class="badge">${subscriptionName}</span>
          </div>
          
          <p style="font-size: 18px;">Hola ${userName},</p>
          
          <p>¡Bienvenido al programa de membresías de <strong>${clubName}</strong>! Tu suscripción ha sido activada exitosamente.</p>
          
          <div style="text-align: center;">
            <div class="price">$${price} ${currency}/mes</div>
          </div>
          
          <div class="benefits">
            <h3 style="margin-top: 0; color: #92400e;">✨ Tus Beneficios:</h3>
            ${benefitsList}
          </div>
          
          <p>Tu próximo cargo será el mismo día del próximo mes. Puedes cancelar en cualquier momento desde tu perfil.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:8080"}/profile" class="button">
              Ver Mi Perfil
            </a>
          </div>
          
          <div class="footer">
            <p>InteliPadel - Tu plataforma de reservas de pádel</p>
            <p>Si tienes alguna pregunta, contáctanos en soporte@intelipadel.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"InteliPadel" <${transportConfig.auth.user}>`,
      to: email,
      subject: `Suscripción Confirmada - ${subscriptionName}`,
      html: emailBody,
    });

    console.log("✅ Subscription confirmation email sent");
    return true;
  } catch (error) {
    console.error("❌ Error sending subscription email:", error);
    return false;
  }
}

/**
 * Send subscription cancellation email
 */
async function sendSubscriptionCancellationEmail(
  email: string,
  userName: string,
  subscriptionName: string,
  endDate: Date,
): Promise<boolean> {
  try {
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

    const transporter = nodemailer.createTransport(transportConfig);

    const endDateFormatted = endDate.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { background-color: white; border-radius: 10px; padding: 30px; max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
          .info-box { background-color: #fef3c7; padding: 20px; border-radius: 10px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .footer { color: #666; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
          .button { background-color: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Suscripción Cancelada</h1>
          </div>
          
          <p style="font-size: 18px;">Hola ${userName},</p>
          
          <p>Tu suscripción <strong>${subscriptionName}</strong> ha sido cancelada.</p>
          
          <div class="info-box">
            <p style="margin: 0;"><strong>Información Importante:</strong></p>
            <p style="margin: 10px 0 0 0;">Seguirás teniendo acceso a tus beneficios hasta el <strong>${endDateFormatted}</strong>. Después de esta fecha, tu suscripción finalizará y no se realizarán más cargos.</p>
          </div>
          
          <p>Lamentamos verte partir. Si cambias de opinión, siempre puedes volver a suscribirte desde nuestra plataforma.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:8080"}/booking" class="button">
              Ver Planes Disponibles
            </a>
          </div>
          
          <div class="footer">
            <p>InteliPadel - Tu plataforma de reservas de pádel</p>
            <p>Si tienes alguna pregunta, contáctanos en soporte@intelipadel.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"InteliPadel" <${transportConfig.auth.user}>`,
      to: email,
      subject: `Suscripción Cancelada - ${subscriptionName}`,
      html: emailBody,
    });

    console.log("✅ Subscription cancellation email sent");
    return true;
  } catch (error) {
    console.error("❌ Error sending cancellation email:", error);
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
 * GET /api/clubs/:id/colors
 * Get club color customization (public endpoint)
 */
const handleGetClubColorsPublic: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query<any[]>(
      `SELECT 
        primary_color,
        secondary_color,
        accent_color,
        text_color,
        background_color
      FROM clubs 
      WHERE id = ? AND is_active = TRUE`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    res.json({
      success: true,
      colors: {
        primary_color: rows[0].primary_color || "#84cc16",
        secondary_color: rows[0].secondary_color || "#fb923c",
        accent_color: rows[0].accent_color || "#fed7aa",
        text_color: rows[0].text_color || "#1f2937",
        background_color: rows[0].background_color || "#ffffff",
      },
    });
  } catch (error) {
    console.error("Error fetching club colors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch club colors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/clubs/onboard
 * Create a new club onboarding request (club created as inactive for review)
 */
const handleClubOnboarding: RequestHandler = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      address,
      city,
      state,
      postal_code,
      country,
      phone,
      email,
      website,
      price_per_hour,
      default_booking_duration,
      currency,
      courts,
      operating_hours,
      enable_events,
      enable_classes,
      enable_subscriptions,
      terms_and_conditions,
      privacy_policy,
      cancellation_policy,
      admin_name,
      admin_email,
      admin_phone,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !address ||
      !city ||
      !state ||
      !phone ||
      !email ||
      !price_per_hour ||
      !admin_name ||
      !admin_email ||
      !admin_phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios",
      });
    }

    if (!courts || courts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Debes agregar al menos una cancha",
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Insert club (as inactive for review)
      const [clubResult] = await connection.query<any>(
        `INSERT INTO clubs (
          name, slug, description, address, city, state, postal_code, country,
          phone, email, website, price_per_hour, default_booking_duration, currency,
          is_active, featured, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, FALSE, NOW(), NOW())`,
        [
          name,
          slug,
          description,
          address,
          city,
          state,
          postal_code,
          country || "México",
          phone,
          email,
          website || null,
          price_per_hour,
          default_booking_duration || 90,
          currency || "MXN",
        ],
      );

      const clubId = clubResult.insertId;

      // 2. Insert courts
      for (const court of courts) {
        await connection.query(
          `INSERT INTO courts (
            club_id, name, court_type, surface_type, has_lighting,
            is_active, display_order, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, TRUE, ?, NOW(), NOW())`,
          [
            clubId,
            court.name,
            court.court_type,
            court.surface_type,
            court.has_lighting ? 1 : 0,
            court.display_order,
          ],
        );
      }

      // 3. Create admin account (inactive until club is approved)
      const [adminResult] = await connection.query<any>(
        `INSERT INTO admins (
          email, name, phone, role, club_id, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, 'club_admin', ?, FALSE, NOW(), NOW())`,
        [admin_email, admin_name, admin_phone, clubId],
      );

      // 4. Insert cancellation policy if provided
      if (cancellation_policy) {
        await connection.query(
          `INSERT INTO club_cancellation_policy (
            club_id, version, content, hours_before_cancellation,
            refund_percentage, effective_date, is_active, created_at, updated_at
          ) VALUES (?, '1.0', ?, 24, 100.00, NOW(), TRUE, NOW(), NOW())`,
          [clubId, cancellation_policy],
        );
      }

      // 5. Send notification email to Intelipadel team
      try {
        await sendClubOnboardingNotification(
          name,
          admin_email,
          admin_name,
          clubId,
        );
      } catch (emailError) {
        console.error("Failed to send onboarding notification:", emailError);
        // Don't fail the request if email fails
      }

      // Commit transaction
      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: "Solicitud de registro enviada exitosamente",
        data: {
          club_id: clubId,
          name,
          status: "pending_review",
        },
      });
    } catch (error) {
      // Rollback on error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error creating club onboarding:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear la solicitud de registro",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Helper to send club onboarding notification email
 */
async function sendClubOnboardingNotification(
  clubName: string,
  adminEmail: string,
  adminName: string,
  clubId: number,
): Promise<boolean> {
  try {
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
      console.error("SMTP credentials not configured");
      return false;
    }

    const transporter = nodemailer.createTransport(transportConfig);

    // Email to Intelipadel team
    const teamEmailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { background-color: white; border-radius: 10px; padding: 30px; max-width: 600px; margin: 0 auto; }
          .header { background-color: #84cc16; color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
          .info { background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { color: #666; font-size: 12px; text-align: center; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nueva Solicitud de Club</h1>
          </div>
          <h2>Club: ${clubName}</h2>
          <div class="info">
            <p><strong>Club ID:</strong> ${clubId}</p>
            <p><strong>Administrador:</strong> ${adminName}</p>
            <p><strong>Email:</strong> ${adminEmail}</p>
          </div>
          <p>Un nuevo club ha solicitado unirse a Intelipadel. Por favor revisa la información y contacta al administrador.</p>
          <div class="footer">
            <p>InteliPadel - Sistema de Gestión</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Intelipadel" <${transportConfig.auth.user}>`,
      to: transportConfig.auth.user, // Send to team email
      subject: `Nueva Solicitud de Club: ${clubName}`,
      html: teamEmailBody,
    });

    // Confirmation email to club admin
    const confirmEmailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { background-color: white; border-radius: 10px; padding: 30px; max-width: 600px; margin: 0 auto; }
          .header { background-color: #84cc16; color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
          .success { background-color: #dcfce7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #10b981; }
          .footer { color: #666; font-size: 12px; text-align: center; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Solicitud Recibida!</h1>
          </div>
          <h2>Hola ${adminName},</h2>
          <div class="success">
            <p>Hemos recibido tu solicitud para registrar <strong>${clubName}</strong> en Intelipadel.</p>
          </div>
          <p>Nuestro equipo revisará tu información y se pondrá en contacto contigo en las próximas 24-48 horas.</p>
          <h3>Próximos Pasos:</h3>
          <ul>
            <li>Revisión de tu información</li>
            <li>Configuración de tu cuenta de administrador</li>
            <li>Activación de tu club en la plataforma</li>
            <li>Capacitación personalizada para tu equipo</li>
          </ul>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <div class="footer">
            <p>InteliPadel - Tu plataforma de gestión de clubes</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Intelipadel" <${transportConfig.auth.user}>`,
      to: adminEmail,
      subject: `Solicitud de Registro Recibida - ${clubName}`,
      html: confirmEmailBody,
    });

    return true;
  } catch (error) {
    console.error("Error sending onboarding notification:", error);
    return false;
  }
}

/**
    console.error("Error fetching club colors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch club colors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ==================== SUBSCRIPTION HANDLERS ====================

/**
 * GET /api/subscriptions
 * Get all subscriptions for a club
 */
/**
 * Helper function to safely parse the extras field
 * Handles both JSON strings and already-parsed objects
 */
const parseExtras = (extras: any): any[] => {
  if (!extras) return [];
  if (typeof extras === "string") {
    try {
      return JSON.parse(extras);
    } catch (e) {
      console.error("Failed to parse extras JSON:", e);
      return [];
    }
  }
  if (Array.isArray(extras)) return extras;
  return [];
};

const handleGetSubscriptions: RequestHandler = async (req, res) => {
  try {
    const { club_id } = req.query;

    if (!club_id) {
      return res.status(400).json({ error: "club_id is required" });
    }

    const [rows] = await pool.query<any[]>(
      `SELECT * FROM club_subscriptions 
       WHERE club_id = ? 
       ORDER BY display_order ASC, created_at DESC`,
      [club_id],
    );

    // Parse JSON extras field
    const subscriptions = rows.map((row) => ({
      ...row,
      extras: parseExtras(row.extras),
    }));

    res.json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
};

/**
 * GET /api/subscriptions/:id
 * Get a single subscription
 */
const handleGetSubscription: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query<any[]>(
      `SELECT * FROM club_subscriptions WHERE id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const subscription = {
      ...rows[0],
      extras: parseExtras(rows[0].extras),
    };

    res.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
};

/**
 * POST /api/subscriptions
 * Create a new subscription
 */
const handleCreateSubscription: RequestHandler = async (req, res) => {
  try {
    const data = req.body;

    // Validate required fields
    if (!data.club_id || !data.name || !data.price_monthly) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate booking benefits are mutually exclusive
    if (data.booking_discount_percent && data.booking_credits_monthly) {
      return res.status(400).json({
        error:
          "Cannot have both booking discount and booking credits. Please choose one.",
      });
    }

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    let stripeProductId: string | null = null;
    let stripePriceId: string | null = null;

    try {
      // Get club name for product creation
      const [clubRows] = await pool.query<any[]>(
        `SELECT name FROM clubs WHERE id = ?`,
        [data.club_id],
      );
      const clubName = clubRows[0]?.name || "Club";

      // Create Stripe product
      const product = await stripe.products.create({
        name: `${clubName} - ${data.name}`,
        description: data.description || undefined,
        metadata: {
          club_id: data.club_id.toString(),
          subscription_name: data.name,
        },
      });

      stripeProductId = product.id;

      // Create Stripe price (recurring monthly)
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(data.price_monthly * 100), // Convert to cents
        currency: (data.currency || "usd").toLowerCase(),
        recurring: {
          interval: "month",
        },
        metadata: {
          club_id: data.club_id.toString(),
        },
      });

      stripePriceId = price.id;
    } catch (stripeError) {
      console.error("Stripe product/price creation error:", stripeError);
      // Continue without Stripe IDs if creation fails
    }

    // Convert extras array to JSON string
    const extrasJson = data.extras ? JSON.stringify(data.extras) : null;

    const [result] = await pool.query<any>(
      `INSERT INTO club_subscriptions (
        club_id, name, description, price_monthly, currency,
        booking_discount_percent, booking_credits_monthly,
        bar_discount_percent, merch_discount_percent,
        event_discount_percent, class_discount_percent,
        extras, is_active, display_order, max_subscribers,
        stripe_product_id, stripe_price_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.club_id,
        data.name,
        data.description || null,
        data.price_monthly,
        data.currency || "USD",
        data.booking_discount_percent || null,
        data.booking_credits_monthly || null,
        data.bar_discount_percent || null,
        data.merch_discount_percent || null,
        data.event_discount_percent || null,
        data.class_discount_percent || null,
        extrasJson,
        data.is_active !== false ? 1 : 0,
        data.display_order || 0,
        data.max_subscribers || null,
        stripeProductId,
        stripePriceId,
      ],
    );

    // Fetch the created subscription
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM club_subscriptions WHERE id = ?`,
      [result.insertId],
    );

    const subscription = {
      ...rows[0],
      extras: parseExtras(rows[0].extras),
    };

    res.status(201).json(subscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: "Failed to create subscription" });
  }
};

/**
 * PUT /api/subscriptions/:id
 * Update a subscription
 */
const handleUpdateSubscription: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Check if subscription exists
    const [existing] = await pool.query<any[]>(
      `SELECT * FROM club_subscriptions WHERE id = ?`,
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const currentSub = existing[0];

    // Validate booking benefits are mutually exclusive
    const newDiscountPercent =
      data.booking_discount_percent !== undefined
        ? data.booking_discount_percent
        : currentSub.booking_discount_percent;
    const newCreditsMonthly =
      data.booking_credits_monthly !== undefined
        ? data.booking_credits_monthly
        : currentSub.booking_credits_monthly;

    if (newDiscountPercent && newCreditsMonthly) {
      return res.status(400).json({
        error:
          "Cannot have both booking discount and booking credits. Please choose one.",
      });
    }

    // If price or currency changed and we have Stripe product, create new price
    if (
      (data.price_monthly !== undefined || data.currency !== undefined) &&
      currentSub.stripe_product_id
    ) {
      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: "2025-12-15.clover",
        });

        // Archive old price
        if (currentSub.stripe_price_id) {
          await stripe.prices.update(currentSub.stripe_price_id, {
            active: false,
          });
        }

        // Create new price
        const newPrice = await stripe.prices.create({
          product: currentSub.stripe_product_id,
          unit_amount: Math.round(
            (data.price_monthly || currentSub.price_monthly) * 100,
          ),
          currency: (
            data.currency ||
            currentSub.currency ||
            "usd"
          ).toLowerCase(),
          recurring: {
            interval: "month",
          },
          metadata: {
            club_id: currentSub.club_id.toString(),
          },
        });

        data.stripe_price_id = newPrice.id;
      } catch (stripeError) {
        console.error("Stripe price update error:", stripeError);
      }
    }

    // Update Stripe product name/description if changed
    if (
      (data.name !== undefined || data.description !== undefined) &&
      currentSub.stripe_product_id
    ) {
      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: "2025-12-15.clover",
        });

        const [clubRows] = await pool.query<any[]>(
          `SELECT name FROM clubs WHERE id = ?`,
          [currentSub.club_id],
        );
        const clubName = clubRows[0]?.name || "Club";

        await stripe.products.update(currentSub.stripe_product_id, {
          name: `${clubName} - ${data.name || currentSub.name}`,
          description:
            data.description !== undefined
              ? data.description || undefined
              : currentSub.description || undefined,
        });
      } catch (stripeError) {
        console.error("Stripe product update error:", stripeError);
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description || null);
    }
    if (data.price_monthly !== undefined) {
      updates.push("price_monthly = ?");
      values.push(data.price_monthly);
    }
    if (data.currency !== undefined) {
      updates.push("currency = ?");
      values.push(data.currency);
    }
    if (data.booking_discount_percent !== undefined) {
      updates.push("booking_discount_percent = ?");
      values.push(data.booking_discount_percent || null);
    }
    if (data.booking_credits_monthly !== undefined) {
      updates.push("booking_credits_monthly = ?");
      values.push(data.booking_credits_monthly || null);
    }
    if (data.bar_discount_percent !== undefined) {
      updates.push("bar_discount_percent = ?");
      values.push(data.bar_discount_percent || null);
    }
    if (data.merch_discount_percent !== undefined) {
      updates.push("merch_discount_percent = ?");
      values.push(data.merch_discount_percent || null);
    }
    if (data.event_discount_percent !== undefined) {
      updates.push("event_discount_percent = ?");
      values.push(data.event_discount_percent || null);
    }
    if (data.class_discount_percent !== undefined) {
      updates.push("class_discount_percent = ?");
      values.push(data.class_discount_percent || null);
    }
    if (data.extras !== undefined) {
      updates.push("extras = ?");
      values.push(data.extras ? JSON.stringify(data.extras) : null);
    }
    if (data.is_active !== undefined) {
      updates.push("is_active = ?");
      values.push(data.is_active ? 1 : 0);
    }
    if (data.display_order !== undefined) {
      updates.push("display_order = ?");
      values.push(data.display_order);
    }
    if (data.max_subscribers !== undefined) {
      updates.push("max_subscribers = ?");
      values.push(data.max_subscribers || null);
    }
    if (data.stripe_price_id !== undefined) {
      updates.push("stripe_price_id = ?");
      values.push(data.stripe_price_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);

    await pool.query(
      `UPDATE club_subscriptions SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    // Fetch the updated subscription
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM club_subscriptions WHERE id = ?`,
      [id],
    );

    const subscription = {
      ...rows[0],
      extras: parseExtras(rows[0].extras),
    };

    res.json(subscription);
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ error: "Failed to update subscription" });
  }
};

/**
 * DELETE /api/subscriptions/:id
 * Delete a subscription
 */
const handleDeleteSubscription: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subscription has active subscribers
    const [subscribers] = await pool.query<any[]>(
      `SELECT COUNT(*) as count FROM user_subscriptions 
       WHERE subscription_id = ? AND status = 'active'`,
      [id],
    );

    if (subscribers[0].count > 0) {
      return res.status(400).json({
        error:
          "Cannot delete subscription with active subscribers. Please cancel all subscriptions first.",
      });
    }

    // Get subscription details for Stripe cleanup
    const [subRows] = await pool.query<any[]>(
      `SELECT stripe_product_id, stripe_price_id FROM club_subscriptions WHERE id = ?`,
      [id],
    );

    // Archive Stripe product and price if they exist
    if (subRows.length > 0 && subRows[0].stripe_product_id) {
      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: "2025-12-15.clover",
        });

        // Archive price first
        if (subRows[0].stripe_price_id) {
          await stripe.prices.update(subRows[0].stripe_price_id, {
            active: false,
          });
        }

        // Archive product
        await stripe.products.update(subRows[0].stripe_product_id, {
          active: false,
        });
      } catch (stripeError) {
        console.error("Stripe cleanup error:", stripeError);
        // Continue with deletion even if Stripe cleanup fails
      }
    }

    // Delete the subscription
    const [result] = await pool.query<any>(
      `DELETE FROM club_subscriptions WHERE id = ?`,
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    res.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).json({ error: "Failed to delete subscription" });
  }
};

/**
 * GET /api/subscriptions/active/:club_id
 * Get active subscriptions for public display
 */
const handleGetActiveSubscriptions: RequestHandler = async (req, res) => {
  try {
    const { club_id } = req.params;

    const [rows] = await pool.query<any[]>(
      `SELECT * FROM club_subscriptions 
       WHERE club_id = ? AND is_active = 1
       ORDER BY display_order ASC, price_monthly ASC`,
      [club_id],
    );

    // Parse JSON extras field if it's a string
    const subscriptions = rows.map((row) => ({
      ...row,
      extras: row.extras
        ? typeof row.extras === "string"
          ? JSON.parse(row.extras)
          : row.extras
        : [],
    }));

    res.json(subscriptions);
  } catch (error) {
    console.error("Error fetching active subscriptions:", error);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
};

/**
 * POST /api/subscriptions/subscribe
 * User subscribes to a subscription plan (creates Stripe subscription)
 */
const handleUserSubscribe: RequestHandler = async (req, res) => {
  try {
    const { user_id, subscription_id, payment_method_id } = req.body;

    if (!user_id || !subscription_id || !payment_method_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get subscription details with club name
    const [subRows] = await pool.query<any[]>(
      `SELECT cs.*, c.name as club_name 
       FROM club_subscriptions cs
       JOIN clubs c ON cs.club_id = c.id
       WHERE cs.id = ? AND cs.is_active = 1`,
      [subscription_id],
    );

    if (subRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Subscription not found or inactive" });
    }

    const subscription = subRows[0];

    // Check if user already has an active subscription for this club
    const [existingSubs] = await pool.query<any[]>(
      `SELECT us.* FROM user_subscriptions us
       WHERE us.user_id = ? AND us.club_id = ? AND us.status = 'active'`,
      [user_id, subscription.club_id],
    );

    if (existingSubs.length > 0) {
      return res.status(400).json({
        error: "User already has an active subscription for this club",
      });
    }

    // Check max subscribers limit
    if (
      subscription.max_subscribers &&
      subscription.current_subscribers >= subscription.max_subscribers
    ) {
      return res
        .status(400)
        .json({ error: "Subscription has reached maximum capacity" });
    }

    // Get user details and ensure they have a Stripe customer ID
    const [userRows] = await pool.query<any[]>(
      `SELECT * FROM users WHERE id = ?`,
      [user_id],
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRows[0];

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    let customerId = user.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          user_id: user_id.toString(),
        },
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      await pool.query(`UPDATE users SET stripe_customer_id = ? WHERE id = ?`, [
        customerId,
        user_id,
      ]);
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    });

    // Save payment method to database
    const paymentMethodDetails =
      await stripe.paymentMethods.retrieve(payment_method_id);

    // First, unset all other payment methods as default for this user
    await pool.query(
      `UPDATE payment_methods SET is_default = 0 WHERE user_id = ?`,
      [user_id],
    );

    // Then insert or update the new default payment method
    await pool.query(
      `INSERT INTO payment_methods (user_id, stripe_payment_method_id, payment_type, card_brand, card_last4, card_exp_month, card_exp_year, is_default)
       VALUES (?, ?, 'card', ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE is_default = 1, card_brand = VALUES(card_brand), card_last4 = VALUES(card_last4), card_exp_month = VALUES(card_exp_month), card_exp_year = VALUES(card_exp_year)`,
      [
        user_id,
        payment_method_id,
        paymentMethodDetails.card?.brand || "unknown",
        paymentMethodDetails.card?.last4 || "0000",
        paymentMethodDetails.card?.exp_month || 0,
        paymentMethodDetails.card?.exp_year || 0,
      ],
    );

    // Create Stripe subscription
    const nowTimestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: subscription.stripe_price_id }],
      billing_cycle_anchor: nowTimestamp,
      proration_behavior: "none",
      metadata: {
        user_id: user_id.toString(),
        subscription_id: subscription_id.toString(),
        club_id: subscription.club_id.toString(),
      },
    });

    // Calculate credit reset date (first day of next month)
    const now = new Date();
    const creditResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Create user subscription record
    const currentPeriodStart = new Date(
      (stripeSubscription as any).current_period_start * 1000,
    );
    let currentPeriodEnd = new Date(
      (stripeSubscription as any).current_period_end * 1000,
    );

    // Ensure period end is at least 1 month after start (safety check)
    if (currentPeriodEnd.getTime() === currentPeriodStart.getTime()) {
      currentPeriodEnd = new Date(currentPeriodStart);
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    await pool.query(
      `INSERT INTO user_subscriptions (
        user_id, club_id, plan_id, subscription_number, stripe_subscription_id, status,
        current_period_start, current_period_end, started_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user_id,
        subscription.club_id,
        subscription_id,
        `SUB-${Date.now()}-${user_id}`,
        stripeSubscription.id,
        "active",
        currentPeriodStart,
        currentPeriodEnd,
      ],
    );

    // Increment current_subscribers count
    await pool.query(
      `UPDATE club_subscriptions SET current_subscribers = current_subscribers + 1 WHERE id = ?`,
      [subscription_id],
    );

    // Update has_subscriptions flag on club
    await pool.query(`UPDATE clubs SET has_subscriptions = 1 WHERE id = ?`, [
      subscription.club_id,
    ]);

    // Send confirmation email
    await sendSubscriptionConfirmationEmail(
      user.email,
      user.name,
      subscription.name,
      subscription.club_name,
      parseFloat(subscription.price_monthly),
      subscription.currency,
      {
        discount: subscription.booking_discount_percent,
        credits: subscription.booking_credits_monthly,
        extras: subscription.extras
          ? typeof subscription.extras === "string"
            ? JSON.parse(subscription.extras)
            : subscription.extras
          : [],
      },
    );

    res.json({
      success: true,
      message: "Subscription created successfully",
      subscription: stripeSubscription,
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({
      error: "Failed to create subscription",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/subscriptions/cancel
 * User cancels their subscription
 */
const handleUserCancelSubscription: RequestHandler = async (req, res) => {
  try {
    const { user_id, subscription_id } = req.body;

    if (!user_id || !subscription_id) {
      return res
        .status(400)
        .json({ error: "user_id and subscription_id are required" });
    }

    // Get subscription details
    const [subRows] = await pool.query<any[]>(
      `SELECT * FROM user_subscriptions WHERE user_id = ? AND subscription_id = ? AND status = 'active'`,
      [user_id, subscription_id],
    );

    if (subRows.length === 0) {
      return res.status(404).json({ error: "Active subscription not found" });
    }

    const userSub = subRows[0];

    if (userSub.status === "cancelled") {
      return res.status(400).json({ error: "Subscription already cancelled" });
    }

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    // Cancel Stripe subscription at period end
    await stripe.subscriptions.update(userSub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update database
    await pool.query(
      `UPDATE user_subscriptions SET status = 'cancelled', cancelled_at = NOW() WHERE id = ?`,
      [userSub.id],
    );

    // Decrement current_subscribers count
    await pool.query(
      `UPDATE club_subscriptions SET current_subscribers = current_subscribers - 1 WHERE id = ?`,
      [userSub.subscription_id],
    );

    // Get subscription and user details for email
    const [subDetails] = await pool.query<any[]>(
      `SELECT cs.name, u.email, u.name as user_name
       FROM club_subscriptions cs
       JOIN users u ON u.id = ?
       WHERE cs.id = ?`,
      [userSub.user_id, userSub.subscription_id],
    );

    if (subDetails.length > 0) {
      const endDate = new Date(userSub.current_period_end);
      await sendSubscriptionCancellationEmail(
        subDetails[0].email,
        subDetails[0].user_name,
        subDetails[0].name,
        endDate,
      );
    }

    res.json({
      success: true,
      message:
        "Subscription cancelled successfully. Access will continue until the end of the billing period.",
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({
      error: "Failed to cancel subscription",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/users/:userId/subscription
 * Get user's active subscription with full details
 */
const handleGetUserSubscription: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await pool.query<any[]>(
      `SELECT 
        us.id as user_subscription_id,
        us.user_id,
        us.plan_id as subscription_id,
        us.stripe_subscription_id,
        us.status,
        us.bookings_used_this_month,
        us.started_at,
        us.current_period_start,
        us.current_period_end,
        us.cancelled_at,
        cs.club_id,
        cs.name,
        cs.description,
        cs.price_monthly,
        cs.currency,
        cs.booking_discount_percent,
        cs.booking_credits_monthly,
        cs.bar_discount_percent,
        cs.merch_discount_percent,
        cs.event_discount_percent,
        cs.class_discount_percent,
        cs.extras,
        c.name as club_name
       FROM user_subscriptions us
       JOIN club_subscriptions cs ON us.plan_id = cs.id
       JOIN clubs c ON cs.club_id = c.id
       WHERE us.user_id = ? AND us.status = 'active'
       LIMIT 1`,
      [userId],
    );

    if (rows.length === 0) {
      return res.json(null);
    }

    const row = rows[0];
    const userSubscription = {
      id: row.user_subscription_id,
      user_id: row.user_id,
      subscription_id: row.subscription_id,
      stripe_subscription_id: row.stripe_subscription_id,
      status: row.status,
      bookings_used_this_month: row.bookings_used_this_month,
      started_at: row.started_at,
      current_period_start: row.current_period_start,
      current_period_end: row.current_period_end,
      cancelled_at: row.cancelled_at,
      subscription: {
        id: row.subscription_id,
        club_id: row.club_id,
        club_name: row.club_name,
        name: row.name,
        description: row.description,
        price_monthly: row.price_monthly,
        currency: row.currency,
        booking_discount_percent: row.booking_discount_percent,
        booking_credits_monthly: row.booking_credits_monthly,
        bar_discount_percent: row.bar_discount_percent,
        merch_discount_percent: row.merch_discount_percent,
        event_discount_percent: row.event_discount_percent,
        class_discount_percent: row.class_discount_percent,
        extras: parseExtras(row.extras),
      },
    };

    res.json(userSubscription);
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
};

/**
 * GET /api/users/:userId/payment-methods
 * Get user's saved payment methods
 */
const handleGetPaymentMethods: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    // First, validate and fix any duplicate defaults in the database
    const [defaultCheck] = await pool.query<any[]>(
      `SELECT COUNT(*) as count FROM payment_methods WHERE user_id = ? AND is_default = 1`,
      [userId],
    );

    // If more than one default exists, fix it
    if (defaultCheck[0]?.count > 1) {
      console.log(
        `Found ${defaultCheck[0].count} default payment methods for user ${userId}, fixing...`,
      );

      // Get user's Stripe customer ID to check default in Stripe
      const [userRows] = await pool.query<any[]>(
        `SELECT stripe_customer_id FROM users WHERE id = ?`,
        [userId],
      );

      if (userRows[0]?.stripe_customer_id) {
        try {
          // Get the default payment method from Stripe
          const customer = (await stripe.customers.retrieve(
            userRows[0].stripe_customer_id,
          )) as any;
          const stripeDefaultPM =
            customer.invoice_settings?.default_payment_method;

          // Unset all defaults first
          await pool.query(
            `UPDATE payment_methods SET is_default = 0 WHERE user_id = ?`,
            [userId],
          );

          // Set the correct default based on Stripe
          if (stripeDefaultPM) {
            await pool.query(
              `UPDATE payment_methods SET is_default = 1 WHERE user_id = ? AND stripe_payment_method_id = ?`,
              [userId, stripeDefaultPM],
            );
          } else {
            // If no default in Stripe, set the most recent one as default
            await pool.query(
              `UPDATE payment_methods SET is_default = 1 WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
              [userId],
            );
          }
        } catch (stripeError) {
          console.error("Error syncing with Stripe:", stripeError);
          // If Stripe sync fails, just keep the most recent one as default
          await pool.query(
            `UPDATE payment_methods SET is_default = 0 WHERE user_id = ?`,
            [userId],
          );
          await pool.query(
            `UPDATE payment_methods SET is_default = 1 WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
            [userId],
          );
        }
      }
    }

    const [rows] = await pool.query<any[]>(
      `SELECT 
        stripe_payment_method_id as id,
        card_brand as brand,
        card_last4 as last4,
        card_exp_month as exp_month,
        card_exp_year as exp_year,
        is_default,
        created_at
       FROM payment_methods 
       WHERE user_id = ? 
       ORDER BY is_default DESC, created_at DESC`,
      [userId],
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ error: "Failed to fetch payment methods" });
  }
};

/**
 * DELETE /api/payment-methods/:paymentMethodId
 * Delete a payment method
 */
const handleDeletePaymentMethod: RequestHandler = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;

    // Get payment method details
    const [rows] = await pool.query<any[]>(
      `SELECT * FROM payment_methods WHERE stripe_payment_method_id = ?`,
      [paymentMethodId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Payment method not found" });
    }

    const pm = rows[0];

    // Check if this is the default payment method and user has active subscription
    if (pm.is_default) {
      const [activeSubs] = await pool.query<any[]>(
        `SELECT * FROM user_subscriptions WHERE user_id = ? AND status = 'active'`,
        [pm.user_id],
      );

      if (activeSubs.length > 0) {
        return res.status(400).json({
          error:
            "Cannot delete default payment method while subscription is active",
        });
      }
    }

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    // Detach payment method from Stripe
    await stripe.paymentMethods.detach(paymentMethodId);

    // Delete from database
    await pool.query(
      `DELETE FROM payment_methods WHERE stripe_payment_method_id = ?`,
      [paymentMethodId],
    );

    res.json({ success: true, message: "Payment method deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res.status(500).json({ error: "Failed to delete payment method" });
  }
};

/**
 * GET /api/admin/subscriptions/:subscriptionId/subscribers
 * Get list of subscribers for a specific subscription plan
 */
const handleGetSubscriptionSubscribers: RequestHandler = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const [rows] = await pool.query<any[]>(
      `SELECT 
        us.id as user_subscription_id,
        us.user_id,
        us.status,
        us.started_at,
        us.current_period_start,
        us.current_period_end,
        us.cancelled_at,
        us.bookings_used_this_month,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        cs.name as subscription_name,
        cs.price_monthly,
        cs.currency
       FROM user_subscriptions us
       JOIN users u ON us.user_id = u.id
       JOIN club_subscriptions cs ON us.plan_id = cs.id
       WHERE us.plan_id = ?
       ORDER BY us.started_at DESC`,
      [subscriptionId],
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching subscription subscribers:", error);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
};

/**
 * POST /api/admin/subscriptions/:userSubscriptionId/cancel
 * Admin cancels a user subscription
 */
const handleAdminCancelUserSubscription: RequestHandler = async (req, res) => {
  try {
    const { userSubscriptionId } = req.params;
    const { reason } = req.body;

    // Get subscription details
    const [subRows] = await pool.query<any[]>(
      `SELECT us.*, u.email, u.name as user_name, cs.name as subscription_name
       FROM user_subscriptions us
       JOIN users u ON us.user_id = u.id
       JOIN club_subscriptions cs ON us.plan_id = cs.id
       WHERE us.id = ?`,
      [userSubscriptionId],
    );

    if (subRows.length === 0) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const userSub = subRows[0];

    if (userSub.status === "cancelled") {
      return res.status(400).json({ error: "Subscription already cancelled" });
    }

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    // Cancel Stripe subscription immediately
    if (userSub.stripe_subscription_id) {
      await stripe.subscriptions.cancel(userSub.stripe_subscription_id);
    }

    // Update database
    await pool.query(
      `UPDATE user_subscriptions 
       SET status = 'cancelled', 
           cancelled_at = NOW(),
           cancellation_reason = ?
       WHERE id = ?`,
      [reason || "Cancelled by admin", userSubscriptionId],
    );

    // Decrement current_subscribers count
    await pool.query(
      `UPDATE club_subscriptions SET current_subscribers = GREATEST(0, current_subscribers - 1) WHERE id = ?`,
      [userSub.plan_id],
    );

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Admin cancel subscription error:", error);
    res.status(500).json({
      error: "Failed to cancel subscription",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/admin/subscriptions/:userSubscriptionId/upgrade
 * Admin upgrades a user subscription to a different plan
 */
const handleAdminUpgradeUserSubscription: RequestHandler = async (req, res) => {
  try {
    const { userSubscriptionId } = req.params;
    const { new_subscription_id } = req.body;

    if (!new_subscription_id) {
      return res.status(400).json({ error: "new_subscription_id is required" });
    }

    // Get current subscription details
    const [currentSubRows] = await pool.query<any[]>(
      `SELECT us.*, u.email, u.name as user_name, cs.stripe_price_id as old_price_id
       FROM user_subscriptions us
       JOIN users u ON us.user_id = u.id
       JOIN club_subscriptions cs ON us.plan_id = cs.id
       WHERE us.id = ?`,
      [userSubscriptionId],
    );

    if (currentSubRows.length === 0) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const currentSub = currentSubRows[0];

    // Get new subscription details
    const [newSubRows] = await pool.query<any[]>(
      `SELECT * FROM club_subscriptions WHERE id = ? AND is_active = 1`,
      [new_subscription_id],
    );

    if (newSubRows.length === 0) {
      return res
        .status(404)
        .json({ error: "New subscription not found or inactive" });
    }

    const newSub = newSubRows[0];

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    // Update Stripe subscription with new price
    if (currentSub.stripe_subscription_id && newSub.stripe_price_id) {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        currentSub.stripe_subscription_id,
      );

      await stripe.subscriptions.update(currentSub.stripe_subscription_id, {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: newSub.stripe_price_id,
          },
        ],
        proration_behavior: "always_invoice",
      });
    }

    // Update database
    await pool.query(
      `UPDATE user_subscriptions 
       SET plan_id = ?
       WHERE id = ?`,
      [new_subscription_id, userSubscriptionId],
    );

    // Update subscriber counts
    await pool.query(
      `UPDATE club_subscriptions SET current_subscribers = GREATEST(0, current_subscribers - 1) WHERE id = ?`,
      [currentSub.plan_id],
    );
    await pool.query(
      `UPDATE club_subscriptions SET current_subscribers = current_subscribers + 1 WHERE id = ?`,
      [new_subscription_id],
    );

    res.json({
      success: true,
      message: "Subscription upgraded successfully",
    });
  } catch (error) {
    console.error("Admin upgrade subscription error:", error);
    res.status(500).json({
      error: "Failed to upgrade subscription",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/subscriptions/webhook
 * Handle Stripe webhook events for subscriptions
 */
const handleSubscriptionWebhook: RequestHandler = async (req, res) => {
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    const sig = req.headers["stripe-signature"];

    if (!sig) {
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res
        .status(400)
        .json({ error: "Webhook signature verification failed" });
    }

    console.log("Received Stripe webhook event:", event.type);

    // Handle different event types
    switch (event.type) {
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;

        // Update subscription status in database
        await pool.query(
          `UPDATE user_subscriptions 
           SET status = ?,
               current_period_start = ?,
               current_period_end = ?
           WHERE stripe_subscription_id = ?`,
          [
            subscription.status,
            new Date(subscription.current_period_start * 1000),
            new Date(subscription.current_period_end * 1000),
            subscription.id,
          ],
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;

        // Mark subscription as cancelled
        await pool.query(
          `UPDATE user_subscriptions 
           SET status = 'cancelled',
               cancelled_at = NOW()
           WHERE stripe_subscription_id = ?`,
          [subscription.id],
        );

        // Decrement subscriber count
        const [subRows] = await pool.query<any[]>(
          `SELECT plan_id FROM user_subscriptions WHERE stripe_subscription_id = ?`,
          [subscription.id],
        );

        if (subRows.length > 0) {
          await pool.query(
            `UPDATE club_subscriptions 
             SET current_subscribers = GREATEST(0, current_subscribers - 1)
             WHERE id = ?`,
            [subRows[0].plan_id],
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;

        if (invoice.subscription) {
          // Reset bookings counter for the new billing period
          const [subRows] = await pool.query<any[]>(
            `SELECT us.id
             FROM user_subscriptions us
             JOIN club_subscriptions cs ON us.plan_id = cs.id
             WHERE us.stripe_subscription_id = ?`,
            [invoice.subscription],
          );

          if (subRows.length > 0) {
            await pool.query(
              `UPDATE user_subscriptions 
               SET bookings_used_this_month = 0,
                   status = 'active'
               WHERE stripe_subscription_id = ?`,
              [invoice.subscription],
            );
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;

        if (invoice.subscription) {
          // Mark subscription as past_due
          await pool.query(
            `UPDATE user_subscriptions 
             SET status = 'past_due'
             WHERE stripe_subscription_id = ?`,
            [invoice.subscription],
          );
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({
      error: "Webhook processing failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/subscriptions/user/:user_id
 * Get user's active subscriptions
 */
const handleGetUserSubscriptions: RequestHandler = async (req, res) => {
  try {
    const { user_id } = req.params;

    const [rows] = await pool.query<any[]>(
      `SELECT 
        us.*,
        cs.name as subscription_name,
        cs.description as subscription_description,
        cs.price_monthly,
        cs.currency,
        cs.booking_discount_percent,
        cs.booking_credits_monthly,
        cs.bar_discount_percent,
        cs.merch_discount_percent,
        cs.event_discount_percent,
        cs.class_discount_percent,
        cs.extras,
        c.name as club_name
      FROM user_subscriptions us
      JOIN club_subscriptions cs ON us.plan_id = cs.id
      JOIN clubs c ON cs.club_id = c.id
      WHERE us.user_id = ?
      ORDER BY us.created_at DESC`,
      [user_id],
    );

    // Parse JSON extras field
    const subscriptions = rows.map((row) => ({
      ...row,
      extras: row.extras ? JSON.parse(row.extras) : [],
    }));

    res.json(subscriptions);
  } catch (error) {
    console.error("Error fetching user subscriptions:", error);
    res.status(500).json({ error: "Failed to fetch user subscriptions" });
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
 * Check if a user exists by email and return all clubs they belong to
 */
const handleCheckUser: RequestHandler = async (req, res) => {
  try {
    const { email, club_id } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Find all user accounts with this email
    const query = `
      SELECT u.id, u.club_id, u.email, u.name, u.phone, u.avatar_url, 
             u.stripe_customer_id, u.is_active, u.created_at, u.updated_at, u.last_login_at,
             c.name as club_name, c.logo_url as club_logo
      FROM users u
      LEFT JOIN clubs c ON u.club_id = c.id
      WHERE u.email = ?
      ORDER BY u.created_at DESC
    `;

    const [rows] = await pool.query<any[]>(query, [email]);

    if (rows.length > 0) {
      // Check if any account is inactive
      const inactiveAccounts = rows.filter((r) => !r.is_active);
      if (inactiveAccounts.length === rows.length) {
        return res.json({
          success: true,
          exists: true,
          clubs: [],
          error:
            "Tu cuenta ha sido desactivada. Por favor, contacta a soporte.",
        });
      }

      // If club_id is provided (booking flow), prioritize that club
      if (club_id) {
        const matchingClub = rows.find(
          (r) => r.club_id === club_id && r.is_active,
        );
        if (matchingClub) {
          // User belongs to the requested club - return that user
          return res.json({
            success: true,
            exists: true,
            patient: matchingClub,
            clubs: [
              {
                id: matchingClub.club_id,
                name: matchingClub.club_name,
                logo_url: matchingClub.club_logo,
                user_id: matchingClub.id,
              },
            ],
          });
        }
      }

      // Return all active clubs the user belongs to
      const activeUsers = rows.filter((r) => r.is_active);
      const clubs = activeUsers.map((user) => ({
        id: user.club_id,
        name: user.club_name,
        logo_url: user.club_logo,
        user_id: user.id,
      }));

      res.json({
        success: true,
        exists: true,
        clubs,
        // If only one club, auto-select it
        patient: clubs.length === 1 ? activeUsers[0] : undefined,
      });
    } else {
      res.json({ success: true, exists: false, clubs: [] });
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

    // Check if user's club_id is NULL and update it with the booking's club_id
    const [userRows] = await pool.query<any[]>(
      "SELECT club_id FROM users WHERE id = ?",
      [user_id],
    );

    if (userRows.length > 0 && userRows[0].club_id === null) {
      console.log(
        `🏢 Assigning club_id ${club_id} to user ${user_id} on first booking`,
      );
      await pool.query("UPDATE users SET club_id = ? WHERE id = ?", [
        club_id,
        user_id,
      ]);
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

    // Check if user's club_id is NULL and update it with the booking's club_id
    const [userRows] = await pool.query<any[]>(
      "SELECT club_id FROM users WHERE id = ?",
      [user_id],
    );

    if (userRows.length > 0 && userRows[0].club_id === null) {
      console.log(
        `🏢 Assigning club_id ${club_id} to user ${user_id} on manual booking creation`,
      );
      await pool.query("UPDATE users SET club_id = ? WHERE id = ?", [
        club_id,
        user_id,
      ]);
    }

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

    // Get user's Stripe customer ID
    const [users]: any = await pool.query(
      "SELECT stripe_customer_id FROM users WHERE id = ?",
      [user_id],
    );
    const user = users[0];

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    // Create payment intent with customer if available
    const paymentIntentParams: any = {
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
    };

    // Add customer and default payment method if available
    if (user?.stripe_customer_id) {
      paymentIntentParams.customer = user.stripe_customer_id;

      // Get customer's default payment method
      const [paymentMethods] = await pool.query<any[]>(
        `SELECT stripe_payment_method_id FROM payment_methods 
         WHERE user_id = ? AND is_default = 1 LIMIT 1`,
        [user_id],
      );

      if (paymentMethods[0]?.stripe_payment_method_id) {
        paymentIntentParams.payment_method =
          paymentMethods[0].stripe_payment_method_id;
      }
    }

    const paymentIntent =
      await stripe.paymentIntents.create(paymentIntentParams);

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

    // Check if user's club_id is NULL and update it with the booking's club_id
    const [userRows] = await pool.query<any[]>(
      "SELECT club_id FROM users WHERE id = ?",
      [user_id],
    );

    if (userRows.length > 0 && userRows[0].club_id === null) {
      console.log(
        `🏢 Assigning club_id ${club_id} to user ${user_id} on first booking (payment flow)`,
      );
      await pool.query("UPDATE users SET club_id = ? WHERE id = ?", [
        club_id,
        user_id,
      ]);
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
          .header { background-color: #84cc16; color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .event-badge { background-color: #fed7aa; color: #9a3412; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; font-weight: bold; }
          .event-details { background-color: #fff7ed; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #84cc16; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #fed7aa; }
          .label { font-weight: bold; color: #9a3412; }
          .value { color: #333; }
          .total { font-size: 20px; font-weight: bold; color: #84cc16; }
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

    // Get user's Stripe customer ID
    const [users]: any = await pool.query(
      "SELECT stripe_customer_id FROM users WHERE id = ?",
      [user_id],
    );
    const user = users[0];

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    // Create payment intent with customer if available
    const paymentIntentParams: any = {
      amount: Math.round(registration_fee * 100), // Convert to cents
      currency: "mxn",
      metadata: {
        user_id: user_id.toString(),
        event_id: event_id.toString(),
        event_title: event.title,
        transaction_type: "event",
      },
    };

    // Add customer and default payment method if available
    if (user?.stripe_customer_id) {
      paymentIntentParams.customer = user.stripe_customer_id;

      // Get customer's default payment method
      const [paymentMethods] = await pool.query<any[]>(
        `SELECT stripe_payment_method_id FROM payment_methods 
         WHERE user_id = ? AND is_default = 1 LIMIT 1`,
        [user_id],
      );

      if (paymentMethods[0]?.stripe_payment_method_id) {
        paymentIntentParams.payment_method =
          paymentMethods[0].stripe_payment_method_id;
      }
    }

    const paymentIntent =
      await stripe.paymentIntents.create(paymentIntentParams);

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
        "event",
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

    // Get event details to retrieve club_id
    const [eventRows] = await pool.query<any[]>(
      "SELECT club_id FROM events WHERE id = ?",
      [event_id],
    );

    if (eventRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const eventClubId = eventRows[0].club_id;

    // Check if user's club_id is NULL and update it with the event's club_id
    const [userRows] = await pool.query<any[]>(
      "SELECT club_id FROM users WHERE id = ?",
      [user_id],
    );

    if (userRows.length > 0 && userRows[0].club_id === null) {
      console.log(
        `🏢 Assigning club_id ${eventClubId} to user ${user_id} on event registration (payment flow)`,
      );
      await pool.query("UPDATE users SET club_id = ? WHERE id = ?", [
        eventClubId,
        user_id,
      ]);
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
        WHERE transaction_type = 'event'
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

    // Check if user's club_id is NULL and update it with the event's club_id
    const [userCheckRows] = await pool.query<any[]>(
      "SELECT club_id FROM users WHERE id = ?",
      [user_id],
    );

    if (userCheckRows.length > 0 && userCheckRows[0].club_id === null) {
      console.log(
        `🏢 Assigning club_id ${admin.club_id} to user ${user_id} on manual event registration`,
      );
      await pool.query("UPDATE users SET club_id = ? WHERE id = ?", [
        admin.club_id,
        user_id,
      ]);
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
        WHERE transaction_type = 'event'
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

    // Get user's Stripe customer ID
    const [users]: any = await pool.query(
      "SELECT stripe_customer_id FROM users WHERE id = ?",
      [user_id],
    );
    const user = users[0];

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    // Create payment intent with customer if available
    const paymentIntentParams: any = {
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
    };

    // Add customer if available (required for saved payment methods)
    if (user?.stripe_customer_id) {
      paymentIntentParams.customer = user.stripe_customer_id;

      // Get user's default payment method
      const [paymentMethods]: any = await pool.query(
        "SELECT stripe_payment_method_id FROM payment_methods WHERE user_id = ? AND is_default = 1 LIMIT 1",
        [user_id],
      );

      if (paymentMethods.length > 0) {
        paymentIntentParams.payment_method =
          paymentMethods[0].stripe_payment_method_id;
      }
    }

    const paymentIntent =
      await stripe.paymentIntents.create(paymentIntentParams);

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

    // Check if user's club_id is NULL and update it with the private class club_id
    const [userRows] = await pool.query<any[]>(
      "SELECT club_id FROM users WHERE id = ?",
      [user_id],
    );

    if (userRows.length > 0 && userRows[0].club_id === null) {
      console.log(
        `🏢 Assigning club_id ${club_id} to user ${user_id} on private class booking (payment flow)`,
      );
      await pool.query("UPDATE users SET club_id = ? WHERE id = ?", [
        club_id,
        user_id,
      ]);
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
 * Middleware to verify user session
 */
const verifySession = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No session token provided",
      });
    }

    const sessionToken = authHeader.substring(7);

    // Check user session exists and isn't expired
    const [sessions] = await pool.query<any[]>(
      `SELECT s.*, u.id as user_id, u.email, u.name, u.phone, u.club_id
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.session_token = ? AND s.expires_at > NOW()`,
      [sessionToken],
    );

    if (sessions.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    // Attach user info to request
    (req as any).user = sessions[0];

    next();
  } catch (error) {
    console.error("Error verifying user session:", error);
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
    const clubFilter = admin.club_id ? admin.club_id : null;

    // Total bookings (count all completed bookings)
    const [bookingsCount] = await pool.query<any[]>(
      `SELECT COUNT(*) as total FROM bookings b 
       WHERE b.status IN ('confirmed', 'completed') 
       ${clubFilter ? "AND b.club_id = ?" : ""}`,
      clubFilter ? [clubFilter] : [],
    );

    // Total revenue from all completed/succeeded transactions
    const [revenue] = await pool.query<any[]>(
      `SELECT SUM(pt.amount) as total 
       FROM payment_transactions pt
       WHERE pt.status IN ('completed', 'succeeded')
       ${clubFilter ? "AND pt.club_id = ?" : ""}`,
      clubFilter ? [clubFilter] : [],
    );

    // Total players (users with club_id matching if club admin)
    const [playersCount] = await pool.query<any[]>(
      `SELECT COUNT(*) as total FROM users 
       WHERE is_active = 1 
       ${clubFilter ? "AND club_id = ?" : ""}`,
      clubFilter ? [clubFilter] : [],
    );

    // Upcoming bookings (future bookings that are confirmed)
    const [upcomingCount] = await pool.query<any[]>(
      `SELECT COUNT(*) as total FROM bookings b
       WHERE b.booking_date >= CURDATE() 
       AND b.status IN ('confirmed', 'pending')
       ${clubFilter ? "AND b.club_id = ?" : ""}`,
      clubFilter ? [clubFilter] : [],
    );

    // Recent bookings with full details
    const [recentBookings] = await pool.query<any[]>(
      `SELECT b.*, 
              u.name as user_name, 
              u.email as user_email, 
              c.name as club_name, 
              co.name as court_name,
              pt.amount as paid_amount,
              pt.status as payment_status
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN clubs c ON b.club_id = c.id
       JOIN courts co ON b.court_id = co.id
       LEFT JOIN payment_transactions pt ON pt.booking_id = b.id
       ${clubFilter ? "WHERE b.club_id = ?" : ""}
       ORDER BY b.created_at DESC
       LIMIT 10`,
      clubFilter ? [clubFilter] : [],
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalBookings: bookingsCount[0].total,
          totalRevenue: revenue[0].total || 0,
          totalPlayers: playersCount[0].total,
          upcomingBookings: upcomingCount[0].total,
        },
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

    // Check if user's club_id is NULL and update it with the private class club_id
    const [userRows] = await pool.query<any[]>(
      "SELECT club_id FROM users WHERE id = ?",
      [user_id],
    );

    if (userRows.length > 0 && userRows[0].club_id === null) {
      console.log(
        `🏢 Assigning club_id ${club_id} to user ${user_id} on manual private class creation`,
      );
      await pool.query("UPDATE users SET club_id = ? WHERE id = ?", [
        club_id,
        user_id,
      ]);
    }

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

    // Validate policy type and map to table
    let tableName: string;
    if (policyType === "terms" || policyType === "terms_of_service") {
      tableName = "club_terms_conditions";
    } else if (policyType === "privacy" || policyType === "privacy_policy") {
      tableName = "club_privacy_policy";
    } else if (
      policyType === "cancellation" ||
      policyType === "cancellation_policy"
    ) {
      tableName = "club_cancellation_policy";
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Invalid policy type. Use 'terms', 'privacy', or 'cancellation'",
      });
    }

    // Check if policy exists for this club
    const [existing] = await pool.query<any[]>(
      `SELECT id FROM ${tableName} WHERE club_id = ? AND is_active = 1`,
      [id],
    );

    if (existing.length > 0) {
      // Update existing policy
      await pool.query(
        `UPDATE ${tableName} SET content = ?, updated_at = NOW() WHERE club_id = ? AND is_active = 1`,
        [content, id],
      );
    } else {
      // Insert new policy
      await pool.query(
        `INSERT INTO ${tableName} (club_id, content, effective_date, is_active) VALUES (?, ?, CURDATE(), 1)`,
        [id, content],
      );
    }

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
 * GET /api/admin/club-colors
 * Get club color customization settings
 */
const handleGetClubColors: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;

    if (!admin.club_id) {
      return res.status(403).json({
        success: false,
        message: "Admin must be associated with a club",
      });
    }

    const [rows] = await pool.query<any[]>(
      `SELECT 
        primary_color,
        secondary_color,
        accent_color,
        text_color,
        background_color
      FROM clubs 
      WHERE id = ?`,
      [admin.club_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    res.json({
      success: true,
      colors: {
        primary_color: rows[0].primary_color || "#84cc16",
        secondary_color: rows[0].secondary_color || "#fb923c",
        accent_color: rows[0].accent_color || "#fed7aa",
        text_color: rows[0].text_color || "#1f2937",
        background_color: rows[0].background_color || "#ffffff",
      },
    });
  } catch (error) {
    console.error("Error fetching club colors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch club colors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * PUT /api/admin/club-colors
 * Update club color customization settings
 */
const handleUpdateClubColors: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const {
      primary_color,
      secondary_color,
      accent_color,
      text_color,
      background_color,
    } = req.body;

    if (!admin.club_id) {
      return res.status(403).json({
        success: false,
        message: "Admin must be associated with a club",
      });
    }

    // Validate hex color format
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    const colors = {
      primary_color,
      secondary_color,
      accent_color,
      text_color,
      background_color,
    };

    for (const [key, value] of Object.entries(colors)) {
      if (value && !hexColorRegex.test(value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid hex color format for ${key}. Use format: #RRGGBB`,
        });
      }
    }

    // Update colors
    await pool.query(
      `UPDATE clubs 
       SET primary_color = ?,
           secondary_color = ?,
           accent_color = ?,
           text_color = ?,
           background_color = ?
       WHERE id = ?`,
      [
        primary_color || "#84cc16",
        secondary_color || "#fb923c",
        accent_color || "#fed7aa",
        text_color || "#1f2937",
        background_color || "#ffffff",
        admin.club_id,
      ],
    );

    res.json({
      success: true,
      message: "Club colors updated successfully",
      colors: {
        primary_color: primary_color || "#84cc16",
        secondary_color: secondary_color || "#fb923c",
        accent_color: accent_color || "#fed7aa",
        text_color: text_color || "#1f2937",
        background_color: background_color || "#ffffff",
      },
    });
  } catch (error) {
    console.error("Error updating club colors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update club colors",
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
    const {
      club_id,
      court_id,
      booking_date,
      start_time,
      duration_minutes,
      user_id,
    } = req.body;

    if (!club_id || !booking_date || !start_time || !duration_minutes) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: club_id, booking_date, start_time, duration_minutes",
      });
    }

    // Get base price and fee structure from club
    const [clubRows] = await pool.query<any[]>(
      `SELECT price_per_hour, fee_structure, service_fee_percentage FROM clubs WHERE id = ?`,
      [club_id],
    );

    if (clubRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    let pricePerHour = parseFloat(clubRows[0].price_per_hour);
    const feeStructure = clubRows[0].fee_structure || "user_pays_fee";
    const serviceFeePercentage = parseFloat(
      clubRows[0].service_fee_percentage || "8.0",
    );

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

    // Normalize time to HH:MM format for comparison
    const normalizeTime = (time: string): string => {
      if (!time) return "";
      // If time includes seconds (HH:MM:SS), strip them
      return time.substring(0, 5);
    };

    const timeString = normalizeTime(start_time);

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
            const ruleStartTime = normalizeTime(rule.start_time);
            const ruleEndTime = normalizeTime(rule.end_time);
            matches = timeString >= ruleStartTime && timeString < ruleEndTime;
            console.log(
              `[PRICE CALC] Time check: ${timeString} >= ${ruleStartTime} && ${timeString} < ${ruleEndTime} = ${matches}`,
            );
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
              const ruleStartTime = normalizeTime(rule.start_time);
              const ruleEndTime = normalizeTime(rule.end_time);
              timeMatches =
                timeString >= ruleStartTime && timeString < ruleEndTime;
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
    let totalPrice = pricePerHour;

    // Apply subscription discount if user has active subscription
    let subscriptionDiscount = 0;
    if (user_id) {
      const [subRows] = await pool.query<any[]>(
        `SELECT us.*, cs.booking_discount_percent
         FROM user_subscriptions us
         JOIN club_subscriptions cs ON us.plan_id = cs.id
         WHERE us.user_id = ? AND us.status = 'active' AND cs.club_id = ?
         LIMIT 1`,
        [user_id, club_id],
      );

      if (subRows.length > 0 && subRows[0].booking_discount_percent) {
        subscriptionDiscount = subRows[0].booking_discount_percent;
        const discountAmount = totalPrice * (subscriptionDiscount / 100);
        totalPrice = totalPrice - discountAmount;
        console.log(
          `[PRICE CALC] Subscription discount applied: ${subscriptionDiscount}% = -$${discountAmount.toFixed(2)}`,
        );
      }
    }

    // Calculate service fee and IVA based on fee structure
    const IVA_RATE = 0.16; // 16% Mexican tax
    let bookingPrice = totalPrice;
    let serviceFee = 0;
    let clubReceives = 0;

    // Calculate service fee based on structure
    serviceFee = bookingPrice * (serviceFeePercentage / 100);

    let subtotal = 0;
    let userPaysServiceFee = 0;
    let clubPaysServiceFee = 0;

    switch (feeStructure) {
      case "user_pays_fee":
        // User pays booking + full service fee
        userPaysServiceFee = serviceFee;
        clubPaysServiceFee = 0;
        subtotal = bookingPrice + serviceFee;
        clubReceives = bookingPrice;
        break;

      case "shared_fee":
        // User pays booking + 50% service fee, Club pays 50%
        userPaysServiceFee = serviceFee / 2;
        clubPaysServiceFee = serviceFee / 2;
        subtotal = bookingPrice + userPaysServiceFee;
        clubReceives = bookingPrice - clubPaysServiceFee;
        break;

      case "club_absorbs_fee":
        // User only pays booking price (fee included)
        userPaysServiceFee = 0;
        clubPaysServiceFee = serviceFee;
        subtotal = bookingPrice;
        clubReceives = bookingPrice - serviceFee;
        break;

      default:
        // Default to user_pays_fee
        userPaysServiceFee = serviceFee;
        clubPaysServiceFee = 0;
        subtotal = bookingPrice + serviceFee;
        clubReceives = bookingPrice;
    }

    // Calculate IVA on subtotal
    const iva = subtotal * IVA_RATE;
    const totalWithIVA = subtotal + iva;

    // IVA breakdown for transparency
    const bookingIVA = bookingPrice * IVA_RATE;
    const serviceFeeIVA = userPaysServiceFee * IVA_RATE;

    res.json({
      success: true,
      data: {
        price_per_hour: pricePerHour,
        duration_minutes: duration_minutes,
        duration_hours: duration_minutes / 60,
        booking_price: parseFloat(bookingPrice.toFixed(2)),
        service_fee: parseFloat(serviceFee.toFixed(2)),
        user_pays_service_fee: parseFloat(userPaysServiceFee.toFixed(2)),
        club_pays_service_fee: parseFloat(clubPaysServiceFee.toFixed(2)),
        fee_structure: feeStructure,
        service_fee_percentage: serviceFeePercentage,
        subtotal: parseFloat(subtotal.toFixed(2)),
        iva_rate: IVA_RATE,
        iva: parseFloat(iva.toFixed(2)),
        booking_iva: parseFloat(bookingIVA.toFixed(2)),
        service_fee_iva: parseFloat(serviceFeeIVA.toFixed(2)),
        total_with_iva: parseFloat(totalWithIVA.toFixed(2)),
        club_receives: parseFloat(clubReceives.toFixed(2)),
        // Legacy compatibility
        total_price: parseFloat(totalWithIVA.toFixed(2)),
        has_discount: subscriptionDiscount > 0,
        subscription_discount: subscriptionDiscount,
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

/**
 * GET /api/admin/fee-structure
 * Get fee structure configuration for a club
 */
const handleGetFeeStructure: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { club_id } = admin;

    const [rows] = await pool.query<any[]>(
      `SELECT fee_structure, service_fee_percentage, fee_terms_accepted_at 
       FROM clubs 
       WHERE id = ?`,
      [club_id],
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    res.json({
      success: true,
      data: {
        fee_structure: rows[0].fee_structure || "user_pays_fee",
        service_fee_percentage:
          parseFloat(rows[0].service_fee_percentage) || 8.0,
        fee_terms_accepted_at: rows[0].fee_terms_accepted_at,
      },
    });
  } catch (error) {
    console.error("Error fetching fee structure:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch fee structure",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * PUT /api/admin/fee-structure
 * Update fee structure configuration for a club
 * Requires terms acceptance if fee_structure is changed
 */
const handleUpdateFeeStructure: RequestHandler = async (req, res) => {
  try {
    const admin = (req as any).admin;
    const { club_id } = admin;
    const { fee_structure, service_fee_percentage, terms_accepted } = req.body;

    // Validate fee_structure
    const validFeeStructures = [
      "user_pays_fee",
      "shared_fee",
      "club_absorbs_fee",
    ];
    if (!validFeeStructures.includes(fee_structure)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid fee structure. Must be one of: user_pays_fee, shared_fee, club_absorbs_fee",
      });
    }

    // Validate service_fee_percentage
    if (service_fee_percentage !== undefined) {
      const feePercent = parseFloat(service_fee_percentage);
      if (isNaN(feePercent) || feePercent < 0 || feePercent > 100) {
        return res.status(400).json({
          success: false,
          message: "Service fee percentage must be between 0 and 100",
        });
      }
    }

    // Check if fee structure is being changed
    const [currentRows] = await pool.query<any[]>(
      `SELECT fee_structure FROM clubs WHERE id = ?`,
      [club_id],
    );

    const currentFeeStructure =
      currentRows[0]?.fee_structure || "user_pays_fee";
    const isFeeStructureChanged = fee_structure !== currentFeeStructure;

    // If fee structure is being changed, require terms acceptance
    if (isFeeStructureChanged && !terms_accepted) {
      return res.status(400).json({
        success: false,
        message: "Terms acceptance required when changing fee structure",
        requires_terms_acceptance: true,
      });
    }

    // Build UPDATE query
    const updates: string[] = ["fee_structure = ?"];
    const values: any[] = [fee_structure];

    if (service_fee_percentage !== undefined) {
      updates.push("service_fee_percentage = ?");
      values.push(parseFloat(service_fee_percentage));
    }

    // If terms accepted and fee structure changed, update acceptance timestamp
    if (isFeeStructureChanged && terms_accepted) {
      updates.push("fee_terms_accepted_at = NOW()");
    }

    values.push(club_id);

    await pool.query(
      `UPDATE clubs SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    // Fetch updated data
    const [updatedRows] = await pool.query<any[]>(
      `SELECT fee_structure, service_fee_percentage, fee_terms_accepted_at 
       FROM clubs 
       WHERE id = ?`,
      [club_id],
    );

    res.json({
      success: true,
      message: "Fee structure updated successfully",
      data: {
        fee_structure: updatedRows[0].fee_structure,
        service_fee_percentage: parseFloat(
          updatedRows[0].service_fee_percentage,
        ),
        fee_terms_accepted_at: updatedRows[0].fee_terms_accepted_at,
      },
    });
  } catch (error) {
    console.error("Error updating fee structure:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update fee structure",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ==================== ADMIN PAYMENTS HANDLERS ====================

const handleGetAdminPayments: RequestHandler = async (req, res) => {
  try {
    const { club_id } = (req as any).admin;
    const { type, status, startDate, endDate, search } = req.query;

    let query = `
      SELECT 
        pt.*,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        u.avatar_url as user_avatar,
        u.stripe_customer_id as user_stripe_customer_id,
        u.club_id as user_club_id,
        pt.transaction_type as payment_type,
        pt.transaction_number,
        CASE 
          WHEN b.id IS NOT NULL THEN CONCAT('Reserva - Cancha ', ct.name, ' - ', DATE_FORMAT(b.booking_date, '%d/%m/%Y'), ' ', b.start_time)
          WHEN ep.id IS NOT NULL THEN CONCAT('Evento - ', e.title)
          WHEN pc.id IS NOT NULL THEN CONCAT('Clase con ', i.name, ' - ', DATE_FORMAT(pc.class_date, '%d/%m/%Y'))
          WHEN us.id IS NOT NULL THEN CONCAT('Suscripción - ', cs.name)
          ELSE 'Pago'
        END as description
      FROM 
        payment_transactions pt
      INNER JOIN users u ON pt.user_id = u.id
      LEFT JOIN bookings b ON pt.booking_id = b.id
      LEFT JOIN courts ct ON b.court_id = ct.id
      LEFT JOIN event_participants ep ON pt.event_participant_id = ep.id
      LEFT JOIN events e ON ep.event_id = e.id
      LEFT JOIN private_classes pc ON pt.private_class_id = pc.id
      LEFT JOIN instructors i ON pc.instructor_id = i.id
      LEFT JOIN user_subscriptions us ON pt.subscription_id = us.id
      LEFT JOIN club_subscriptions cs ON us.plan_id = cs.id
      WHERE 
        pt.club_id = ?
    `;

    const params: any[] = [club_id];

    if (type) {
      query += ` AND pt.transaction_type = ?`;
      params.push(type);
    }

    if (status) {
      query += ` AND pt.status = ?`;
      params.push(status);
    }

    if (startDate) {
      query += ` AND DATE(pt.created_at) >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND DATE(pt.created_at) <= ?`;
      params.push(endDate);
    }

    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR pt.stripe_payment_intent_id LIKE ? OR pt.transaction_number LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY pt.created_at DESC`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payments",
    });
  }
};

const handleGetPaymentStats: RequestHandler = async (req, res) => {
  try {
    const { club_id } = (req as any).admin;

    const [stats] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        COUNT(CASE WHEN pt.transaction_type = 'booking' THEN 1 END) as total_bookings,
        COUNT(CASE WHEN pt.transaction_type = 'event' THEN 1 END) as total_events,
        COUNT(CASE WHEN pt.transaction_type = 'private_class' THEN 1 END) as total_classes,
        COUNT(CASE WHEN pt.transaction_type = 'subscription' THEN 1 END) as total_subscriptions,
        SUM(CASE WHEN pt.status IN ('completed', 'processing') THEN pt.amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN pt.status = 'pending' THEN pt.amount ELSE 0 END) as pending_amount,
        SUM(CASE WHEN pt.status IN ('refunded', 'partially_refunded') THEN pt.refund_amount ELSE 0 END) as refunded_amount
      FROM 
        payment_transactions pt
      WHERE 
        pt.club_id = ?
      `,
      [club_id],
    );

    res.json({
      success: true,
      data: stats[0] || {
        total_bookings: 0,
        total_events: 0,
        total_classes: 0,
        total_subscriptions: 0,
        total_revenue: 0,
        pending_amount: 0,
        refunded_amount: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payment stats",
    });
  }
};

const handleRefundPayment: RequestHandler = async (req, res) => {
  try {
    const { club_id } = (req as any).admin;
    const paymentId = parseInt(req.params.paymentId);
    const { amount, reason } = req.body;

    // Get payment details
    const [payments] = await pool.query<RowDataPacket[]>(
      `SELECT pt.* FROM payment_transactions pt
       WHERE pt.id = ? AND pt.club_id = ?`,
      [paymentId, club_id],
    );

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    const payment = payments[0];

    if (payment.status === "refunded") {
      return res.status(400).json({
        success: false,
        error: "Payment already refunded",
      });
    }

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    // Process refund in Stripe
    const refundAmount = amount ? Math.round(amount * 100) : undefined;
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
      amount: refundAmount,
      reason: reason || "requested_by_customer",
    });

    // Update payment status
    await pool.query(
      `UPDATE payment_transactions 
       SET status = 'refunded', 
           refund_amount = ?,
           refund_reason = ?,
           refunded_at = NOW(),
           stripe_refund_id = ?,
           metadata = JSON_SET(
             COALESCE(metadata, '{}'),
             '$.refund_reason', ?,
             '$.refund_id', ?
           )
       WHERE id = ?`,
      [
        refund.amount / 100,
        reason || "",
        refund.id,
        reason || "",
        refund.id,
        paymentId,
      ],
    );

    // Get updated payment
    const [updated] = await pool.query<RowDataPacket[]>(
      `SELECT pt.*, 
              u.id as user_id,
              u.name as user_name, 
              u.email as user_email,
              u.phone as user_phone,
              u.avatar_url as user_avatar,
              u.stripe_customer_id as user_stripe_customer_id,
              u.club_id as user_club_id
       FROM payment_transactions pt
       INNER JOIN users u ON pt.user_id = u.id
       WHERE pt.id = ?`,
      [paymentId],
    );

    res.json({
      success: true,
      data: updated[0],
    });
  } catch (error) {
    console.error("Error refunding payment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to refund payment",
    });
  }
};

const handleSyncWithStripe: RequestHandler = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const { club_id } = (req as any).admin;

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    // Fetch payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Find local payment
    const [payments] = await pool.query<RowDataPacket[]>(
      `SELECT pt.* FROM payment_transactions pt
       WHERE pt.stripe_payment_intent_id = ? AND pt.club_id = ?`,
      [paymentIntentId, club_id],
    );

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    const payment = payments[0];

    // Map Stripe status to our status
    let status = payment.status;
    if (paymentIntent.status === "succeeded") {
      status = "completed";
    } else if (paymentIntent.status === "processing") {
      status = "processing";
    } else if (paymentIntent.status === "requires_payment_method") {
      status = "pending";
    } else if (paymentIntent.status === "canceled") {
      status = "failed";
    }

    // Update local payment with Stripe data
    await pool.query(
      `UPDATE payment_transactions 
       SET status = ?,
           amount = ?,
           stripe_charge_id = ?,
           paid_at = ?,
           metadata = JSON_SET(
             COALESCE(metadata, '{}'),
             '$.stripe_status', ?,
             '$.last_sync', NOW()
           )
       WHERE id = ?`,
      [
        status,
        paymentIntent.amount / 100,
        paymentIntent.latest_charge || payment.stripe_charge_id,
        paymentIntent.status === "succeeded" ? new Date() : payment.paid_at,
        paymentIntent.status,
        payment.id,
      ],
    );

    // Get updated payment
    const [updated] = await pool.query<RowDataPacket[]>(
      `SELECT pt.*, 
              u.id as user_id,
              u.name as user_name, 
              u.email as user_email,
              u.phone as user_phone,
              u.avatar_url as user_avatar,
              u.stripe_customer_id as user_stripe_customer_id,
              u.club_id as user_club_id
       FROM payment_transactions pt
       INNER JOIN users u ON pt.user_id = u.id
       WHERE pt.id = ?`,
      [payment.id],
    );

    res.json({
      success: true,
      data: updated[0],
    });
  } catch (error) {
    console.error("Error syncing with Stripe:", error);
    res.status(500).json({
      success: false,
      error: "Failed to sync with Stripe",
    });
  }
};

const handleSyncPendingPayments: RequestHandler = async (req, res) => {
  try {
    const { club_id } = (req as any).admin;

    // Get all pending payments with stripe_payment_intent_id
    const [pendingPayments] = await pool.query<RowDataPacket[]>(
      `SELECT pt.* 
       FROM payment_transactions pt
       WHERE pt.club_id = ? 
         AND pt.status = 'pending' 
         AND pt.stripe_payment_intent_id IS NOT NULL
         AND pt.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
       ORDER BY pt.created_at DESC
       LIMIT 100`,
      [club_id],
    );

    if (pendingPayments.length === 0) {
      return res.json({
        success: true,
        synced: 0,
        message: "No pending payments to sync",
      });
    }

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    });

    let syncedCount = 0;

    // Sync each pending payment
    for (const payment of pendingPayments) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          payment.stripe_payment_intent_id,
        );

        // Map Stripe status to our status
        let status = payment.status;
        if (paymentIntent.status === "succeeded") {
          status = "completed";
          syncedCount++;
        } else if (paymentIntent.status === "processing") {
          status = "processing";
        } else if (paymentIntent.status === "canceled") {
          status = "failed";
          syncedCount++;
        } else if (paymentIntent.status === "requires_payment_method") {
          status = "pending";
        }

        // Update payment status if changed
        if (status !== payment.status) {
          await pool.query(
            `UPDATE payment_transactions 
             SET status = ?,
                 amount = ?,
                 stripe_charge_id = ?,
                 paid_at = ?,
                 failed_at = ?,
                 metadata = JSON_SET(
                   COALESCE(metadata, '{}'),
                   '$.stripe_status', ?,
                   '$.last_sync', NOW()
                 )
             WHERE id = ?`,
            [
              status,
              paymentIntent.amount / 100,
              paymentIntent.latest_charge || payment.stripe_charge_id,
              paymentIntent.status === "succeeded" ? new Date() : null,
              paymentIntent.status === "canceled" ? new Date() : null,
              paymentIntent.status,
              payment.id,
            ],
          );
        }
      } catch (error) {
        console.error(
          `Error syncing payment ${payment.id}:`,
          error instanceof Error ? error.message : error,
        );
        // Continue with next payment
      }
    }

    res.json({
      success: true,
      synced: syncedCount,
      total: pendingPayments.length,
      message: `Synced ${syncedCount} of ${pendingPayments.length} pending payments`,
    });
  } catch (error) {
    console.error("Error syncing pending payments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to sync pending payments",
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
  expressApp.get("/api/clubs/:id/colors", handleGetClubColorsPublic);
  expressApp.get(
    "/api/clubs/:clubId/policies/:policyType",
    handleGetClubPolicy,
  );
  expressApp.post("/api/clubs/onboard", handleClubOnboarding);

  // Subscriptions routes
  expressApp.get("/api/subscriptions", handleGetSubscriptions);
  expressApp.get(
    "/api/subscriptions/active/:club_id",
    handleGetActiveSubscriptions,
  );
  expressApp.get(
    "/api/subscriptions/user/:user_id",
    handleGetUserSubscriptions,
  );
  expressApp.get("/api/subscriptions/:id", handleGetSubscription);
  expressApp.post(
    "/api/subscriptions",
    verifyAdminSession,
    handleCreateSubscription,
  );
  expressApp.put(
    "/api/subscriptions/:id",
    verifyAdminSession,
    handleUpdateSubscription,
  );
  expressApp.delete(
    "/api/subscriptions/:id",
    verifyAdminSession,
    handleDeleteSubscription,
  );
  expressApp.post("/api/subscriptions/subscribe", handleUserSubscribe);
  expressApp.post("/api/subscriptions/cancel", handleUserCancelSubscription);
  expressApp.post(
    "/api/subscriptions/webhook",
    express.raw({ type: "application/json" }),
    handleSubscriptionWebhook,
  );

  // Admin subscription management routes
  expressApp.get(
    "/api/admin/subscriptions/:subscriptionId/subscribers",
    verifyAdminSession,
    handleGetSubscriptionSubscribers,
  );
  expressApp.post(
    "/api/admin/subscriptions/:userSubscriptionId/cancel",
    verifyAdminSession,
    handleAdminCancelUserSubscription,
  );
  expressApp.post(
    "/api/admin/subscriptions/:userSubscriptionId/upgrade",
    verifyAdminSession,
    handleAdminUpgradeUserSubscription,
  );

  // User subscription routes
  expressApp.get("/api/users/:userId/subscription", handleGetUserSubscription);
  expressApp.get("/api/users/:userId/payment-methods", handleGetPaymentMethods);
  expressApp.delete(
    "/api/payment-methods/:paymentMethodId",
    handleDeletePaymentMethod,
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
    "/api/admin/club-colors",
    verifyAdminSession,
    handleGetClubColors,
  );
  expressApp.put(
    "/api/admin/club-colors",
    verifyAdminSession,
    handleUpdateClubColors,
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

  // Fee structure routes
  expressApp.get(
    "/api/admin/fee-structure",
    verifyAdminSession,
    handleGetFeeStructure,
  );
  expressApp.put(
    "/api/admin/fee-structure",
    verifyAdminSession,
    handleUpdateFeeStructure,
  );

  // Price calculation
  expressApp.post("/api/calculate-price", handleCalculatePrice);

  // Admin payments routes
  expressApp.get(
    "/api/admin/payments",
    verifyAdminSession,
    handleGetAdminPayments,
  );
  expressApp.get(
    "/api/admin/payments/stats",
    verifyAdminSession,
    handleGetPaymentStats,
  );
  expressApp.post(
    "/api/admin/payments/:paymentId/refund",
    verifyAdminSession,
    handleRefundPayment,
  );
  expressApp.post(
    "/api/admin/payments/sync-stripe",
    verifyAdminSession,
    handleSyncWithStripe,
  );
  expressApp.post(
    "/api/admin/payments/sync-pending",
    verifyAdminSession,
    handleSyncPendingPayments,
  );

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
