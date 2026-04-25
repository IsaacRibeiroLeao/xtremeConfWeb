-- ============================================
-- STORAGE BUCKET SETUP FOR RECEIPTS
-- Run this in Supabase SQL Editor
-- (The orders table columns are already created)
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
