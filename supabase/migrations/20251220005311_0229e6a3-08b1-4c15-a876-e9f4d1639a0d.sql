-- Add refund tracking columns to payment tables

-- Add columns to content_purchases for status and refund tracking
ALTER TABLE content_purchases 
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS refund_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz;

-- Add refund tracking columns to booking_requests
ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS refund_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz;

-- Add refund tracking columns to client_package_purchases
ALTER TABLE client_package_purchases
  ADD COLUMN IF NOT EXISTS refund_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz;

-- Add refund tracking columns to coach_invoices
ALTER TABLE coach_invoices
  ADD COLUMN IF NOT EXISTS refund_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz;