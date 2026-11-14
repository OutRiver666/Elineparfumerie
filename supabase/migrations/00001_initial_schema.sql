-- ====================================================================
-- ELINE PARFUMERIE - LUXURY FRAGRANCE DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'employee');
CREATE TYPE gender_type AS ENUM ('men', 'women', 'unisex');
CREATE TYPE bottle_size AS ENUM ('25ml', '30ml', '50ml', '80ml', '100ml');
CREATE TYPE fragrance_classification AS ENUM ('standard', 'X4', 'X8');
CREATE TYPE bundle_type AS ENUM ('predefined', 'custom');
CREATE TYPE inventory_unit AS ENUM ('ml', 'pcs', 'g', 'kg');
CREATE TYPE movement_type AS ENUM (
    'purchase',
    'production_consumption',
    'production_yield',
    'order_fulfillment',
    'spoilage_adjustment',
    'audit_reconciliation'
);
CREATE TYPE order_status AS ENUM (
    'new',
    'confirmed',
    'preparing',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
    'failed_delivery'
);

-- 3. PROFILES & ROLES
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'employee',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. FRAGRANCE FAMILIES & COLLECTIONS
CREATE TABLE fragrance_families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_fr TEXT,
    description_ar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_fr TEXT,
    description_ar TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRODUCTS & VARIANTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_fr TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    gender gender_type NOT NULL DEFAULT 'unisex',
    seasons TEXT[] NOT NULL DEFAULT '{"spring", "summer", "autumn", "winter"}',
    fragrance_family_id UUID REFERENCES fragrance_families(id) ON DELETE SET NULL,
    classification fragrance_classification NOT NULL DEFAULT 'standard',
    top_notes_fr TEXT[] DEFAULT '{}',
    top_notes_ar TEXT[] DEFAULT '{}',
    heart_notes_fr TEXT[] DEFAULT '{}',
    heart_notes_ar TEXT[] DEFAULT '{}',
    base_notes_fr TEXT[] DEFAULT '{}',
    base_notes_ar TEXT[] DEFAULT '{}',
    images TEXT[] NOT NULL DEFAULT '{}',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_bestseller BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size bottle_size NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    price_dzd NUMERIC(10, 2) NOT NULL CHECK (price_dzd >= 0),
    compare_at_price_dzd NUMERIC(10, 2) CHECK (compare_at_price_dzd IS NULL OR compare_at_price_dzd >= price_dzd),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_product_size UNIQUE (product_id, size)
);

CREATE TABLE product_collections (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, collection_id)
);

-- 6. BUNDLES / PACKS
CREATE TABLE bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    type bundle_type NOT NULL DEFAULT 'predefined',
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_fr TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    fixed_price_dzd NUMERIC(10, 2) CHECK (fixed_price_dzd IS NULL OR fixed_price_dzd >= 0),
    discount_percentage NUMERIC(5, 2) CHECK (discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100)),
    required_bottles_count INT NOT NULL DEFAULT 3 CHECK (required_bottles_count >= 1),
    allowed_sizes bottle_size[] NOT NULL DEFAULT '{"30ml", "50ml"}',
    images TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bundle_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 1)
);

CREATE TABLE bundle_allowed_products (
    bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (bundle_id, product_id)
);

-- 7. INVENTORY (RAW MATERIALS, PACKAGING & AUDIT LOGS)
CREATE TABLE raw_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('oil', 'alcohol', 'additive')),
    stock_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    unit inventory_unit NOT NULL DEFAULT 'ml',
    cost_per_unit_dzd NUMERIC(10, 2) DEFAULT 0,
    min_threshold NUMERIC(12, 2) NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE packaging_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    material_type TEXT NOT NULL CHECK (material_type IN ('bottle', 'pump', 'cap', 'collar', 'box', 'label', 'bag')),
    bottle_size bottle_size,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    unit inventory_unit NOT NULL DEFAULT 'pcs',
    cost_per_unit_dzd NUMERIC(10, 2) DEFAULT 0,
    min_threshold INT NOT NULL DEFAULT 20,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type TEXT NOT NULL CHECK (item_type IN ('raw_material', 'packaging_material', 'finished_variant')),
    item_id UUID NOT NULL,
    movement_type movement_type NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    unit inventory_unit NOT NULL,
    reference_id UUID,
    reference_type TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. FORMULATIONS & PRODUCTION BATCHES
