export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "owner" | "manager" | "employee";
export type GenderType = "men" | "women" | "unisex";
export type BottleSize = "25ml" | "30ml" | "50ml" | "80ml" | "100ml";
export type FragranceClassification = "standard" | "X2" | "X3" | "X4" | "X5" | "X6" | "X7" | "X8";
export type BundleType = "predefined" | "custom";
export type InventoryUnit = "ml" | "pcs" | "g" | "kg";
export type MovementType =
  | "purchase"
  | "production_consumption"
  | "production_yield"
  | "order_fulfillment"
  | "spoilage_adjustment"
  | "audit_reconciliation";
export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned"
  | "failed_delivery";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          role: UserRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          role?: UserRole;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      fragrance_families: {
        Row: {
          id: string;
          slug: string;
          name_fr: string;
          name_ar: string;
          description_fr: string | null;
          description_ar: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_fr: string;
          name_ar: string;
          description_fr?: string | null;
          description_ar?: string | null;
          created_at?: string;
        };
        Update: {
          slug?: string;
          name_fr?: string;
          name_ar?: string;
          description_fr?: string | null;
          description_ar?: string | null;
        };
      };
      collections: {
        Row: {
          id: string;
          slug: string;
          name_fr: string;
          name_ar: string;
          description_fr: string | null;
          description_ar: string | null;
          image_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_fr: string;
          name_ar: string;
          description_fr?: string | null;
          description_ar?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          slug?: string;
          name_fr?: string;
          name_ar?: string;
          description_fr?: string | null;
          description_ar?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name_fr: string;
          name_ar: string;
          description_fr: string;
          description_ar: string;
          gender: GenderType;
          seasons: string[];
          fragrance_family_id: string | null;
          classification: FragranceClassification;
          top_notes_fr: string[];
          top_notes_ar: string[];
          heart_notes_fr: string[];
          heart_notes_ar: string[];
          base_notes_fr: string[];
          base_notes_ar: string[];
          images: string[];
          is_featured: boolean;
          is_bestseller: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_fr: string;
          name_ar: string;
          description_fr: string;
          description_ar: string;
          gender?: GenderType;
          seasons?: string[];
          fragrance_family_id?: string | null;
          classification?: FragranceClassification;
          top_notes_fr?: string[];
          top_notes_ar?: string[];
          heart_notes_fr?: string[];
          heart_notes_ar?: string[];
          base_notes_fr?: string[];
          base_notes_ar?: string[];
          images?: string[];
          is_featured?: boolean;
          is_bestseller?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          name_fr?: string;
          name_ar?: string;
          description_fr?: string;
          description_ar?: string;
          gender?: GenderType;
          seasons?: string[];
          fragrance_family_id?: string | null;
          classification?: FragranceClassification;
          top_notes_fr?: string[];
          top_notes_ar?: string[];
          heart_notes_fr?: string[];
          heart_notes_ar?: string[];
          base_notes_fr?: string[];
          base_notes_ar?: string[];
          images?: string[];
          is_featured?: boolean;
          is_bestseller?: boolean;
          is_published?: boolean;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: BottleSize;
          sku: string;
          price_dzd: number;
          compare_at_price_dzd: number | null;
          stock_quantity: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          size: BottleSize;
          sku: string;
          price_dzd: number;
          compare_at_price_dzd?: number | null;
          stock_quantity?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          size?: BottleSize;
          sku?: string;
          price_dzd?: number;
          compare_at_price_dzd?: number | null;
          stock_quantity?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      bundles: {
        Row: {
          id: string;
          slug: string;
          type: BundleType;
          name_fr: string;
          name_ar: string;
          description_fr: string;
          description_ar: string;
          fixed_price_dzd: number | null;
          discount_percentage: number | null;
          required_bottles_count: number;
          allowed_sizes: BottleSize[];
          images: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          type?: BundleType;
          name_fr: string;
          name_ar: string;
          description_fr: string;
          description_ar: string;
          fixed_price_dzd?: number | null;
          discount_percentage?: number | null;
          required_bottles_count?: number;
          allowed_sizes?: BottleSize[];
          images?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          type?: BundleType;
          name_fr?: string;
          name_ar?: string;
          description_fr?: string;
          description_ar?: string;
          fixed_price_dzd?: number | null;
          discount_percentage?: number | null;
          required_bottles_count?: number;
          allowed_sizes?: BottleSize[];
          images?: string[];
          is_active?: boolean;
          updated_at?: string;
        };
      };
      raw_materials: {
        Row: {
          id: string;
          sku: string;
          name_fr: string;
          name_ar: string;
          category: string;
          stock_quantity: number;
          unit: InventoryUnit;
          cost_per_unit_dzd: number | null;
          min_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sku: string;
          name_fr: string;
          name_ar: string;
          category: string;
          stock_quantity?: number;
          unit?: InventoryUnit;
          cost_per_unit_dzd?: number | null;
          min_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          sku?: string;
          name_fr?: string;
          name_ar?: string;
          category?: string;
          stock_quantity?: number;
          unit?: InventoryUnit;
          cost_per_unit_dzd?: number | null;
          min_threshold?: number;
          updated_at?: string;
        };
      };
      packaging_materials: {
        Row: {
          id: string;
          sku: string;
          name_fr: string;
          name_ar: string;
          material_type: string;
          bottle_size: BottleSize | null;
          stock_quantity: number;
          unit: InventoryUnit;
          cost_per_unit_dzd: number | null;
          min_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sku: string;
          name_fr: string;
          name_ar: string;
          material_type: string;
          bottle_size?: BottleSize | null;
          stock_quantity?: number;
          unit?: InventoryUnit;
          cost_per_unit_dzd?: number | null;
          min_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          sku?: string;
          name_fr?: string;
          name_ar?: string;
          material_type?: string;
          bottle_size?: BottleSize | null;
          stock_quantity?: number;
          unit?: InventoryUnit;
          cost_per_unit_dzd?: number | null;
          min_threshold?: number;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string;
          wilaya_code: string;
          commune_name: string;
          delivery_address: string;
          delivery_notes: string | null;
          status: OrderStatus;
          subtotal_dzd: number;
          delivery_fee_dzd: number;
          discount_dzd: number;
          total_dzd: number;
          payment_method: string;
          is_paid: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id?: string | null;
          customer_name: string;
          customer_phone: string;
          wilaya_code: string;
          commune_name: string;
          delivery_address: string;
          delivery_notes?: string | null;
          status?: OrderStatus;
          subtotal_dzd: number;
          delivery_fee_dzd: number;
          discount_dzd?: number;
          total_dzd: number;
          payment_method?: string;
          is_paid?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: OrderStatus;
          is_paid?: boolean;
          updated_at?: string;
        };
      };
      wilaya_delivery_rates: {
        Row: {
          wilaya_code: string;
          name_fr: string;
          name_ar: string;
          delivery_fee_dzd: number;
          estimated_days: string;
          is_active: boolean;
        };
        Insert: {
          wilaya_code: string;
          name_fr: string;
          name_ar: string;
          delivery_fee_dzd?: number;
          estimated_days?: string;
          is_active?: boolean;
        };
        Update: {
          name_fr?: string;
          name_ar?: string;
          delivery_fee_dzd?: number;
          estimated_days?: string;
          is_active?: boolean;
        };
      };
    };
    Functions: {
      record_production_batch: {
        Args: {
          p_batch_number: string;
          p_formulation_id: string;
          p_target_variant_id: string;
          p_units_produced: number;
          p_bottle_material_id?: string | null;
          p_cap_material_id?: string | null;
          p_box_material_id?: string | null;
          p_notes?: string | null;
        };
        Returns: string;
      };
      update_order_status: {
        Args: {
          p_order_id: string;
          p_new_status: OrderStatus;
          p_reason?: string | null;
        };
        Returns: void;
      };
    };
  };
}
