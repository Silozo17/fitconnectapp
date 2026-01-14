ALTER TABLE public.gym_profiles
ADD COLUMN IF NOT EXISTS vat_registered boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS vat_number text;