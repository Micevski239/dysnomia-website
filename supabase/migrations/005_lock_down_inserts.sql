-- ============================================================
-- Lock down direct INSERTs on orders and reviews
-- All creation must go through the rate-limited RPC functions
-- (create_validated_order, create_review) which use SECURITY DEFINER
-- ============================================================

-- Remove the open INSERT policy on orders
-- Orders are now created exclusively via create_validated_order() RPC
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Remove the open INSERT policy on reviews
-- Reviews are now created exclusively via create_review() RPC
DROP POLICY IF EXISTS "Anyone can create reviews" ON reviews;
