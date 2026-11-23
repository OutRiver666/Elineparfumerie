-- ====================================================================
-- ELINE PARFUMERIE - STORE SETTINGS TABLE
-- Persists brand info, contact details, and promotional pack rules.
-- (Wilaya delivery rates are already stored in wilaya_delivery_rates.)
-- ====================================================================

CREATE TABLE IF NOT EXISTS store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    brand_name TEXT NOT NULL DEFAULT 'Éline Parfumerie',
    contact_phone TEXT NOT NULL DEFAULT '0550 00 00 00',
    support_email TEXT NOT NULL DEFAULT 'contact@elineparfumerie.dz',
    address_fr TEXT NOT NULL DEFAULT 'Alger, Algérie',
    address_ar TEXT NOT NULL DEFAULT 'الجزائر العاصمة، الجزائر',
    currency TEXT NOT NULL DEFAULT 'DZD — Dinar Algérien',
    pack_3_discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 15 CHECK (pack_3_discount_pct >= 0 AND pack_3_discount_pct <= 90),
    pack_5_discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 20 CHECK (pack_5_discount_pct >= 0 AND pack_5_discount_pct <= 90),
    pack_10_discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 25 CHECK (pack_10_discount_pct >= 0 AND pack_10_discount_pct <= 90),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO store_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'store_settings'
      AND policyname = 'Public read store_settings'
  ) THEN
    CREATE POLICY "Public read store_settings"
      ON store_settings
      FOR SELECT
      USING (true);
  END IF;
END $$;
