-- ============================================================================
-- ELINE PARFUMERIE - STOREFRONT CONTENT & ACTIVE THEME TABLE
-- Instant ACID persistence for themes, hero, gender, seasons & collections
-- ============================================================================

CREATE TABLE IF NOT EXISTS storefront_content (
  id TEXT PRIMARY KEY DEFAULT 'default',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE storefront_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read storefront_content" ON storefront_content;
CREATE POLICY "Public read storefront_content"
  ON storefront_content
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role full access storefront_content" ON storefront_content;
CREATE POLICY "Service role full access storefront_content"
  ON storefront_content
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
