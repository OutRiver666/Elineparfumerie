-- ====================================================================
-- ELINE PARFUMERIE - EXPAND FRAGRANCE CLASSIFICATIONS (X2 to X8)
-- ====================================================================

-- Add new classification levels to fragrance_classification enum
ALTER TYPE fragrance_classification ADD VALUE IF NOT EXISTS 'X2';
ALTER TYPE fragrance_classification ADD VALUE IF NOT EXISTS 'X3';
ALTER TYPE fragrance_classification ADD VALUE IF NOT EXISTS 'X5';
ALTER TYPE fragrance_classification ADD VALUE IF NOT EXISTS 'X6';
ALTER TYPE fragrance_classification ADD VALUE IF NOT EXISTS 'X7';
