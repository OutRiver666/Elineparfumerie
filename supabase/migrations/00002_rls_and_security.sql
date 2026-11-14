-- ====================================================================
-- ELINE PARFUMERIE - ROW LEVEL SECURITY (RLS) POLICIES & PERMISSIONS
-- ====================================================================

-- 1. ENABLE RLS ON ALL TABLES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fragrance_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_allowed_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE packaging_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wilaya_delivery_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- 2. HELPER FUNCTIONS FOR ROLE VERIFICATION (IN PUBLIC SCHEMA)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND is_active = true 
        AND role IN ('owner', 'manager', 'employee')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_manager_or_owner()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND is_active = true 
        AND role IN ('owner', 'manager')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND is_active = true 
        AND role = 'owner'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id OR public.is_manager_or_owner());

DROP POLICY IF EXISTS "Owners can manage all profiles" ON profiles;
CREATE POLICY "Owners can manage all profiles"
    ON profiles FOR ALL
    USING (public.is_owner());

-- 4. PUBLIC CATALOG POLICIES (READ-ONLY FOR STOREFRONT)
DROP POLICY IF EXISTS "Public can view active fragrance families" ON fragrance_families;
CREATE POLICY "Public can view active fragrance families"
    ON fragrance_families FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Staff can manage fragrance families" ON fragrance_families;
CREATE POLICY "Staff can manage fragrance families"
    ON fragrance_families FOR ALL
    USING (public.is_manager_or_owner());

DROP POLICY IF EXISTS "Public can view active collections" ON collections;
CREATE POLICY "Public can view active collections"
    ON collections FOR SELECT
    USING (is_active = true OR public.is_staff());

DROP POLICY IF EXISTS "Staff can manage collections" ON collections;
CREATE POLICY "Staff can manage collections"
    ON collections FOR ALL
    USING (public.is_manager_or_owner());

DROP POLICY IF EXISTS "Public can view published products" ON products;
CREATE POLICY "Public can view published products"
    ON products FOR SELECT
    USING (is_published = true OR public.is_staff());

DROP POLICY IF EXISTS "Staff can manage products" ON products;
CREATE POLICY "Staff can manage products"
    ON products FOR ALL
    USING (public.is_manager_or_owner());

DROP POLICY IF EXISTS "Public can view active variants of published products" ON product_variants;
CREATE POLICY "Public can view active variants of published products"
    ON product_variants FOR SELECT
    USING (
        is_active = true 
        AND EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_variants.product_id 
            AND products.is_published = true
        )
        OR public.is_staff()
    );

DROP POLICY IF EXISTS "Staff can manage product variants" ON product_variants;
CREATE POLICY "Staff can manage product variants"
    ON product_variants FOR ALL
    USING (public.is_manager_or_owner());

DROP POLICY IF EXISTS "Public can view product collections" ON product_collections;
CREATE POLICY "Public can view product collections"
    ON product_collections FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Staff can manage product collections" ON product_collections;
CREATE POLICY "Staff can manage product collections"
    ON product_collections FOR ALL
    USING (public.is_manager_or_owner());

DROP POLICY IF EXISTS "Public can view active bundles" ON bundles;
CREATE POLICY "Public can view active bundles"
    ON bundles FOR SELECT
    USING (is_active = true OR public.is_staff());

DROP POLICY IF EXISTS "Staff can manage bundles" ON bundles;
CREATE POLICY "Staff can manage bundles"
    ON bundles FOR ALL
    USING (public.is_manager_or_owner());

DROP POLICY IF EXISTS "Public can view bundle items" ON bundle_items;
CREATE POLICY "Public can view bundle items"
    ON bundle_items FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Staff can manage bundle items" ON bundle_items;
CREATE POLICY "Staff can manage bundle items"
    ON bundle_items FOR ALL
    USING (public.is_manager_or_owner());

DROP POLICY IF EXISTS "Public can view bundle allowed products" ON bundle_allowed_products;
CREATE POLICY "Public can view bundle allowed products"
    ON bundle_allowed_products FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Staff can manage bundle allowed products" ON bundle_allowed_products;
CREATE POLICY "Staff can manage bundle allowed products"
    ON bundle_allowed_products FOR ALL
    USING (public.is_manager_or_owner());

DROP POLICY IF EXISTS "Public can view active wilaya rates" ON wilaya_delivery_rates;
CREATE POLICY "Public can view active wilaya rates"
    ON wilaya_delivery_rates FOR SELECT
    USING (is_active = true OR public.is_staff());

