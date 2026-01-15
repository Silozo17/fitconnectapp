-- Add hierarchy_level column to gym_staff for role-based access control
ALTER TABLE public.gym_staff 
ADD COLUMN IF NOT EXISTS hierarchy_level INTEGER;

-- Update existing staff records with hierarchy levels based on role
-- Level 6: Gym Owner (ultimate power)
-- Level 5: Area Manager (1+ locations)
-- Level 4: Manager (location specific)
-- Level 3: Front Desk Staff (location specific) - maps to 'staff' role
-- Level 2: Coach (location specific)
-- Level 1: Marketing (1+ locations)
UPDATE public.gym_staff SET hierarchy_level = 
  CASE role
    WHEN 'owner' THEN 6
    WHEN 'area_manager' THEN 5
    WHEN 'manager' THEN 4
    WHEN 'staff' THEN 3
    WHEN 'coach' THEN 2
    WHEN 'marketing' THEN 1
    ELSE 1
  END
WHERE hierarchy_level IS NULL;

-- Add vat_applicable column to gym_products
ALTER TABLE public.gym_products 
ADD COLUMN IF NOT EXISTS vat_applicable BOOLEAN DEFAULT true;

-- Add vat_amount column to gym_invoices for storing calculated VAT
ALTER TABLE public.gym_invoices 
ADD COLUMN IF NOT EXISTS vat_amount NUMERIC(10,2) DEFAULT 0;

-- Add apply_vat column to gym_invoices to track if VAT was applied
ALTER TABLE public.gym_invoices 
ADD COLUMN IF NOT EXISTS apply_vat BOOLEAN DEFAULT false;

-- Create a trigger function to auto-set hierarchy_level on insert
CREATE OR REPLACE FUNCTION public.set_staff_hierarchy_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.hierarchy_level IS NULL THEN
    NEW.hierarchy_level := CASE NEW.role
      WHEN 'owner' THEN 6
      WHEN 'area_manager' THEN 5
      WHEN 'manager' THEN 4
      WHEN 'staff' THEN 3
      WHEN 'coach' THEN 2
      WHEN 'marketing' THEN 1
      ELSE 1
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set hierarchy level
DROP TRIGGER IF EXISTS set_staff_hierarchy_level_trigger ON public.gym_staff;
CREATE TRIGGER set_staff_hierarchy_level_trigger
BEFORE INSERT OR UPDATE OF role ON public.gym_staff
FOR EACH ROW
EXECUTE FUNCTION public.set_staff_hierarchy_level();

-- Add location assignment support for staff (for location-specific roles)
ALTER TABLE public.gym_staff 
ADD COLUMN IF NOT EXISTS assigned_location_ids UUID[] DEFAULT '{}';

-- Add column to track if staff can manage multiple locations
ALTER TABLE public.gym_staff 
ADD COLUMN IF NOT EXISTS multi_location_access BOOLEAN DEFAULT false;

-- Add comment to explain hierarchy levels
COMMENT ON COLUMN public.gym_staff.hierarchy_level IS 'Role hierarchy: 6=Owner, 5=Area Manager, 4=Manager, 3=Front Desk, 2=Coach, 1=Marketing';