CREATE TABLE formulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_volume_ml NUMERIC(10, 2) NOT NULL DEFAULT 1000,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE formulation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formulation_id UUID NOT NULL REFERENCES formulations(id) ON DELETE CASCADE,
    raw_material_id UUID NOT NULL REFERENCES raw_materials(id) ON DELETE RESTRICT,
    quantity_ml NUMERIC(10, 2) NOT NULL CHECK (quantity_ml > 0),
    percentage NUMERIC(5, 2) NOT NULL CHECK (percentage > 0 AND percentage <= 100)
);

CREATE TABLE production_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number TEXT UNIQUE NOT NULL,
    formulation_id UUID NOT NULL REFERENCES formulations(id) ON DELETE RESTRICT,
    target_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    units_produced INT NOT NULL CHECK (units_produced > 0),
    batch_status TEXT NOT NULL DEFAULT 'completed' CHECK (batch_status IN ('in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE production_batch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES production_batches(id) ON DELETE CASCADE,
    material_type TEXT NOT NULL CHECK (material_type IN ('raw_material', 'packaging_material')),
    material_id UUID NOT NULL,
    quantity_consumed NUMERIC(12, 2) NOT NULL,
    unit inventory_unit NOT NULL
);

-- 9. WILAYA DELIVERY RATES (ALGERIAN 58 WILAYAS)
CREATE TABLE wilaya_delivery_rates (
    wilaya_code VARCHAR(2) PRIMARY KEY,
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    delivery_fee_dzd NUMERIC(10, 2) NOT NULL DEFAULT 600,
    estimated_days VARCHAR(20) NOT NULL DEFAULT '24h - 48h',
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 10. CUSTOMERS, ORDERS & SNAPSHOTS
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    alternate_phone TEXT,
    wilaya_code VARCHAR(2) REFERENCES wilaya_delivery_rates(wilaya_code),
    commune_name TEXT,
    delivery_address TEXT,
    total_orders INT NOT NULL DEFAULT 0,
    total_spent_dzd NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    wilaya_code VARCHAR(2) NOT NULL REFERENCES wilaya_delivery_rates(wilaya_code),
    commune_name TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_notes TEXT,
    status order_status NOT NULL DEFAULT 'new',
    subtotal_dzd NUMERIC(10, 2) NOT NULL CHECK (subtotal_dzd >= 0),
    delivery_fee_dzd NUMERIC(10, 2) NOT NULL CHECK (delivery_fee_dzd >= 0),
    discount_dzd NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_dzd >= 0),
    total_dzd NUMERIC(10, 2) NOT NULL CHECK (total_dzd >= 0),
    payment_method TEXT NOT NULL DEFAULT 'COD',
    is_paid BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('single_product', 'predefined_bundle', 'custom_bundle')),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    bundle_id UUID REFERENCES bundles(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    unit_price_snapshot NUMERIC(10, 2) NOT NULL,
    total_price_snapshot NUMERIC(10, 2) NOT NULL,
    product_name_snapshot TEXT NOT NULL,
    size_snapshot TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_item_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name_snapshot TEXT NOT NULL,
    size_snapshot TEXT NOT NULL
);

CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    previous_status order_status,
    new_status order_status NOT NULL,
    change_reason TEXT,
    changed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_published ON products(is_published);
CREATE INDEX idx_products_gender ON products(gender);
CREATE INDEX idx_products_family ON products(fragrance_family_id);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_bundles_slug ON bundles(slug);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_phone ON orders(customer_phone);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_inventory_movements_item ON inventory_movements(item_id, item_type);
