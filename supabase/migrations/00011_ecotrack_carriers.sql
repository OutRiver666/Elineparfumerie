-- ============================================================================
-- ELINE PARFUMERIE - DYNAMIC ECOTRACK DELIVERY CARRIERS
-- Allows adding any EcoTrack-compatible Algerian delivery company (URL + Token)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ecotrack_carriers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  api_token TEXT NOT NULL,
  accent_color TEXT NOT NULL DEFAULT 'blue',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ecotrack_carriers_active_sort
  ON ecotrack_carriers (is_active, sort_order);

-- Enable RLS (accessed via server-side service role client)
ALTER TABLE ecotrack_carriers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to ecotrack_carriers" ON ecotrack_carriers;
CREATE POLICY "Service role full access to ecotrack_carriers"
  ON ecotrack_carriers
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Seed default built-in carriers (Navex & Anderson)
INSERT INTO ecotrack_carriers (id, name, short_name, base_url, api_token, accent_color, is_active, sort_order)
VALUES
  (
    'navex',
    'Navex Delivery',
    'Navex',
    'https://navexdelivery.ecotrack.dz',
    'fPPdVFNKnm23s2ekbLT018v5Tafrn4ulJBjjEDVbB02FLG8yaRm0Tx4oUch5',
    'amber',
    true,
    1
  ),
  (
    'anderson',
    'Anderson Logistique',
    'Anderson',
    'https://anderson-ecommerce.ecotrack.dz',
    'qjP6BI13RQnyd4ff0IFKjGjGnLe8e6puJ7fHGqkywTLPqkOFnWm9kCYUvlBk',
    'orange',
    true,
    2
  )
ON CONFLICT (id) DO NOTHING;
