-- Promote User to FOUNDER Role
-- Run this directly in Render's PostgreSQL shell

-- First, check if user exists
SELECT id, email, name, role, created_at 
FROM users 
WHERE LOWER(email) = LOWER('ceo@banda-chao.com');

-- Update the role to FOUNDER
UPDATE users 
SET role = 'FOUNDER', updated_at = NOW() 
WHERE LOWER(email) = LOWER('ceo@banda-chao.com');

-- Verify the update
SELECT id, email, name, role, updated_at 
FROM users 
WHERE LOWER(email) = LOWER('ceo@banda-chao.com');





