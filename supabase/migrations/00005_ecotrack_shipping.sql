-- ====================================================================
-- ELINE PARFUMERIE - ECOTRACK / NAVEX SHIPPING INTEGRATION
-- ====================================================================

-- Add shipping and tracking fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS shipping_provider TEXT DEFAULT 'ecotrack',
ADD COLUMN IF NOT EXISTS shipping_label_url TEXT,
ADD COLUMN IF NOT EXISTS shipping_status TEXT,
ADD COLUMN IF NOT EXISTS shipping_synced_at TIMESTAMPTZ;

-- Index tracking number for fast lookup
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
