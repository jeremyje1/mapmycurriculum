-- Add password column to legacy auth users
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "password" TEXT;
