import fs from "fs";
import path from "path";
import {
  AdminMember,
  AdminPermissions,
  AdminRole,
  CreateAdminMemberInput,
  ROLE_PRESETS,
  ALL_PERMISSIONS_KEYS,
} from "@/types/admin-role";
import { DEFAULT_TEAM_MEMBERS } from "@/lib/data/team.default";
import { createAdminClient } from "@/lib/supabase/admin";

const TEAM_FILE_PATH = path.join(process.cwd(), "lib", "data", "team.json");

/**
 * Reads local team JSON file safely
 */
async function readLocalTeamFile(): Promise<AdminMember[]> {
  try {
    if (fs.existsSync(TEAM_FILE_PATH)) {
      const raw = await fs.promises.readFile(TEAM_FILE_PATH, "utf-8");
      const parsed: AdminMember[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("[readLocalTeamFile] Error reading team.json:", err);
  }
  return DEFAULT_TEAM_MEMBERS;
}

/**
 * Writes local team JSON file safely (skips writing if content is identical to prevent triggering Next.js file watchers)
 */
async function writeLocalTeamFile(members: AdminMember[]): Promise<void> {
  try {
    const newContent = JSON.stringify(members, null, 2);
    if (fs.existsSync(TEAM_FILE_PATH)) {
      const currentContent = await fs.promises.readFile(TEAM_FILE_PATH, "utf-8");
      if (currentContent === newContent) {
        return;
      }
    }
    await fs.promises.writeFile(TEAM_FILE_PATH, newContent, "utf-8");
  } catch (err) {
    console.error("[writeLocalTeamFile] Error writing team.json:", err);
  }
}

/**
 * Get all team members, querying Supabase profiles with fallback to local JSON.
 * Fresh start: no hardcoded dummy admins. If currentUserEmail is provided and the directory
 * is empty, automatically registers the logged-in administrator as the Super Admin (owner).
 */
export async function getTeamMembers(currentUserEmail?: string): Promise<AdminMember[]> {
  const localMembers = await readLocalTeamFile();
  let result: AdminMember[] = [];
  let supabaseConnected = false;

  try {
    const adminClient = createAdminClient();
    const [profilesRes, authRes] = await Promise.all([
      (adminClient.from("profiles") as any)
        .select("id, email, full_name, phone, role, is_active, created_at, last_login_at, permissions")
        .order("created_at", { ascending: true }),
      adminClient.auth.admin.listUsers({ perPage: 1000 }).catch(() => ({ data: null, error: null })),
    ]);

    let dbProfiles = profilesRes?.data;
    const dbError = profilesRes?.error;

    if (!dbError && Array.isArray(dbProfiles)) {
      supabaseConnected = true;

      // If Supabase Auth users list is available, ensure we don't return orphan profiles
      // of users that were removed from Supabase Auth
      if (authRes?.data?.users && authRes.data.users.length > 0) {
        const validAuthEmails = new Set(authRes.data.users.map((u: any) => u.email?.toLowerCase()));
        const validAuthIds = new Set(authRes.data.users.map((u: any) => u.id));

        const activeProfiles = dbProfiles.filter(
          (p: any) => (p.email && validAuthEmails.has(p.email.toLowerCase())) || validAuthIds.has(p.id)
        );

        // Auto-prune orphaned profiles from Supabase profiles table if found
        const orphans = dbProfiles.filter(
          (p: any) => !((p.email && validAuthEmails.has(p.email.toLowerCase())) || validAuthIds.has(p.id))
        );
        for (const orphan of orphans) {
          (adminClient.from("profiles") as any).delete().eq("id", orphan.id).catch(() => {});
        }

        dbProfiles = activeProfiles;
      }

      result = dbProfiles.map((p: any) => {
        const localMatch = localMembers.find(
          (m) => m.email?.toLowerCase() === p.email?.toLowerCase() || m.id === p.id
        );

        // Resolve exact granular role
        let resolvedRole: AdminRole;
        if (p.role === "owner") {
          resolvedRole = "owner";
        } else if (
          p.permissions?.assigned_role &&
          (p.permissions.assigned_role in ROLE_PRESETS || p.permissions.assigned_role === "custom")
        ) {
          resolvedRole = p.permissions.assigned_role as AdminRole;
        } else if (localMatch?.role) {
          resolvedRole = localMatch.role;
        } else if (p.role in ROLE_PRESETS) {
          resolvedRole = p.role as AdminRole;
        } else {
          resolvedRole = "order_manager";
        }

        let perms: AdminPermissions;
        if (resolvedRole === "owner") {
          perms = { ...ROLE_PRESETS.owner.permissions };
        } else if (p.permissions && typeof p.permissions === "object") {
          perms = { ...p.permissions };
          delete (perms as any).assigned_role;
        } else if (localMatch?.permissions) {
          perms = { ...localMatch.permissions };
        } else if (resolvedRole in ROLE_PRESETS) {
          perms = { ...ROLE_PRESETS[resolvedRole as Exclude<AdminRole, "custom">].permissions };
        } else {
          perms = { ...ROLE_PRESETS.order_manager.permissions };
        }

        return {
          id: p.id,
          email: p.email,
          fullName: p.full_name || localMatch?.fullName || p.email?.split("@")[0] || "Administrateur",
          phone: p.phone || localMatch?.phone,
          role: resolvedRole,
          permissions: perms,
          isActive: p.is_active ?? true,
          createdAt: p.created_at || localMatch?.createdAt || new Date().toISOString(),
          lastLoginAt: p.last_login_at || localMatch?.lastLoginAt,
        };
      });
    }
  } catch (err) {
    console.warn("[getTeamMembers] Supabase fetch error, fallback to local storage:", err);
  }

  // If Supabase was unreachable or returned an error, fallback to local storage
  if (!supabaseConnected) {
    result = [...localMembers];
  }

  // Only auto-provision an owner if the entire team directory is completely empty
  if (result.length === 0 && currentUserEmail) {
    const emailNorm = currentUserEmail.trim().toLowerCase();
    const ownerMember: AdminMember = {
      id: `admin-${Date.now()}`,
      email: emailNorm,
      fullName: emailNorm.split("@")[0] || "Super Admin",
      role: "owner",
      permissions: { ...ROLE_PRESETS.owner.permissions },
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    result.unshift(ownerMember);
    await writeLocalTeamFile(result);
  }

  return result;
}

/**
 * Get a single member by ID
 */
export async function getAdminMemberById(id: string): Promise<AdminMember | null> {
  const members = await getTeamMembers();
  return members.find((m) => m.id === id) || null;
}

/**
 * Get a single member by Email (does NOT trigger auto-provisioning)
 */
export async function getAdminMemberByEmail(email: string): Promise<AdminMember | null> {
  const members = await getTeamMembers();
  return members.find((m) => m.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Resolves effective permissions for the currently logged-in user,
 * taking into account any active role simulation (for Super Admin testing).
 */
export async function getEffectiveAdminPermissions(
  userEmail: string,
  simulatedRole?: string | null
): Promise<{
  role: AdminRole;
  permissions: AdminPermissions;
  isOwner: boolean;
  isRealOwner: boolean;
  isSimulating: boolean;
  member: AdminMember;
}> {
  const member = (await getAdminMemberByEmail(userEmail)) || {
    id: `auto-owner-${Date.now()}`,
    email: userEmail,
    fullName: userEmail.split("@")[0] || "Super Admin",
    role: "owner" as AdminRole,
    permissions: ROLE_PRESETS.owner.permissions,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const isRealOwner = member.role === "owner";

  // Check if simulation is active (allowed only if user is real owner)
  if (isRealOwner && simulatedRole && simulatedRole !== "real_owner") {
    if (simulatedRole in ROLE_PRESETS) {
      const preset = ROLE_PRESETS[simulatedRole as Exclude<AdminRole, "custom">];
      return {
        role: simulatedRole as AdminRole,
        permissions: { ...preset.permissions },
        isOwner: false,
        isRealOwner: true,
        isSimulating: true,
        member,
      };
    }

    // Or simulated against a specific team member ID
    const targetMember = (await getTeamMembers()).find((m) => m.id === simulatedRole);
    if (targetMember) {
      return {
        role: targetMember.role,
        permissions: { ...targetMember.permissions },
        isOwner: targetMember.role === "owner",
        isRealOwner: true,
        isSimulating: true,
        member,
      };
    }
  }

  // Real effective permissions
  if (member.role === "owner") {
    return {
      role: "owner",
      permissions: { ...ROLE_PRESETS.owner.permissions },
      isOwner: true,
      isRealOwner: true,
      isSimulating: false,
      member,
    };
  }

  return {
    role: member.role,
    permissions: member.permissions || ROLE_PRESETS.order_manager.permissions,
    isOwner: false,
    isRealOwner: false,
    isSimulating: false,
    member,
  };
}

/**
 * Create a new team member with auth credentials and permissions
 */
export async function createAdminMember(
  input: CreateAdminMemberInput
): Promise<{ success: boolean; member?: AdminMember; error?: string }> {
  try {
    const email = input.email.trim().toLowerCase();
    const existing = await getAdminMemberByEmail(email);
    if (existing) {
      return { success: false, error: "Un administrateur avec cette adresse email existe déjà." };
    }

    // Compute complete permissions
    let permissions: AdminPermissions;
    if (input.role in ROLE_PRESETS) {
      permissions = {
        ...ROLE_PRESETS[input.role as Exclude<AdminRole, "custom">].permissions,
        ...(input.permissions || {}),
      };
    } else {
      permissions = ALL_PERMISSIONS_KEYS.reduce((acc, key) => {
        acc[key] = Boolean(input.permissions?.[key]);
        return acc;
      }, {} as AdminPermissions);
    }

    const newId = `admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newMember: AdminMember = {
      id: newId,
      email,
      fullName: input.fullName.trim(),
      phone: input.phone?.trim() || undefined,
      role: input.role,
      permissions,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    // 1. Create or update user in Supabase Auth & Profiles
    const adminClient = createAdminClient();
    let authUserId = newId;

    if (input.password) {
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password: input.password,
        email_confirm: true,
        user_metadata: {
          full_name: newMember.fullName,
          role: input.role,
        },
      });

      if (authError) {
        console.warn("[createAdminMember] authError:", authError.message);
        // If user already exists in auth, find them and update their password
        if (
          authError.message?.toLowerCase().includes("already") ||
          authError.status === 422
        ) {
          const { data: listData } = await adminClient.auth.admin.listUsers();
          const existingUser = listData?.users.find((u) => u.email?.toLowerCase() === email);
          if (existingUser) {
            authUserId = existingUser.id;
            newMember.id = authUserId;
            await adminClient.auth.admin.updateUserById(existingUser.id, {
              password: input.password,
              email_confirm: true,
              user_metadata: { full_name: newMember.fullName, role: input.role },
            });
          } else {
            return { success: false, error: authError.message };
          }
        } else {
          return {
            success: false,
            error: `Erreur d'authentification Supabase: ${authError.message}`,
          };
        }
      } else if (authData.user) {
        authUserId = authData.user.id;
        newMember.id = authUserId;
      }
    }

    try {
      await (adminClient.from("profiles") as any).upsert(
        {
          id: authUserId,
          email,
          full_name: newMember.fullName,
          phone: newMember.phone || null,
          role: input.role === "owner" ? "owner" : "employee",
          permissions: {
            ...permissions,
            assigned_role: input.role,
          },
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    } catch (profileErr: any) {
      console.warn("[createAdminMember] Profiles table error:", profileErr?.message);
    }

    // 2. Persist to local JSON file
    const currentMembers = await getTeamMembers();
    const filtered = currentMembers.filter((m) => m.email.toLowerCase() !== email);
    filtered.unshift(newMember);
    await writeLocalTeamFile(filtered);

    return { success: true, member: newMember };
  } catch (err: any) {
    console.error("[createAdminMember] Unexpected error:", err);
    return { success: false, error: err?.message || "Erreur lors de la création de l'administrateur" };
  }
}

/**
 * Update an existing admin member's details, role or permissions
 */
export async function updateAdminMember(
  id: string,
  updates: Partial<AdminMember>
): Promise<{ success: boolean; member?: AdminMember; error?: string }> {
  try {
    const members = await getTeamMembers();
    const index = members.findIndex((m) => m.id === id);

    if (index === -1) {
      return { success: false, error: "Administrateur introuvable." };
    }

    const current = members[index];

    // Protect owner accounts: at least one active owner must remain
    if (current.role === "owner") {
      if (updates.role && updates.role !== "owner") {
        const otherOwners = members.filter((m) => m.role === "owner" && m.id !== id && m.isActive);
        if (otherOwners.length === 0) {
          return { success: false, error: "Impossible de modifier le rôle du dernier Super Administrateur." };
        }
      }
      if (updates.isActive === false) {
        const otherActiveOwners = members.filter((m) => m.role === "owner" && m.id !== id && m.isActive);
        if (otherActiveOwners.length === 0) {
          return { success: false, error: "Impossible de désactiver le dernier Super Administrateur actif." };
        }
      }
    }

    const nextRole = updates.role || current.role;
    let nextPermissions: AdminPermissions;
    if (updates.permissions) {
      nextPermissions = { ...current.permissions, ...updates.permissions };
    } else if (updates.role && updates.role in ROLE_PRESETS) {
      nextPermissions = { ...ROLE_PRESETS[updates.role as Exclude<AdminRole, "custom">].permissions };
    } else {
      nextPermissions = current.permissions;
    }

    const updatedMember: AdminMember = {
      ...current,
      ...updates,
      role: nextRole,
      permissions: nextPermissions,
    };

    members[index] = updatedMember;
    await writeLocalTeamFile(members);

    // Sync to Supabase profiles
    try {
      const adminClient = createAdminClient();
      await (adminClient.from("profiles") as any)
        .update({
          full_name: updatedMember.fullName,
          phone: updatedMember.phone || null,
          role: updatedMember.role === "owner" ? "owner" : "employee",
          permissions: {
            ...updatedMember.permissions,
            assigned_role: updatedMember.role,
          },
          is_active: updatedMember.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("email", updatedMember.email);
    } catch {
      // ignore db error
    }

    return { success: true, member: updatedMember };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur de mise à jour" };
  }
}

/**
 * Toggle admin member active status
 */
export async function toggleAdminStatus(
  id: string
): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
  const member = await getAdminMemberById(id);
  if (!member) return { success: false, error: "Administrateur introuvable" };

  if (member.role === "owner") {
    return { success: false, error: "Le Super Administrateur ne peut pas être désactivé." };
  }

  const res = await updateAdminMember(id, { isActive: !member.isActive });
  if (res.success && res.member) {
    return { success: true, isActive: res.member.isActive };
  }
  return { success: false, error: res.error };
}

/**
 * Delete an admin member
 */
export async function deleteAdminMember(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const members = await getTeamMembers();
    const member = members.find((m) => m.id === id);

    if (!member) {
      return { success: false, error: "Administrateur introuvable" };
    }

    if (member.role === "owner") {
      const otherOwners = members.filter((m) => m.role === "owner" && m.id !== id && m.isActive);
      if (otherOwners.length === 0) {
        return { success: false, error: "Impossible de supprimer le dernier compte Super Administrateur." };
      }
    }

    // Try Supabase delete from profiles and auth.users
    try {
      const adminClient = createAdminClient();
      await (adminClient.from("profiles") as any).delete().eq("id", member.id);
      await (adminClient.from("profiles") as any).delete().eq("email", member.email);

      const { data: listData } = await adminClient.auth.admin.listUsers();
      const authUser = listData?.users.find(
        (u) => u.email?.toLowerCase() === member.email.toLowerCase() || u.id === member.id
      );
      if (authUser) {
        await adminClient.auth.admin.deleteUser(authUser.id);
      }
    } catch {
      // ignore
    }

    const filtered = members.filter((m) => m.id !== id && m.email.toLowerCase() !== member.email.toLowerCase());
    await writeLocalTeamFile(filtered);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur lors de la suppression" };
  }
}

/**
 * Reset an administrator's password in Supabase Auth & local directory
 */
export async function resetAdminPassword(
  id: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const member = await getAdminMemberById(id);
    if (!member) return { success: false, error: "Administrateur introuvable" };

    const adminClient = createAdminClient();

    // Try updating by Supabase Auth ID
    const { error: updateErr } = await adminClient.auth.admin.updateUserById(member.id, {
      password: newPassword,
      email_confirm: true,
    });

    if (updateErr) {
      // If ID not matched directly, find by email
      const { data: listData } = await adminClient.auth.admin.listUsers();
      const authUser = listData?.users.find((u) => u.email?.toLowerCase() === member.email.toLowerCase());
      if (authUser) {
        await adminClient.auth.admin.updateUserById(authUser.id, {
          password: newPassword,
          email_confirm: true,
        });
      } else {
        // Create user in auth if not there
        await adminClient.auth.admin.createUser({
          email: member.email,
          password: newPassword,
          email_confirm: true,
        });
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur lors de la réinitialisation" };
  }
}
