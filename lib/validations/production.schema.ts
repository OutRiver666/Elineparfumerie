import { z } from "zod";

export const formulationItemSchema = z.object({
  rawMaterialId: z.string().uuid("Sélectionnez une matière première valide"),
  quantityMl: z.number().positive("Le volume doit être supérieur à 0 ml"),
  percentage: z.number().min(0.1).max(100),
});

export const formulationSchema = z.object({
  productId: z.string().uuid("Sélectionnez le parfum cible"),
  name: z.string().min(2, "Le nom de la formulation est requis"),
  targetVolumeMl: z.number().positive().default(1000),
  notes: z.string().optional(),
  items: z.array(formulationItemSchema).min(1, "Au moins un ingrédient est requis"),
});

export const productionBatchSchema = z.object({
  batchNumber: z.string().min(3, "Le numéro de lot est requis (ex: LOT-2026-001)"),
  formulationId: z.string().uuid("Formulation requise"),
  targetVariantId: z.string().uuid("Format de flacon cible requis"),
  unitsProduced: z.number().int().min(1, "Le nombre d'unités produites doit être d'au moins 1"),
  bottleMaterialId: z.string().uuid().optional().nullable(),
  capMaterialId: z.string().uuid().optional().nullable(),
  boxMaterialId: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
});

export type FormulationFormValues = z.infer<typeof formulationSchema>;
export type ProductionBatchFormValues = z.infer<typeof productionBatchSchema>;
