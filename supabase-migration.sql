-- Migration: Add payment method and receipt image to orders table
-- Run this in Supabase SQL Editor

-- Add payment_method column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT 
CHECK (payment_method IN ('cash', 'credit', 'debit', 'pix'));

-- Add receipt_image column (stores the URL from Supabase Storage)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS receipt_image TEXT;

-- Optional: Add index for payment method queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

-- ============================================
-- STORAGE BUCKET SETUP
-- Run this in Supabase SQL Editor OR create via Dashboard
-- ============================================

-- Create the storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to receipts
CREATE POLICY "Public read access for receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts');

-- Allow authenticated/anon users to upload receipts
CREATE POLICY "Allow uploads to receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'receipts');

-- Allow users to delete their receipts
CREATE POLICY "Allow delete receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'receipts');

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders';
