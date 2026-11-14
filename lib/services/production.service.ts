import { createAdminClient } from "@/lib/supabase/admin";
import { ProductionBatchFormValues } from "@/lib/validations/production.schema";

export interface ProductionBatchRecord {
  id: string;
  batchNumber: string;
  formulationName: string;
  targetProduct: string;
  size: string;
  unitsProduced: number;
  status: "in_progress" | "completed" | "cancelled";
  createdAt: string;
}

export async function executeProductionBatch(
  payload: ProductionBatchFormValues
): Promise<{ success: boolean; batchId?: string; error?: string }> {
  try {
    const supabase = createAdminClient();

    // Call atomic stored procedure
    const { data: batchId, error } = await (supabase.rpc as any)(
      "record_production_batch",
      {
        p_batch_number: payload.batchNumber,
        p_formulation_id: payload.formulationId,
        p_target_variant_id: payload.targetVariantId,
        p_units_produced: payload.unitsProduced,
        p_bottle_material_id: payload.bottleMaterialId || null,
        p_cap_material_id: payload.capMaterialId || null,
        p_box_material_id: payload.boxMaterialId || null,
        p_notes: payload.notes || null,
      }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, batchId: batchId as string };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to execute production batch" };
  }
}

export async function getProductionBatches(): Promise<ProductionBatchRecord[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("production_batches" as any)
      .select(`
        id,
        batch_number,
        units_produced,
        batch_status,
        created_at,
        formulations (name),
        product_variants (size, products (name_fr))
      `)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      batchNumber: d.batch_number,
      formulationName: d.formulations?.name || "Formule atelier",
      targetProduct: d.product_variants?.products?.name_fr || "Parfum fini",
      size: d.product_variants?.size || "50ml",
      unitsProduced: d.units_produced,
      status: d.batch_status,
      createdAt: d.created_at,
    }));
  } catch {
    return [];
  }
}
