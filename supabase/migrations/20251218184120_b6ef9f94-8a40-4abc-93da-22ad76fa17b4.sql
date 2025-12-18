-- Add vat_registered column to coach_invoice_settings
ALTER TABLE coach_invoice_settings 
ADD COLUMN IF NOT EXISTS vat_registered BOOLEAN DEFAULT false;