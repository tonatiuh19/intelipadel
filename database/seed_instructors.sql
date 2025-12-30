-- Sample instructors for testing
-- Replace club_id with your actual club ID from the clubs table

-- Get your club_id first by running:
-- SELECT id, name FROM clubs;

-- Then insert sample instructors (replace ? with your club_id):

INSERT INTO instructors (
  club_id,
  name,
  email,
  phone,
  bio,
  specialties,
  years_of_experience,
  rating,
  hourly_rate,
  is_active
) VALUES
(
  1,  -- Replace with your club_id
  'Carlos Rodríguez',
  'carlos.rodriguez@example.com',
  '+52 123 456 7890',
  'Instructor profesional con más de 10 años de experiencia enseñando pádel. Especializado en técnicas avanzadas y estrategia de juego.',
  'Técnica avanzada, Estrategia de juego, Competición',
  10,
  4.9,
  800.00,
  1
),
(
  1,  -- Replace with your club_id
  'María González',
  'maria.gonzalez@example.com',
  '+52 123 456 7891',
  'Instructora certificada especializada en principiantes y desarrollo de fundamentos. Paciencia y dedicación en cada clase.',
  'Principiantes, Fundamentos, Técnica básica',
  5,
  4.8,
  600.00,
  1
),
(
  1,  -- Replace with your club_id
  'Roberto Sánchez',
  'roberto.sanchez@example.com',
  '+52 123 456 7892',
  'Ex jugador profesional ahora dedicado a la enseñanza. Enfoque en preparación física y mental para competencias.',
  'Preparación física, Competición, Mentalidad ganadora',
  15,
  5.0,
  1000.00,
  1
),
(
  1,  -- Replace with your club_id
  'Ana Martínez',
  'ana.martinez@example.com',
  '+52 123 456 7893',
  'Especialista en clases para niños y adolescentes. Enfoque divertido y educativo adaptado a cada edad.',
  'Niños, Adolescentes, Técnica básica',
  7,
  4.7,
  550.00,
  1
);

-- Verify the inserted instructors:
-- SELECT * FROM instructors WHERE club_id = 1;
