/*
  # Sample Data Migration

  1. Sample Data
    - Insert sample exercises for the application
    - Provides basic exercises across different categories
    - Includes bodyweight, strength, and cardio exercises

  2. Data Safety
    - Uses conditional inserts to avoid duplicates
    - Safe to run multiple times
*/

-- Insert sample exercises (only if they don't already exist)
DO $$
BEGIN
  -- Check if exercises table is empty before inserting
  IF NOT EXISTS (SELECT 1 FROM exercises LIMIT 1) THEN
    INSERT INTO exercises (name, category, muscle_groups, instructions, equipment) VALUES
      ('Push-ups', 'Bodyweight', ARRAY['Chest', 'Shoulders', 'Triceps'], 'Start in plank position, lower body to ground, push back up', 'None'),
      ('Squats', 'Bodyweight', ARRAY['Quadriceps', 'Glutes', 'Hamstrings'], 'Stand with feet shoulder-width apart, lower hips back and down', 'None'),
      ('Bench Press', 'Strength', ARRAY['Chest', 'Shoulders', 'Triceps'], 'Lie on bench, lower bar to chest, press up', 'Barbell, Bench'),
      ('Deadlift', 'Strength', ARRAY['Hamstrings', 'Glutes', 'Back'], 'Stand with feet hip-width apart, lift bar from ground', 'Barbell'),
      ('Pull-ups', 'Bodyweight', ARRAY['Back', 'Biceps'], 'Hang from bar, pull body up until chin over bar', 'Pull-up bar'),
      ('Overhead Press', 'Strength', ARRAY['Shoulders', 'Triceps', 'Core'], 'Press weight overhead from shoulder level', 'Barbell or Dumbbells'),
      ('Barbell Rows', 'Strength', ARRAY['Back', 'Biceps'], 'Pull barbell to lower chest while bent over', 'Barbell'),
      ('Lunges', 'Bodyweight', ARRAY['Quadriceps', 'Glutes', 'Hamstrings'], 'Step forward and lower back knee toward ground', 'None'),
      ('Plank', 'Bodyweight', ARRAY['Core', 'Shoulders'], 'Hold straight line from head to heels', 'None'),
      ('Mountain Climbers', 'Cardio', ARRAY['Core', 'Shoulders', 'Legs'], 'Alternate bringing knees to chest in plank position', 'None');
  END IF;
END $$;