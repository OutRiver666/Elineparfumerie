export type AdminPermissionKey =
  | "overview"              // Accès au tableau de bord général
  | "orders_view"           // Consultation de la liste des commandes et détails clients
  | "orders_manage"         // Confirmation, changement de statut, tentatives d'appel, annulation
  | "products_view"         // Consultation du catalogue de parfums et prix
  | "products_manage"       // Ajout, modification, suppression de parfums et tarifs
  | "packs_manage"          // Gestion des coffrets et règles de composition
  | "inventory_production"  // Atelier, matières premières, packaging et batches
  | "ui_controller"         // Studio Vitrine (Hero, Bannières, Avis clients)
  | "sales_analytics"       // Chiffre d'affaires, revenus livrés/encaissés, rapports financiers
  | "settings_team";        // Gestion des collaborateurs, des rôles et des paramètres de livraison

export type AdminPermissions = Record<AdminPermissionKey, boolean>;

export type AdminRole =
  | "owner"             // Super Administrateur (accès complet et illimité)
  | "order_manager"     // Responsable des Commandes & Confirmations d'appels
  | "catalog_manager"   // Gestionnaire Catalogue & Stocks
  | "vitrine_manager"   // Responsable Vitrine & Modération des Avis
  | "custom";           // Rôle Personnalisé avec permissions choisies sur-mesure

export interface AdminMember {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: AdminRole;
  permissions: AdminPermissions;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  avatar?: string;
  temporaryPassword?: string;
}

export interface CreateAdminMemberInput {
  email: string;
  fullName: string;
  phone?: string;
  password?: string;
  role: AdminRole;
  permissions?: Partial<AdminPermissions>;
}

export const ALL_PERMISSIONS_KEYS: AdminPermissionKey[] = [
  "overview",
  "orders_view",
  "orders_manage",
  "products_view",
  "products_manage",
  "packs_manage",
  "inventory_production",
  "ui_controller",
  "sales_analytics",
  "settings_team",
];

export const PERMISSION_DEFINITIONS: Record<
  AdminPermissionKey,
  {
    labelFr: string;
    labelAr: string;
    descFr: string;
    descAr: string;
    category: "orders" | "catalog" | "marketing" | "finances" | "system";
  }
> = {
  overview: {
    labelFr: "Tableau de Bord Général",
    labelAr: "لوحة المؤشرات العامة",
    descFr: "Visualiser la page d'accueil de l'administration et les indicateurs clés.",
    descAr: "عرض الصفحة الرئيسية للمشرف والمؤشرات التشغيلية.",
    category: "system",
  },
  orders_view: {
    labelFr: "Consulter les Commandes",
    labelAr: "مشاهدة الطلبيات والزبائن",
    descFr: "Voir la liste des commandes COD, coordonnées clients, adresses et wilayas.",
    descAr: "رؤية قائمة طلبيات الدفع عند الاستلام وبيانات الزبائن وعناوينهم.",
    category: "orders",
  },
  orders_manage: {
    labelFr: "Valider & Gérer les Commandes",
    labelAr: "تأكيد وإدارة الطلبيات والمكالمات",
    descFr: "Modifier les statuts (confirmé, expédié), gérer les tentatives d'appels (1, 2, 3) et annuler.",
    descAr: "تغيير حالة الطلب، تسجيل محاولات الاتصال وإلغاء أو شحن الطرود.",
    category: "orders",
  },
  products_view: {
    labelFr: "Consulter le Catalogue",
    labelAr: "معاينة دليل العطور والأسعار",
    descFr: "Accéder à la liste des parfums, notes olfactives et fiches techniques.",
    descAr: "الاطلاع على قائمة العطور والنوتات والبطاقات التقنية.",
    category: "catalog",
  },
  products_manage: {
    labelFr: "Ajouter & Modifier des Parfums",
    labelAr: "إضافة وتعديل وحذف العطور",
    descFr: "Créer de nouvelles fiches de parfums, modifier les prix, formats et classifications (X2-X8).",
    descAr: "إنشاء عطور جديدة، تعديل الأسعار، الأحجام وتصنيفات التركيز.",
    category: "catalog",
  },
  packs_manage: {
    labelFr: "Gestion des Packs & Coffrets",
    labelAr: "إدارة الباقات الجاهزة وقواعد الصناديق",
    descFr: "Gérer les offres groupées prédéfinies et les règles de remise sur-mesure.",
    descAr: "التحكم في العروض الترويجية وقواعد صناديق الهدايا المخصصة.",
    category: "catalog",
  },
  inventory_production: {
    labelFr: "Atelier & Stocks de Matières",
    labelAr: "المخزون ومواد التعبئة وورشة التركيب",
    descFr: "Consulter les stocks de flacons, huiles, alcool et enregistrer les lots de formulation.",
    descAr: "متابعة كميات الزيوت والكحول والزجاجات ودفعات الإنتاج في الورشة.",
    category: "catalog",
  },
  ui_controller: {
    labelFr: "Studio Vitrine & Avis Clients",
    labelAr: "تخصيص الواجهة ومراجعة الآراء",
    descFr: "Changer les bannières Hero, collections, saisons et modérer/supprimer les avis clients.",
    descAr: "تغيير صور البانر والمجموعات وحذف أو إدارة آراء الزبائن.",
    category: "marketing",
  },
  sales_analytics: {
    labelFr: "Chiffre d'Affaires & Finances",
    labelAr: "المداخيل والتقارير المالية والأرباح",
    descFr: "Visualiser les revenus totaux, fonds encaissés en cash et métriques de rentabilité.",
    descAr: "الاطلاع على المداخيل الإجمالية والأموال المحصلة والأرباح الحساسة.",
    category: "finances",
  },
  settings_team: {
    labelFr: "Administration de l'Équipe & Paramètres",
    labelAr: "إدارة الفريق وتعديل الصلاحيات والإعدادات",
    descFr: "Ajouter/bloquer des collaborateurs, modifier les rôles et configurer les frais de livraison.",
    descAr: "إضافة المشرفين، تعديل الصلاحيات وتغيير تسعيرات الشحن للمتجر.",
    category: "system",
  },
};

