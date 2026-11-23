"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Locale } from "@/lib/i18n";
import {
  AdminMember,
  AdminPermissions,
  AdminRole,
  ALL_PERMISSIONS_KEYS,
  PERMISSION_DEFINITIONS,
  ROLE_PRESETS,
} from "@/types/admin-role";
import {
  createAdminAction,
  updateAdminAction,
  toggleAdminStatusAction,
  deleteAdminAction,
  setSimulatedRoleAction,
  resetAdminPasswordAction,
} from "@/lib/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  ShieldCheck,
  UserPlus,
  PhoneCall,
  Package,
  SlidersHorizontal,
  DollarSign,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Edit2,
  Lock,
  Mail,
  Phone,
  Key,
  X,
  Loader2,
  Sparkles,
  HelpCircle,
  Layers,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamManagerClientProps {
  initialMembers: AdminMember[];
  locale?: Locale;
  currentAdminEmail?: string;
  isSimulating?: boolean;
  simulatedRole?: string | null;
}

export function TeamManagerClient({
  initialMembers,
  locale = "fr",
  currentAdminEmail = "",
  isSimulating = false,
  simulatedRole = null,
}: TeamManagerClientProps) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [members, setMembers] = useState<AdminMember[]>(initialMembers);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sync state whenever server provides updated initialMembers (e.g. after refresh or removal)
  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    startTransition(() => {
      router.refresh();
      setTimeout(() => setIsRefreshing(false), 600);
    });
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AdminMember | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<AdminRole>("order_manager");
  const [permissionsState, setPermissionsState] = useState<AdminPermissions>({
    ...ROLE_PRESETS.order_manager.permissions,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Handle opening modal for creation
  const handleOpenCreateModal = () => {
    setEditingMember(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("Eline2026!");
    setSelectedRole("order_manager");
    setPermissionsState({ ...ROLE_PRESETS.order_manager.permissions });
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  // Handle opening modal for edit
  const handleOpenEditModal = (member: AdminMember) => {
    setEditingMember(member);
    setFullName(member.fullName);
    setEmail(member.email);
    setPhone(member.phone || "");
    setPassword("");
    setSelectedRole(member.role);
    setPermissionsState({ ...member.permissions });
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  // When a preset role button is clicked in the modal
  const handleSelectRolePreset = (role: AdminRole) => {
    setSelectedRole(role);
    if (role in ROLE_PRESETS) {
      setPermissionsState({
        ...ROLE_PRESETS[role as Exclude<AdminRole, "custom">].permissions,
      });
    }
  };

  // Toggle single permission checkbox
  const handleTogglePermission = (key: keyof AdminPermissions) => {
    setPermissionsState((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      setSelectedRole("custom");
      return next;
    });
  };

  // Handle form submit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const formData = new FormData();
    formData.append("locale", locale);
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);
    formData.append("role", selectedRole);

    for (const key of ALL_PERMISSIONS_KEYS) {
      if (permissionsState[key]) {
        formData.append(`perm_${key}`, "on");
      }
    }

    startTransition(async () => {
      if (editingMember) {
        formData.append("id", editingMember.id);
        const res = await updateAdminAction(null, formData);
        if (res.success) {
          setMembers((prev) =>
            prev.map((m) =>
              m.id === editingMember.id
                ? {
                    ...m,
                    fullName,
                    phone: phone || undefined,
                    role: selectedRole,
                    permissions: permissionsState,
                  }
                : m
            )
          );
          setFormSuccess(res.message || "Permissions mises à jour avec succès");
          setTimeout(() => setIsModalOpen(false), 900);
        } else {
          setFormError(res.error || "Erreur de mise à jour");
        }
      } else {
        const res = await createAdminAction(null, formData);
        if (res.success && res.member) {
          setMembers((prev) => [res.member as AdminMember, ...prev]);
          setFormSuccess(res.message || "Administrateur ajouté avec succès !");
          setTimeout(() => setIsModalOpen(false), 900);
        } else {
          setFormError(res.error || "Erreur lors de la création");
        }
      }
    });
  };

  // Toggle status (Active / Inactive)
  const handleToggleStatus = (member: AdminMember) => {
    startTransition(async () => {
      const res = await toggleAdminStatusAction(member.id, locale);
      if (res.success) {
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, isActive: res.isActive ?? !m.isActive } : m))
        );
      } else {
        alert(res.error || "Erreur");
      }
    });
  };

  // Delete admin member
  const handleDeleteMember = (member: AdminMember) => {
    const confirmMsg = isAr
      ? `هل أنت متأكد من حذف المسؤول "${member.fullName}"؟ لن يتمكن من تسجيل الدخول بعد الآن.`
      : `Êtes-vous sûr de vouloir supprimer l'administrateur "${member.fullName}" ? Ses accès seront révoqués immédiatement.`;

    if (!confirm(confirmMsg)) return;

    startTransition(async () => {
      const res = await deleteAdminAction(member.id, locale);
      if (res.success) {
        setMembers((prev) => prev.filter((m) => m.id !== member.id));
      } else {
        alert(res.error || "Erreur lors de la suppression");
      }
    });
  };

  // Trigger Role Simulation
  const handleSimulateRole = (targetRole: string) => {
    startTransition(async () => {
      await setSimulatedRoleAction(targetRole, locale);
      window.location.reload();
    });
  };

  // Filter members
  const filteredMembers = members.filter((m) => {
    if (selectedRoleFilter !== "all" && m.role !== selectedRoleFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.fullName.toLowerCase().includes(q);
      const matchEmail = m.email.toLowerCase().includes(q);
      const matchPhone = m.phone ? m.phone.includes(q) : false;
      return matchName || matchEmail || matchPhone;
    }
    return true;
  });

  // Calculate statistics
  const totalCount = members.length;
  const orderManagersCount = members.filter((m) => m.role === "order_manager").length;
  const catalogManagersCount = members.filter((m) => m.role === "catalog_manager").length;
  const superAdminCount = members.filter((m) => m.role === "owner").length;

  return (
    <div className="space-y-6 select-none">
      {/* Simulation Banner Notice if active */}
      {isSimulating && (
        <div className="p-4 rounded-[6px] bg-amber-500/10 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {isAr
                ? "وضع المعاينة التجريبي مفعّل : أنت تتصفح لوحة التحكم حالياً بنفس الصلاحيات المحددة لهذا الدور."
                : "Mode simulation actif : Vous testez actuellement le tableau de bord avec les permissions de ce rôle."}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSimulateRole("real_owner")}
            className="h-8 border-amber-600 text-amber-800 hover:bg-amber-600 hover:text-white text-xs gap-1.5"
          >
            <span>{isAr ? "إنهاء المعاينة والعودة لـ Super Admin" : "Quitter la simulation"}</span>
          </Button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[4px] border border-luxury-border/30 shadow-xs">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-luxury-text-muted text-xs mb-1">
            <Users className="w-3.5 h-3.5 text-luxury-accent" />
            <span>{isAr ? "إجمالي الفريق" : "Collaborateurs"}</span>
          </div>
          <span className="text-xl font-semibold text-luxury-text">{totalCount}</span>
        </div>

        <div className="bg-white p-4 rounded-[4px] border border-luxury-border/30 shadow-xs">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-luxury-text-muted text-xs mb-1">
            <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
            <span>{isAr ? "مؤكدو الطلبيات (Call Center)" : "Confirmateurs"}</span>
          </div>
          <span className="text-xl font-semibold text-luxury-text">{orderManagersCount}</span>
        </div>

        <div className="bg-white p-4 rounded-[4px] border border-luxury-border/30 shadow-xs">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-luxury-text-muted text-xs mb-1">
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAr ? "مسيرو المنتجات والمخزن" : "Gestionnaires Stock"}</span>
          </div>
          <span className="text-xl font-semibold text-luxury-text">{catalogManagersCount}</span>
        </div>

        <div className="bg-white p-4 rounded-[4px] border border-luxury-border/30 shadow-xs">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-luxury-text-muted text-xs mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>{isAr ? "مديرو النظام (Super Admin)" : "Super Admins"}</span>
          </div>
          <span className="text-xl font-semibold text-luxury-text">{superAdminCount}</span>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="bg-white p-4 rounded-[4px] border border-luxury-border/30 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-luxury-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "بحث بالاسم أو البريد أو الهاتف..." : "Rechercher par nom, email ou téléphone..."}
            className="ps-9 h-9 text-xs bg-luxury-secondary/20 border-luxury-border/50"
          />
        </div>

        {/* Role Filters & Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-luxury-secondary/40 p-1 rounded-[4px] text-xs overflow-x-auto max-w-full">
            {[
              { id: "all", labelFr: "Tous", labelAr: "الكل" },
              { id: "owner", labelFr: "Direction", labelAr: "الإدارة" },
              { id: "order_manager", labelFr: "Commandes", labelAr: "الطلبيات" },
              { id: "catalog_manager", labelFr: "Catalogue", labelAr: "الكتالوج" },
              { id: "vitrine_manager", labelFr: "Vitrine", labelAr: "الواجهة" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRoleFilter(tab.id)}
                className={cn(
                  "px-2.5 py-1 rounded-[3px] font-medium transition-colors",
                  selectedRoleFilter === tab.id
                    ? "bg-white text-luxury-text shadow-2xs font-semibold"
                    : "text-luxury-text-secondary hover:text-luxury-text"
                )}
              >
                {isAr ? tab.labelAr : tab.labelFr}
              </button>
            ))}
          </div>

          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="gap-1.5 border-luxury-border/60 hover:bg-luxury-secondary/40 text-luxury-text text-xs h-9"
            title={isAr ? "مزامنة مع قاعدة البيانات" : "Actualiser et synchroniser avec Supabase"}
          >
            <RotateCw className={cn("w-3.5 h-3.5 text-luxury-accent", isRefreshing && "animate-spin")} />
            <span className="hidden sm:inline">{isAr ? "تحديث" : "Actualiser"}</span>
          </Button>

          <Button
            onClick={handleOpenCreateModal}
            size="sm"
            className="gap-1.5 bg-luxury-text hover:bg-black text-white text-xs h-9"
          >
            <UserPlus className="w-3.5 h-3.5 text-luxury-accent" />
            <span>{isAr ? "إضافة مسؤول جديد" : "Ajouter un Collaborateur"}</span>
          </Button>
        </div>
      </div>

      {/* Team Members List (Mobile Cards + Desktop Table) */}
      <div className="bg-white rounded-[4px] border border-luxury-border/30 overflow-hidden shadow-xs">
        {/* Mobile Team Member Cards (< md) */}
        <div className="md:hidden divide-y divide-luxury-border/20">
          {filteredMembers.length === 0 ? (
            <div className="py-10 px-4 text-center text-luxury-text-muted text-sm font-medium">
              {isAr ? "لا يوجد مسؤولون يطابقون هذا البحث." : "Aucun collaborateur trouvé pour cette sélection."}
            </div>
          ) : (
            filteredMembers.map((member) => {
              const isOwner = member.role === "owner";
              const isSelf = member.email === currentAdminEmail;
              const initials = member.fullName
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <div
                  key={member.id}
                  className={cn(
                    "p-4 space-y-3 transition-colors",
                    !member.isActive && "opacity-65 bg-gray-50/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs",
                          isOwner
                            ? "bg-amber-600 text-white"
                            : member.role === "order_manager"
                            ? "bg-blue-600 text-white"
                            : member.role === "catalog_manager"
                            ? "bg-emerald-600 text-white"
                            : "bg-luxury-text text-white"
                        )}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-luxury-text truncate">
                            {member.fullName}
                          </span>
                          {isSelf && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold shrink-0">
                              {isAr ? "أنت" : "Vous"}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-luxury-text-secondary truncate">{member.email}</p>
                        {member.phone && (
                          <p className="text-[10px] font-mono text-luxury-text-muted">{member.phone}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(member)}
                      disabled={isOwner || isSelf || isPending}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0",
                        member.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200",
                        (isOwner || isSelf) && "cursor-default opacity-80"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          member.isActive ? "bg-emerald-500" : "bg-red-500"
                        )}
                      />
                      <span>
                        {member.isActive
                          ? isAr ? "مفعّل" : "Actif"
                          : isAr ? "معطّل" : "Désactivé"}
                      </span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-luxury-border/20">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-medium border",
                        isOwner
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : member.role === "order_manager"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : member.role === "catalog_manager"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : member.role === "vitrine_manager"
                          ? "bg-purple-50 text-purple-800 border-purple-200"
                          : "bg-gray-100 text-gray-800 border-gray-300"
                      )}
                    >
                      {isAr
                        ? member.role === "owner"
                          ? "المدير العام"
                          : member.role === "order_manager"
                          ? "مؤكد الطلبيات"
                          : member.role === "catalog_manager"
                          ? "مسير الكتالوج"
                          : member.role === "vitrine_manager"
                          ? "مسؤول الواجهة"
                          : "صلاحيات مخصصة"
                        : member.role === "owner"
                        ? "Super Admin"
                        : member.role === "order_manager"
                        ? "Confirmateur"
                        : member.role === "catalog_manager"
                        ? "Catalogue & Stock"
                        : member.role === "vitrine_manager"
                        ? "Vitrine & Avis"
                        : "Sur-Mesure"}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSimulateRole(member.id)}
                        title={isAr ? "معاينة" : "Simuler"}
                        className="p-2 rounded bg-luxury-secondary/40 text-luxury-text-secondary hover:text-luxury-text"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const newP = prompt(
                            isAr
                              ? `أدخل كلمة المرور الجديدة لـ ${member.fullName} (6 أحرف على الأقل):`
                              : `Nouveau mot de passe pour ${member.fullName} (min 6 caractères) :`,
                            "Eline2026!"
                          );
                          if (newP && newP.length >= 6) {
                            startTransition(async () => {
                              const res = await resetAdminPasswordAction(member.id, newP, locale);
                              if (res.success) {
                                alert(
                                  isAr
                                    ? `تم تغيير كلمة المرور بنجاح إلى: ${newP}`
                                    : `Mot de passe mis à jour avec succès : ${newP}`
                                );
                              } else {
                                alert(res.error || "Erreur");
                              }
                            });
                          }
                        }}
                        title={isAr ? "تغيير كلمة المرور" : "Mot de passe"}
                        className="p-2 rounded bg-luxury-secondary/40 text-luxury-text-secondary hover:text-amber-600"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(member)}
                        title={isAr ? "تعديل الصلاحيات" : "Modifier"}
                        className="p-2 rounded bg-luxury-secondary/40 text-luxury-text-secondary hover:text-luxury-accent"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!isOwner && (
                        <button
                          onClick={() => handleDeleteMember(member)}
                          disabled={isPending}
                          title={isAr ? "حذف" : "Supprimer"}
                          className="p-2 rounded bg-red-50/70 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-luxury-secondary/40 border-b border-luxury-border/30 text-[10px] uppercase tracking-wider text-luxury-text-muted">
              <tr>
                <th className="py-3 px-4 font-semibold text-start">
                  {isAr ? "المسؤول / الحساب" : "Collaborateur"}
                </th>
                <th className="py-3 px-4 font-semibold text-start">
                  {isAr ? "الدور الوظيفي" : "Rôle Attribué"}
                </th>
                <th className="py-3 px-4 font-semibold text-start">
                  {isAr ? "نظرة على الصلاحيات" : "Accès & Permissions Clés"}
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  {isAr ? "الحالة" : "Statut"}
                </th>
                <th className="py-3 px-4 font-semibold text-end">
                  {isAr ? "الإجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border/20">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-luxury-text-muted">
                    <p className="text-sm font-medium">
                      {isAr ? "لا يوجد مسؤولون يطابقون هذا البحث." : "Aucun collaborateur trouvé pour cette sélection."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const isOwner = member.role === "owner";
                  const isSelf = member.email === currentAdminEmail;
                  const initials = member.fullName
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <tr
                      key={member.id}
                      className={cn(
                        "hover:bg-luxury-secondary/20 transition-colors",
                        !member.isActive && "opacity-60 bg-gray-50/50"
                      )}
                    >
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs",
                              isOwner
                                ? "bg-amber-600 text-white"
                                : member.role === "order_manager"
                                ? "bg-blue-600 text-white"
                                : member.role === "catalog_manager"
                                ? "bg-emerald-600 text-white"
                                : "bg-luxury-text text-white"
                            )}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-luxury-text truncate">
                                {member.fullName}
                              </span>
                              {isSelf && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
                                  {isAr ? "أنت" : "Vous"}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-luxury-text-secondary">
                              <span className="truncate">{member.email}</span>
                              {member.phone && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-[10px]">{member.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium border",
                            isOwner
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : member.role === "order_manager"
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : member.role === "catalog_manager"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : member.role === "vitrine_manager"
                              ? "bg-purple-50 text-purple-800 border-purple-200"
                              : "bg-gray-100 text-gray-800 border-gray-300"
                          )}
                        >
                          {isAr
                            ? member.role === "owner"
                              ? "المدير العام (Super Admin)"
                              : member.role === "order_manager"
                              ? "مؤكد الطلبيات (Call Center)"
                              : member.role === "catalog_manager"
                              ? "مسير المنتجات والمخزون"
                              : member.role === "vitrine_manager"
                              ? "مسؤول الواجهة والآراء"
                              : "صلاحيات مخصصة"
                            : member.role === "owner"
                            ? "Super Administrateur"
                            : member.role === "order_manager"
                            ? "Confirmateur de Commandes"
                            : member.role === "catalog_manager"
                            ? "Gestionnaire Catalogue & Stock"
                            : member.role === "vitrine_manager"
                            ? "Responsable Vitrine & Avis"
                            : "Rôle Sur-Mesure"}
                        </span>
                      </td>

                      {/* Permissions Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {isOwner ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                              {isAr ? "وصول كامل بدون قيود (10/10)" : "Accès Total Illimité (10/10)"}
                            </span>
                          ) : (
                            <>
                              {member.permissions.orders_view && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                  {isAr ? "الطلبيات" : "Commandes"}
                                </span>
                              )}
                              {member.permissions.products_manage && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {isAr ? "تعديل العطور" : "Catalogue"}
                                </span>
                              )}
                              {member.permissions.ui_controller && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                  {isAr ? "الواجهة" : "Vitrine"}
                                </span>
                              )}
                              {member.permissions.sales_analytics ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 font-medium">
                                  {isAr ? "المداخيل والمالية" : "Finances & CA"}
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 flex items-center gap-0.5 font-medium">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>{isAr ? "المالية محجوبة" : "Finances Masquées"}</span>
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>

                      {/* Status Active / Inactive */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(member)}
                          disabled={isOwner || isSelf || isPending}
                          title={
                            isOwner
                              ? isAr
                                ? "لا يمكن تعطيل المدير العام"
                                : "Le Super Admin principal ne peut être désactivé"
                              : isAr
                              ? "تبديل حالة الحساب"
                              : "Cliquer pour activer/désactiver ce compte"
                          }
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all",
                            member.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
                            (isOwner || isSelf) && "cursor-default opacity-80"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              member.isActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                            )}
                          />
                          <span>
                            {member.isActive
                              ? isAr
                                ? "مفعّل"
                                : "Actif"
                              : isAr
                              ? "معطّل"
                              : "Désactivé"}
                          </span>
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test view / simulate */}
                          <button
                            onClick={() => handleSimulateRole(member.id)}
                            title={
                              isAr
                                ? "معاينة لوحة التحكم بصلاحيات هذا المسؤول"
                                : "Simuler la vue pour voir le dashboard comme cet utilisateur"
                            }
                            className="p-1.5 rounded hover:bg-luxury-secondary text-luxury-text-secondary hover:text-luxury-text transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Password Reset */}
                          <button
                            onClick={() => {
                              const newP = prompt(
                                isAr
                                  ? `أدخل كلمة المرور الجديدة لـ ${member.fullName} (6 أحرف على الأقل):`
                                  : `Nouveau mot de passe pour ${member.fullName} (min 6 caractères) :`,
                                "Eline2026!"
                              );
                              if (newP && newP.length >= 6) {
                                startTransition(async () => {
                                  const res = await resetAdminPasswordAction(member.id, newP, locale);
                                  if (res.success) {
                                    alert(
                                      isAr
                                        ? `تم تغيير كلمة المرور بنجاح إلى: ${newP}`
                                        : `Mot de passe mis à jour avec succès : ${newP}`
                                    );
                                  } else {
                                    alert(res.error || "Erreur");
                                  }
                                });
                              }
                            }}
                            title={isAr ? "تغيير كلمة المرور" : "Changer le mot de passe"}
                            className="p-1.5 rounded hover:bg-luxury-secondary text-luxury-text-secondary hover:text-amber-600 transition-colors"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit permissions */}
                          <button
                            onClick={() => handleOpenEditModal(member)}
                            title={isAr ? "تعديل الصلاحيات" : "Modifier les permissions"}
                            className="p-1.5 rounded hover:bg-luxury-secondary text-luxury-text-secondary hover:text-luxury-accent transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete (disabled for owner) */}
                          {!isOwner && (
                            <button
                              onClick={() => handleDeleteMember(member)}
                              disabled={isPending}
                              title={isAr ? "حذف المسؤول" : "Supprimer ce compte"}
                              className="p-1.5 rounded hover:bg-red-50 text-luxury-text-muted hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT ADMIN & PERMISSIONS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[6px] max-w-2xl w-full max-h-[90dvh] flex flex-col border border-luxury-border/50 shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 bg-luxury-secondary/40 border-b border-luxury-border/30 flex items-center justify-between gap-2 shrink-0">
              <div>
                <h3 className="font-serif text-lg font-medium text-luxury-text">
                  {editingMember
                    ? isAr
                      ? `تعديل صلاحيات : ${editingMember.fullName}`
                      : `Ajuster les Accès : ${editingMember.fullName}`
                    : isAr
                    ? "إضافة مسؤول جديد وتحديد الصلاحيات"
                    : "Créer un Collaborateur & Définir ses Accès"}
                </h3>
                <p className="text-xs text-luxury-text-secondary">
                  {isAr
                    ? "اختر دوراً جاهزاً أو حدد بدقة ما يُسمح له برؤيته وتعديله"
                    : "Choisissez un profil prédéfini ou cochez manuellement chaque module accessible"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-luxury-text-muted hover:text-luxury-text rounded hover:bg-luxury-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-[4px] bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-[4px] bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Identity Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-luxury-text font-medium mb-1">
                    {isAr ? "الاسم الكامل *" : "Nom & Prénom *"}
                  </label>
                  <div className="relative">
                    <Input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isAr ? "مثال: بلال منصوري" : "Ex: Karim Benali"}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-luxury-text font-medium mb-1">
                    {isAr ? "البريد الإلكتروني *" : "Adresse Email *"}
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      required
                      disabled={Boolean(editingMember)}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="employe@elineparfumerie.dz"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-luxury-text font-medium mb-1">
                    {isAr ? "رقم الهاتف (اختياري)" : "Téléphone (optionnel)"}
                  </label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0550 12 34 56"
                    className="h-9 text-xs font-mono"
                  />
                </div>

                {!editingMember ? (
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-luxury-text font-medium mb-1">
                      {isAr ? "كلمة المرور المؤقتة * (6 أحرف على الأقل)" : "Mot de Passe Initial * (min 6 caractères)"}
                    </label>
                    <Input
                      type="text"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Eline2026!"
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-luxury-text font-medium mb-1">
                      {isAr ? "تغيير كلمة المرور (اختياري - 6 أحرف على الأقل)" : "Nouveau Mot de Passe (optionnel - min 6 car.)"}
                    </label>
                    <Input
                      type="text"
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isAr ? "اتركه فارغاً للإبقاء على الحالية" : "Laisser vide pour ne pas modifier"}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Role Presets Selector */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-luxury-text font-semibold mb-2">
                  {isAr ? "1. اختيار نموذج دور جاهز (Sélection Rapide)" : "1. Modèle de Rôle Prédéfini"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      role: "order_manager" as AdminRole,
                      labelFr: "Confirmateur",
                      labelAr: "مؤكد طلبيات",
                      icon: PhoneCall,
                      color: "text-blue-600",
                    },
                    {
                      role: "catalog_manager" as AdminRole,
                      labelFr: "Catalogue & Stock",
                      labelAr: "مسير الكتالوج",
                      icon: Package,
                      color: "text-emerald-600",
                    },
                    {
                      role: "vitrine_manager" as AdminRole,
                      labelFr: "Vitrine & Avis",
                      labelAr: "الواجهة والآراء",
                      icon: SlidersHorizontal,
                      color: "text-purple-600",
                    },
                    {
                      role: "owner" as AdminRole,
                      labelFr: "Super Admin",
                      labelAr: "مدير عام",
                      icon: ShieldCheck,
                      color: "text-amber-600",
                    },
                  ].map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = selectedRole === preset.role;
                    return (
                      <button
                        type="button"
                        key={preset.role}
                        onClick={() => handleSelectRolePreset(preset.role)}
                        className={cn(
                          "p-2.5 rounded-[4px] border text-start flex flex-col gap-1 transition-all",
                          isSelected
                            ? "border-luxury-accent bg-luxury-secondary/80 shadow-xs ring-1 ring-luxury-accent"
                            : "border-luxury-border/50 hover:border-luxury-border hover:bg-luxury-secondary/20"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={cn("w-4 h-4", preset.color)} />
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-luxury-accent" />}
                        </div>
                        <span className="text-xs font-semibold text-luxury-text leading-tight">
                          {isAr ? preset.labelAr : preset.labelFr}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permission Toggles Matrix */}
              <div className="space-y-3 pt-2 border-t border-luxury-border/30">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] uppercase tracking-wider text-luxury-text font-semibold">
                    {isAr
                      ? "2. تفاصيل الصلاحيات الفردية (Cases à cocher)"
                      : "2. Permissions Détaillées par Module"}
                  </label>
                  {selectedRole === "custom" && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                      {isAr ? "وضع التخصيص اليدوي" : "Configuration Personnalisée"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pe-1">
                  {ALL_PERMISSIONS_KEYS.map((key) => {
                    const def = PERMISSION_DEFINITIONS[key];
                    const isChecked = Boolean(permissionsState[key]);
                    const isOwnerPreset = selectedRole === "owner";

                    return (
                      <div
                        key={key}
                        onClick={() => !isOwnerPreset && handleTogglePermission(key)}
                        className={cn(
                          "p-2.5 rounded-[4px] border flex items-start gap-2.5 transition-all text-start cursor-pointer select-none",
                          isChecked
                            ? "bg-luxury-secondary/40 border-luxury-border/70"
                            : "bg-white border-luxury-border/30 hover:border-luxury-border/60 opacity-80",
                          isOwnerPreset && "cursor-not-allowed opacity-90"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isOwnerPreset}
                          onChange={() => {}}
                          className="mt-0.5 h-4 w-4 rounded border-luxury-border text-luxury-accent focus:ring-luxury-accent cursor-pointer"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-luxury-text leading-tight">
                            {isAr ? def.labelAr : def.labelFr}
                          </p>
                          <p className="text-[10px] text-luxury-text-secondary leading-snug mt-0.5 line-clamp-2">
                            {isAr ? def.descAr : def.descFr}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Important Notice regarding Sales & Revenue Privacy */}
                {!permissionsState.sales_analytics && (
                  <div className="p-2.5 rounded-[4px] bg-red-50 border border-red-200/60 flex items-start gap-2 text-[11px] text-red-800">
                    <Lock className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <span>
                      {isAr
                        ? "أمان الخصوصية المالية : تم حجب إجمالي الأرباح والمداخيل اليومية عن هذا الحساب، ولن تظهر في لوحة تحكمه."
                        : "Sécurité & Confidentialité : Le chiffre d'affaires et les bénéfices du magasin seront masqués sur le tableau de bord de ce compte."}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-luxury-border/30 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isPending}
                  className="text-xs h-9"
                >
                  {isAr ? "إلغاء" : "Annuler"}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="bg-luxury-text hover:bg-black text-white text-xs h-9 gap-1.5"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-accent" />
                      <span>{isAr ? "جارٍ الحفظ..." : "Enregistrement..."}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-luxury-accent" />
                      <span>
                        {editingMember
                          ? isAr
                            ? "حفظ التعديلات"
                            : "Mettre à jour les accès"
                          : isAr
                          ? "إنشاء المسؤول"
                          : "Créer le collaborateur"}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
