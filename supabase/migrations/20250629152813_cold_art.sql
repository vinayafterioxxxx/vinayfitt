/*
  # Initial Schema Setup for VinayFit

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `role` (enum: client, trainer, nutritionist, admin, hr)
      - `avatar_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `exercises`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text)
      - `muscle_groups` (text array)
      - `instructions` (text)
      - `equipment` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `workout_templates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `duration` (integer)
      - `exercises` (jsonb)
      - `created_by` (uuid, references profiles)
      - `is_public` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `workout_plans`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references profiles)
      - `trainer_id` (uuid, references profiles)
      - `name` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `schedule` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `workout_sessions`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references profiles)
      - `template_id` (uuid, references workout_templates)
      - `plan_id` (uuid, references workout_plans)
      - `date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `exercises` (jsonb)
      - `notes` (text)
      - `completed` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `metrics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `metric_type` (text)
      - `value` (numeric)
      - `unit` (text)
      - `date` (date)
      - `time` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for trainers to manage their clients' data
    - Add policies for admins to access all data
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('client', 'trainer', 'nutritionist', 'admin', 'hr');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role user_role DEFAULT 'client',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  muscle_groups text[] DEFAULT '{}',
  instructions text,
  equipment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workout_templates table
CREATE TABLE IF NOT EXISTS workout_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  duration integer DEFAULT 30,
  exercises jsonb DEFAULT '[]',
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workout_plans table
CREATE TABLE IF NOT EXISTS workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  schedule jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workout_sessions table
CREATE TABLE IF NOT EXISTS workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  template_id uuid REFERENCES workout_templates(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES workout_plans(id) ON DELETE SET NULL,
  date date NOT NULL,
  start_time time,
  end_time time,
  exercises jsonb DEFAULT '[]',
  notes text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Exercises policies (public read, authenticated users can create)
CREATE POLICY "Anyone can read exercises"
  ON exercises
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create exercises"
  ON exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Workout templates policies
CREATE POLICY "Users can read public templates or own templates"
  ON workout_templates
  FOR SELECT
  TO authenticated
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create own templates"
  ON workout_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own templates"
  ON workout_templates
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete own templates"
  ON workout_templates
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Workout plans policies
CREATE POLICY "Users can read plans where they are client or trainer"
  ON workout_plans
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid() OR trainer_id = auth.uid());

CREATE POLICY "Trainers can create plans for clients"
  ON workout_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can update their plans"
  ON workout_plans
  FOR UPDATE
  TO authenticated
  USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can delete their plans"
  ON workout_plans
  FOR DELETE
  TO authenticated
  USING (trainer_id = auth.uid());

-- Workout sessions policies
CREATE POLICY "Users can read their own sessions"
  ON workout_sessions
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Users can create their own sessions"
  ON workout_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Users can update their own sessions"
  ON workout_sessions
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid());

-- Metrics policies
CREATE POLICY "Users can read own metrics"
  ON metrics
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own metrics"
  ON metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own metrics"
  ON metrics
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own metrics"
  ON metrics
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER workout_templates_updated_at
  BEFORE UPDATE ON workout_templates
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER workout_plans_updated_at
  BEFORE UPDATE ON workout_plans
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER workout_sessions_updated_at
  BEFORE UPDATE ON workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();