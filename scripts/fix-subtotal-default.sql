-- Fix existing orders with null subtotal by setting them to 0
-- This migration should be run after the schema update
UPDATE orders
SET subtotal = 0
WHERE subtotal IS NULL;

-- Verify all orders have subtotal set
-- SELECT COUNT(*) FROM orders WHERE subtotal IS NULL; -- Should return 0
