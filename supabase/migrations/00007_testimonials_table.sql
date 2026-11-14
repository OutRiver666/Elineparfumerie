-- ====================================================================
-- MIGRATION 00007: CUSTOMER TESTIMONIALS & REVIEWS TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS testimonials (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    city TEXT NOT NULL,
    quote TEXT NOT NULL,
    perfume TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    is_verified BOOLEAN NOT NULL DEFAULT true,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for sorting by latest
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials(is_published);

-- Enable Row Level Security
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public read published
CREATE POLICY "Public can view published testimonials"
    ON testimonials FOR SELECT
    USING (is_published = true);

-- Public can submit new review
CREATE POLICY "Public can submit testimonials"
    ON testimonials FOR INSERT
    WITH CHECK (true);

-- Staff can manage testimonials
CREATE POLICY "Staff can manage all testimonials"
    ON testimonials FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('owner', 'manager')
        )
    );
