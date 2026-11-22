-- ====================================================================
-- ELINE PARFUMERIE - PRODUCT IMAGE LANDING PAGE MODE
-- Adds per-product display mode ('standard', 'landing_only', 'both')
-- and ordered landing page image URLs (single tall or stacked slices).
-- ====================================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS landing_page_mode TEXT NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS landing_page_images TEXT[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_landing_page_mode_check'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_landing_page_mode_check
      CHECK (landing_page_mode IN ('standard', 'landing_only', 'both'));
  END IF;
END $$;
