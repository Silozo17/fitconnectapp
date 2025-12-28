-- Part 1: Client Date of Birth with auto-calculated age

-- Add date_of_birth column to client_profiles
ALTER TABLE public.client_profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Create function to calculate age from DOB
CREATE OR REPLACE FUNCTION public.calculate_age(dob DATE)
RETURNS INTEGER AS $$
BEGIN
  IF dob IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, dob))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Create trigger function to auto-update age from DOB
CREATE OR REPLACE FUNCTION public.update_age_from_dob()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date_of_birth IS NOT NULL THEN
    NEW.age := public.calculate_age(NEW.date_of_birth);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for client_profiles
DROP TRIGGER IF EXISTS trg_update_age_from_dob ON public.client_profiles;
CREATE TRIGGER trg_update_age_from_dob
BEFORE INSERT OR UPDATE OF date_of_birth ON public.client_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_age_from_dob();

-- Part 2: Coach Experience with auto-incrementing years

-- Add experience_start_date column to coach_profiles
ALTER TABLE public.coach_profiles ADD COLUMN IF NOT EXISTS experience_start_date DATE;

-- Create function to calculate experience years from start date
CREATE OR REPLACE FUNCTION public.calculate_experience_years(start_date DATE)
RETURNS INTEGER AS $$
BEGIN
  IF start_date IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN GREATEST(0, EXTRACT(YEAR FROM AGE(CURRENT_DATE, start_date))::INTEGER);
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Create trigger function to auto-update experience_years from start_date
CREATE OR REPLACE FUNCTION public.update_experience_years()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.experience_start_date IS NOT NULL THEN
    NEW.experience_years := public.calculate_experience_years(NEW.experience_start_date);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for coach_profiles
DROP TRIGGER IF EXISTS trg_update_experience_years ON public.coach_profiles;
CREATE TRIGGER trg_update_experience_years
BEFORE INSERT OR UPDATE OF experience_start_date ON public.coach_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_experience_years();

-- Migrate existing coach data: calculate experience_start_date from current experience_years
UPDATE public.coach_profiles 
SET experience_start_date = (CURRENT_DATE - (experience_years * INTERVAL '1 year'))::DATE
WHERE experience_years IS NOT NULL AND experience_start_date IS NULL;

-- Migrate existing client data: calculate date_of_birth from current age (approximate)
UPDATE public.client_profiles 
SET date_of_birth = (CURRENT_DATE - (age * INTERVAL '1 year'))::DATE
WHERE age IS NOT NULL AND date_of_birth IS NULL;