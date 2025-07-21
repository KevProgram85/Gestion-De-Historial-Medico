/*
  # Sistema Médico - Esquema de Base de Datos

  1. Nuevas Tablas
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text)
      - `role` (enum: admin, doctor)
      - `specialization` (text, opcional)
      - `created_at` (timestamp)
    
    - `patients`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text)
      - `phone` (text)
      - `date_of_birth` (date)
      - `address` (text, opcional)
      - `blood_type` (text, opcional)
      - `allergies` (text, opcional)
      - `emergency_contact` (text, opcional)
      - `emergency_phone` (text, opcional)
      - `user_id` (uuid, references user_profiles)
      - `created_at` (timestamp)
    
    - `consultations`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `doctor_id` (uuid, references user_profiles)
      - `date` (date)
      - `symptoms` (text)
      - `diagnosis` (text)
      - `treatment` (text)
      - `prescription` (text, opcional)
      - `notes` (text, opcional)
      - `follow_up_date` (date, opcional)
      - `created_at` (timestamp)
    
    - `appointments`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `doctor_id` (uuid, references user_profiles)
      - `date` (date)
      - `time` (time)
      - `type` (enum: consultation, follow-up, emergency, routine)
      - `status` (enum: scheduled, completed, cancelled, no-show)
      - `notes` (text, opcional)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para que los usuarios solo accedan a sus datos
    - Políticas para médicos y administradores
*/

-- Crear tipos enum
CREATE TYPE user_role AS ENUM ('admin', 'doctor');
CREATE TYPE appointment_type AS ENUM ('consultation', 'follow-up', 'emergency', 'routine');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no-show');

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'doctor',
  specialization text,
  created_at timestamptz DEFAULT now()
);

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  date_of_birth date NOT NULL,
  address text,
  blood_type text,
  allergies text,
  emergency_contact text,
  emergency_phone text,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Tabla de consultas
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  symptoms text NOT NULL,
  diagnosis text NOT NULL,
  treatment text NOT NULL,
  prescription text,
  notes text,
  follow_up_date date,
  created_at timestamptz DEFAULT now()
);

-- Tabla de citas
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  time time NOT NULL,
  type appointment_type NOT NULL DEFAULT 'consultation',
  status appointment_status NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Políticas para patients
CREATE POLICY "Users can read own patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own patients"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own patients"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own patients"
  ON patients
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Políticas para consultations
CREATE POLICY "Users can read consultations for their patients"
  ON consultations
  FOR SELECT
  TO authenticated
  USING (
    doctor_id = auth.uid() OR 
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

CREATE POLICY "Doctors can insert consultations"
  ON consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their consultations"
  ON consultations
  FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid());

-- Políticas para appointments
CREATE POLICY "Users can read appointments for their patients"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    doctor_id = auth.uid() OR 
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert appointments for their patients"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    doctor_id = auth.uid() AND
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update appointments for their patients"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    doctor_id = auth.uid() AND
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, 'doctor');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);