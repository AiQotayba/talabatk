-- Add new address fields to the database
-- Run this SQL directly on your PostgreSQL database

ALTER TABLE "Address" 
ADD COLUMN IF NOT EXISTS "building_number" TEXT,
ADD COLUMN IF NOT EXISTS "building_image_url" TEXT,
ADD COLUMN IF NOT EXISTS "door_image_url" TEXT;

