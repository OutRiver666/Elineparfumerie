-- ====================================================================
-- ELINE PARFUMERIE - STORED PROCEDURES & TRANSACTIONAL RPCs
-- ====================================================================

-- 1. ATOMIC PRODUCTION BATCH COMPILER
-- Deducts raw materials & packaging atomically, logs stock movements, and credits finished variant stock
CREATE OR REPLACE FUNCTION record_production_batch(
    p_batch_number TEXT,
    p_formulation_id UUID,
    p_target_variant_id UUID,
    p_units_produced INT,
    p_bottle_material_id UUID,
    p_cap_material_id UUID,
    p_box_material_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_batch_id UUID;
    v_form_item RECORD;
    v_current_stock NUMERIC;
    v_consumed_raw NUMERIC;
    v_variant RECORD;
    v_user_id UUID := auth.uid();
BEGIN
    -- Verify staff permissions
    IF NOT public.is_staff() THEN
        RAISE EXCEPTION 'Access denied: only authenticated workshop staff can record production batches.';
    END IF;

    -- Verify target variant exists
    SELECT * INTO v_variant FROM product_variants WHERE id = p_target_variant_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Target product variant % not found.', p_target_variant_id;
    END IF;

    -- Insert production batch header
    INSERT INTO production_batches (
        batch_number,
        formulation_id,
        target_variant_id,
        units_produced,
        batch_status,
        notes,
        created_by
    ) VALUES (
        p_batch_number,
        p_formulation_id,
        p_target_variant_id,
        p_units_produced,
        'completed',
        p_notes,
        v_user_id
    ) RETURNING id INTO v_batch_id;

    -- Deduct raw formulation materials (oils, alcohol, additives)
    FOR v_form_item IN 
        SELECT fi.raw_material_id, fi.quantity_ml, rm.stock_quantity, rm.name_fr
        FROM formulation_items fi
        JOIN raw_materials rm ON rm.id = fi.raw_material_id
        WHERE fi.formulation_id = p_formulation_id
    LOOP
        -- Calculate total volume required for this batch (quantity_ml * units)
        v_consumed_raw := v_form_item.quantity_ml * p_units_produced;

        IF v_form_item.stock_quantity < v_consumed_raw THEN
            RAISE EXCEPTION 'Insufficient stock for raw material "%": required % ml, but only % ml available.',
                v_form_item.name_fr, v_consumed_raw, v_form_item.stock_quantity;
        END IF;

        -- Deduct from raw_materials
        UPDATE raw_materials
        SET stock_quantity = stock_quantity - v_consumed_raw,
            updated_at = NOW()
        WHERE id = v_form_item.raw_material_id;

        -- Record batch item record
        INSERT INTO production_batch_items (
            batch_id,
            material_type,
            material_id,
            quantity_consumed,
            unit
        ) VALUES (
            v_batch_id,
            'raw_material',
            v_form_item.raw_material_id,
            v_consumed_raw,
            'ml'
        );

        -- Log movement
        INSERT INTO inventory_movements (
            item_type,
            item_id,
            movement_type,
            quantity,
            unit,
            reference_id,
            reference_type,
            notes,
            created_by
        ) VALUES (
            'raw_material',
            v_form_item.raw_material_id,
            'production_consumption',
            -v_consumed_raw,
            'ml',
            v_batch_id,
            'production_batch',
            'Consumed in batch ' || p_batch_number,
            v_user_id
        );
    END LOOP;

    -- Deduct packaging materials (Bottles)
    IF p_bottle_material_id IS NOT NULL THEN
        UPDATE packaging_materials
        SET stock_quantity = stock_quantity - p_units_produced,
            updated_at = NOW()
        WHERE id = p_bottle_material_id;

        INSERT INTO production_batch_items (batch_id, material_type, material_id, quantity_consumed, unit)
        VALUES (v_batch_id, 'packaging_material', p_bottle_material_id, p_units_produced, 'pcs');

        INSERT INTO inventory_movements (item_type, item_id, movement_type, quantity, unit, reference_id, reference_type, notes, created_by)
        VALUES ('packaging_material', p_bottle_material_id, 'production_consumption', -p_units_produced, 'pcs', v_batch_id, 'production_batch', 'Bottles consumed in batch ' || p_batch_number, v_user_id);
    END IF;

    -- Deduct packaging materials (Caps)
    IF p_cap_material_id IS NOT NULL THEN
        UPDATE packaging_materials
        SET stock_quantity = stock_quantity - p_units_produced,
            updated_at = NOW()
        WHERE id = p_cap_material_id;

        INSERT INTO production_batch_items (batch_id, material_type, material_id, quantity_consumed, unit)
        VALUES (v_batch_id, 'packaging_material', p_cap_material_id, p_units_produced, 'pcs');

        INSERT INTO inventory_movements (item_type, item_id, movement_type, quantity, unit, reference_id, reference_type, notes, created_by)
        VALUES ('packaging_material', p_cap_material_id, 'production_consumption', -p_units_produced, 'pcs', v_batch_id, 'production_batch', 'Caps consumed in batch ' || p_batch_number, v_user_id);
    END IF;

    -- Deduct packaging materials (Boxes)
    IF p_box_material_id IS NOT NULL THEN
        UPDATE packaging_materials
        SET stock_quantity = stock_quantity - p_units_produced,
            updated_at = NOW()
        WHERE id = p_box_material_id;

        INSERT INTO production_batch_items (batch_id, material_type, material_id, quantity_consumed, unit)
        VALUES (v_batch_id, 'packaging_material', p_box_material_id, p_units_produced, 'pcs');

        INSERT INTO inventory_movements (item_type, item_id, movement_type, quantity, unit, reference_id, reference_type, notes, created_by)
        VALUES ('packaging_material', p_box_material_id, 'production_consumption', -p_units_produced, 'pcs', v_batch_id, 'production_batch', 'Boxes consumed in batch ' || p_batch_number, v_user_id);
    END IF;

    -- Increment finished product variant stock
    UPDATE product_variants
    SET stock_quantity = stock_quantity + p_units_produced,
        updated_at = NOW()
    WHERE id = p_target_variant_id;

    -- Log finished product yield movement
    INSERT INTO inventory_movements (
        item_type,
        item_id,
        movement_type,
        quantity,
        unit,
        reference_id,
        reference_type,
        notes,
        created_by
    ) VALUES (
        'finished_variant',
        p_target_variant_id,
        'production_yield',
        p_units_produced,
        'pcs',
        v_batch_id,
        'production_batch',
        'Yield from batch ' || p_batch_number,
        v_user_id
    );

    RETURN v_batch_id;
END;
$$;

-- 2. SECURE ORDER STATUS ADVANCEMENT
CREATE OR REPLACE FUNCTION update_order_status(
    p_order_id UUID,
    p_new_status order_status,
    p_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_status order_status;
    v_user_id UUID := auth.uid();
BEGIN
    IF NOT public.is_staff() THEN
        RAISE EXCEPTION 'Access denied: only staff can modify order statuses.';
    END IF;

    SELECT status INTO v_old_status FROM orders WHERE id = p_order_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order % not found.', p_order_id;
    END IF;

    -- Update order status
    UPDATE orders
    SET status = p_new_status,
        updated_at = NOW()
    WHERE id = p_order_id;

    -- Record status timeline history
    INSERT INTO order_status_history (
        order_id,
        previous_status,
        new_status,
        change_reason,
        changed_by
    ) VALUES (
        p_order_id,
        v_old_status,
        p_new_status,
        p_reason,
        v_user_id
    );
END;
$$;
