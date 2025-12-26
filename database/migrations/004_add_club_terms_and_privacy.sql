-- Migration: Add club-specific terms and conditions, and privacy policy tables
-- Created: 2025-12-26
-- Description: Each club can have their own terms and conditions and privacy policy

-- Table for club terms and conditions
CREATE TABLE IF NOT EXISTS `club_terms_conditions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `club_id` INT(11) NOT NULL,
  `version` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1.0',
  `content` LONGTEXT COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Terms and conditions content in HTML or markdown',
  `effective_date` DATE NOT NULL COMMENT 'Date when these terms become effective',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'Whether this version is currently active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_club_terms` (`club_id`, `is_active`),
  KEY `idx_effective_date` (`effective_date`),
  CONSTRAINT `fk_club_terms_club` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for club privacy policy
CREATE TABLE IF NOT EXISTS `club_privacy_policy` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `club_id` INT(11) NOT NULL,
  `version` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1.0',
  `content` LONGTEXT COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Privacy policy content in HTML or markdown',
  `effective_date` DATE NOT NULL COMMENT 'Date when this policy becomes effective',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'Whether this version is currently active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_club_privacy` (`club_id`, `is_active`),
  KEY `idx_effective_date` (`effective_date`),
  CONSTRAINT `fk_club_privacy_club` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for club cancellation policy (optional, but useful for booking system)
CREATE TABLE IF NOT EXISTS `club_cancellation_policy` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `club_id` INT(11) NOT NULL,
  `version` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1.0',
  `content` LONGTEXT COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Cancellation policy content in HTML or markdown',
  `hours_before_cancellation` INT(11) DEFAULT 24 COMMENT 'Minimum hours before booking to cancel',
  `refund_percentage` DECIMAL(5,2) DEFAULT 100.00 COMMENT 'Percentage of refund if cancelled in time',
  `effective_date` DATE NOT NULL COMMENT 'Date when this policy becomes effective',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'Whether this version is currently active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_club_cancellation` (`club_id`, `is_active`),
  KEY `idx_effective_date` (`effective_date`),
  CONSTRAINT `fk_club_cancellation_club` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better query performance
CREATE INDEX `idx_club_terms_version` ON `club_terms_conditions` (`club_id`, `version`);
CREATE INDEX `idx_club_privacy_version` ON `club_privacy_policy` (`club_id`, `version`);
CREATE INDEX `idx_club_cancellation_version` ON `club_cancellation_policy` (`club_id`, `version`);

-- Insert sample data for existing clubs (Club ID 1 and 2 from schema.sql)
INSERT INTO `club_terms_conditions` (`club_id`, `version`, `content`, `effective_date`, `is_active`) VALUES
(1, '1.0', '<h2>Términos y Condiciones de Pádel Club Premium</h2>
<p>Bienvenido a Pádel Club Premium. Al realizar una reserva, usted acepta los siguientes términos y condiciones:</p>
<h3>1. Reservas</h3>
<ul>
  <li>Las reservas deben realizarse con al menos 1 hora de anticipación</li>
  <li>El pago debe completarse al momento de la reserva</li>
  <li>Las reservas no utilizadas no serán reembolsadas sin previo aviso</li>
</ul>
<h3>2. Cancelaciones</h3>
<ul>
  <li>Cancelaciones con más de 24 horas: reembolso completo</li>
  <li>Cancelaciones con menos de 24 horas: sin reembolso</li>
</ul>
<h3>3. Normas del Club</h3>
<ul>
  <li>El uso de calzado deportivo adecuado es obligatorio</li>
  <li>Respete los horarios de inicio y fin de su reserva</li>
  <li>Mantenga las instalaciones limpias</li>
</ul>', CURRENT_DATE, 1),
(2, '1.0', '<h2>Términos y Condiciones de Pádel Arena</h2>
<p>Al utilizar las instalaciones de Pádel Arena, usted acepta cumplir con estos términos:</p>
<h3>1. Uso de Instalaciones</h3>
<ul>
  <li>Las canchas deben ser reservadas con anticipación</li>
  <li>El tiempo de juego incluye el tiempo de preparación</li>
  <li>No se permite el ingreso de mascotas</li>
</ul>
<h3>2. Responsabilidad</h3>
<ul>
  <li>Los usuarios son responsables de su propia seguridad</li>
  <li>El club no se hace responsable por objetos personales perdidos</li>
</ul>', CURRENT_DATE, 1);

INSERT INTO `club_privacy_policy` (`club_id`, `version`, `content`, `effective_date`, `is_active`) VALUES
(1, '1.0', '<h2>Política de Privacidad de Pádel Club Premium</h2>
<h3>Recopilación de Datos</h3>
<p>Recopilamos la siguiente información personal:</p>
<ul>
  <li>Nombre y apellidos</li>
  <li>Correo electrónico</li>
  <li>Número de teléfono</li>
  <li>Información de pago (procesada de forma segura por Stripe)</li>
</ul>
<h3>Uso de la Información</h3>
<p>Utilizamos su información para:</p>
<ul>
  <li>Procesar sus reservas</li>
  <li>Enviar confirmaciones y recordatorios</li>
  <li>Mejorar nuestros servicios</li>
  <li>Comunicaciones de marketing (con su consentimiento)</li>
</ul>
<h3>Protección de Datos</h3>
<p>Sus datos están protegidos según la LFPDPPP mexicana. No compartimos su información con terceros sin su consentimiento.</p>', CURRENT_DATE, 1),
(2, '1.0', '<h2>Política de Privacidad de Pádel Arena</h2>
<h3>Información que Recopilamos</h3>
<p>Recopilamos datos necesarios para brindar nuestros servicios:</p>
<ul>
  <li>Datos de contacto (nombre, email, teléfono)</li>
  <li>Historial de reservas</li>
  <li>Preferencias de juego</li>
</ul>
<h3>Derechos del Usuario</h3>
<p>Usted tiene derecho a:</p>
<ul>
  <li>Acceder a sus datos personales</li>
  <li>Rectificar información incorrecta</li>
  <li>Solicitar la eliminación de sus datos</li>
  <li>Oponerse al procesamiento de sus datos</li>
</ul>
<h3>Contacto</h3>
<p>Para ejercer sus derechos, contáctenos en privacy@padelarena.com</p>', CURRENT_DATE, 1);

INSERT INTO `club_cancellation_policy` (`club_id`, `version`, `content`, `hours_before_cancellation`, `refund_percentage`, `effective_date`, `is_active`) VALUES
(1, '1.0', '<h2>Política de Cancelación de Pádel Club Premium</h2>
<h3>Cancelaciones con Reembolso Completo</h3>
<p>Recibirá un reembolso del 100% si cancela con al menos 24 horas de anticipación.</p>
<h3>Cancelaciones Tardías</h3>
<p>Cancelaciones con menos de 24 horas no son elegibles para reembolso.</p>
<h3>Proceso de Reembolso</h3>
<p>Los reembolsos se procesan en 5-7 días hábiles a su método de pago original.</p>', 24, 100.00, CURRENT_DATE, 1),
(2, '1.0', '<h2>Política de Cancelación de Pádel Arena</h2>
<h3>Términos de Cancelación</h3>
<ul>
  <li>Más de 24 horas: Reembolso completo</li>
  <li>12-24 horas: Reembolso del 50%</li>
  <li>Menos de 12 horas: Sin reembolso</li>
</ul>
<h3>Cómo Cancelar</h3>
<p>Puede cancelar desde su cuenta en la sección "Mis Reservas".</p>', 24, 100.00, CURRENT_DATE, 1);
