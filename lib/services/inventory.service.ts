import { createAdminClient } from "@/lib/supabase/admin";

export interface RawMaterialItem {
  id: string;
  sku: string;
  nameFr: string;
  nameAr: string;
  category: "oil" | "alcohol" | "additive";
  stockQuantity: number;
  unit: "ml" | "pcs" | "g" | "kg";
  costPerUnitDZD: number;
  minThreshold: number;
  isLowStock: boolean;
}

export interface PackagingItem {
  id: string;
  sku: string;
  nameFr: string;
  nameAr: string;
  materialType: "bottle" | "pump" | "cap" | "collar" | "box" | "label" | "bag";
  bottleSize?: "25ml" | "30ml" | "50ml" | "80ml" | "100ml";
  stockQuantity: number;
  unit: "pcs";
  costPerUnitDZD: number;
  minThreshold: number;
  isLowStock: boolean;
}

export async function getRawMaterials(): Promise<RawMaterialItem[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("raw_materials")
      .select("*")
      .order("category");

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      sku: d.sku,
      nameFr: d.name_fr,
      nameAr: d.name_ar,
      category: d.category as any,
      stockQuantity: Number(d.stock_quantity),
      unit: d.unit as any,
      costPerUnitDZD: Number(d.cost_per_unit_dzd || 0),
      minThreshold: Number(d.min_threshold),
      isLowStock: Number(d.stock_quantity) <= Number(d.min_threshold),
    }));
  } catch {
    return [];
  }
}

export async function getPackagingMaterials(): Promise<PackagingItem[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("packaging_materials")
      .select("*")
      .order("material_type");

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      sku: d.sku,
      nameFr: d.name_fr,
      nameAr: d.name_ar,
      materialType: d.material_type as any,
      bottleSize: d.bottle_size as any,
      stockQuantity: Number(d.stock_quantity),
      unit: "pcs",
      costPerUnitDZD: Number(d.cost_per_unit_dzd || 0),
      minThreshold: Number(d.min_threshold),
      isLowStock: Number(d.stock_quantity) <= Number(d.min_threshold),
    }));
  } catch {
    return [];
  }
}