export const ROLE_PRESETS: Record<
  Exclude<AdminRole, "custom">,
  {
    nameFr: string;
    nameAr: string;
    descFr: string;
    descAr: string;
    badgeColor: string;
    permissions: AdminPermissions;
  }
> = {
  owner: {
    nameFr: "Super Administrateur (Directeur)",
    nameAr: "المدير العام (صلاحيات كاملة)",
    descFr: "Accès illimité à l'intégralité du système, gestion de l'équipe et finances.",
    descAr: "وصول غير مقيد لجميع أقسام المتجر والأمور المالية وإدارة المشرفين.",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    permissions: {
      overview: true,
      orders_view: true,
      orders_manage: true,
      products_view: true,
      products_manage: true,
      packs_manage: true,
      inventory_production: true,
      ui_controller: true,
      sales_analytics: true,
      settings_team: true,
    },
  },
  order_manager: {
    nameFr: "Confirmateur de Commandes (Call Center)",
    nameAr: "مسير الطلبيات وتأكيد الاتصال",
    descFr: "Gère les appels clients et la validation des commandes. Finances et modifications de prix masquées.",
    descAr: "مختص في الاتصال بالزبائن وتأكيد الشحن. المداخيل وتعديل الأسعار مخفية تماماً.",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    permissions: {
      overview: true,
      orders_view: true,
      orders_manage: true,
      products_view: true,
      products_manage: false,
      packs_manage: false,
      inventory_production: false,
      ui_controller: false,
      sales_analytics: false,
      settings_team: false,
    },
  },
  catalog_manager: {
    nameFr: "Gestionnaire Catalogue & Stocks",
    nameAr: "مسير المنتجات والمخزون",
    descFr: "Crée et modifie les parfums, packs et stocks. Accès aux commandes et finances bloqué.",
    descAr: "إضافة وتعديل العطور والباقات والمخزون. الطلبيات والأمور المالية محجوبة.",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    permissions: {
      overview: true,
      orders_view: false,
      orders_manage: false,
      products_view: true,
      products_manage: true,
      packs_manage: true,
      inventory_production: true,
      ui_controller: false,
      sales_analytics: false,
      settings_team: false,
    },
  },
  vitrine_manager: {
    nameFr: "Responsable Vitrine & Avis Clients",
    nameAr: "مسؤول الواجهة ومراجعة الآراء",
    descFr: "Gère les bannières, visuels de collections et modère les avis publiés par les clients.",
    descAr: "التحكم في صور البانر ومجموعات المتجر ومراجعة وحذف تعليقات وآراء الزبائن.",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    permissions: {
      overview: true,
      orders_view: false,
      orders_manage: false,
      products_view: true,
      products_manage: false,
      packs_manage: false,
      inventory_production: false,
      ui_controller: true,
      sales_analytics: false,
      settings_team: false,
    },
  },
};

/**
 * Checks whether an admin member has a specific permission.
 * Super Admins ('owner') always have full permissions.
 */
export function hasAdminPermission(
  permissions: AdminPermissions | undefined,
  role: string | undefined,
  key: AdminPermissionKey
): boolean {
  if (role === "owner") return true;
  if (!permissions) return false;
  return Boolean(permissions[key]);
}