DROP POLICY IF EXISTS "Staff can manage wilaya rates" ON wilaya_delivery_rates;
CREATE POLICY "Staff can manage wilaya rates"
    ON wilaya_delivery_rates FOR ALL
    USING (public.is_manager_or_owner());

-- 5. INVENTORY & PRODUCTION POLICIES (RESTRICTED TO STAFF)
DROP POLICY IF EXISTS "Staff can view raw materials" ON raw_materials;
CREATE POLICY "Staff can view raw materials"
    ON raw_materials FOR SELECT
    USING (public.is_staff());

DROP POLICY IF EXISTS "Managers and owners can manage raw materials" ON raw_materials;
CREATE POLICY "Managers and owners can manage raw materials"
    ON raw_materials FOR ALL
    USING (public.is_manager_or_owner());

DROP POLICY IF EXISTS "Staff can view packaging materials" ON packaging_materials;
CREATE POLICY "Staff can view packaging materials"
    ON packaging_materials FOR SELECT
    USING (public.is_staff());

DROP POLICY IF EXISTS "Managers and owners can manage packaging materials" ON packaging_materials;
CREATE POLICY "Managers and owners can manage packaging materials"
    ON packaging_materials FOR ALL
    USING (public.is_manager_or_owner());

DROP POLICY IF EXISTS "Staff can view inventory movements" ON inventory_movements;
CREATE POLICY "Staff can view inventory movements"
    ON inventory_movements FOR SELECT
    USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can insert inventory movements" ON inventory_movements;
CREATE POLICY "Staff can insert inventory movements"
    ON inventory_movements FOR INSERT
    WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Staff can view formulations" ON formulations;
CREATE POLICY "Staff can view formulations"
    ON formulations FOR SELECT
    USING (public.is_staff());

DROP POLICY IF EXISTS "Managers and owners can manage formulations" ON formulations;
CREATE POLICY "Managers and owners can manage formulations"
    ON formulations FOR ALL
    USING (public.is_manager_or_owner());

DROP POLICY IF EXISTS "Staff can view formulation items" ON formulation_items;
CREATE POLICY "Staff can view formulation items"
    ON formulation_items FOR SELECT
    USING (public.is_staff());

DROP POLICY IF EXISTS "Managers and owners can manage formulation items" ON formulation_items;
CREATE POLICY "Managers and owners can manage formulation items"
    ON formulation_items FOR ALL
    USING (public.is_manager_or_owner());

DROP POLICY IF EXISTS "Staff can view and record production batches" ON production_batches;
CREATE POLICY "Staff can view and record production batches"
    ON production_batches FOR ALL
    USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can view and record production batch items" ON production_batch_items;
CREATE POLICY "Staff can view and record production batch items"
    ON production_batch_items FOR ALL
    USING (public.is_staff());

-- 6. ORDERS & CUSTOMERS POLICIES (PUBLIC CAN INSERT COD ORDERS, STAFF CAN MANAGE)
DROP POLICY IF EXISTS "Public can insert customers" ON customers;
CREATE POLICY "Public can insert customers"
    ON customers FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can view all customers" ON customers;
CREATE POLICY "Staff can view all customers"
    ON customers FOR SELECT
    USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can manage customers" ON customers;
CREATE POLICY "Staff can manage customers"
    ON customers FOR ALL
    USING (public.is_staff());

DROP POLICY IF EXISTS "Public can insert orders" ON orders;
CREATE POLICY "Public can insert orders"
    ON orders FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can view all orders" ON orders;
CREATE POLICY "Staff can view all orders"
    ON orders FOR SELECT
    USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can update order status and details" ON orders;
CREATE POLICY "Staff can update order status and details"
    ON orders FOR UPDATE
    USING (public.is_staff());

DROP POLICY IF EXISTS "Public can insert order items" ON order_items;
CREATE POLICY "Public can insert order items"
    ON order_items FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can view order items" ON order_items;
CREATE POLICY "Staff can view order items"
    ON order_items FOR SELECT
    USING (public.is_staff());

DROP POLICY IF EXISTS "Public can insert order selections" ON order_item_selections;
CREATE POLICY "Public can insert order selections"
    ON order_item_selections FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can view order selections" ON order_item_selections;
CREATE POLICY "Staff can view order selections"
    ON order_item_selections FOR SELECT
    USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can view and insert order status history" ON order_status_history;
CREATE POLICY "Staff can view and insert order status history"
    ON order_status_history FOR ALL
    USING (public.is_staff());
