export type AppRole = "SUPER_ADMIN" | "ADMIN" | "DOKTER" | "PASIEN";

export type PermissionModule =
  | "users"
  | "organization"
  | "security"
  | "monitoring"
  | "governance"
  | "settings"
  | "approvals";

export type PermissionAction = "view" | "create" | "update" | "delete" | "approve" | "export";

type Matrix = Record<AppRole, Record<PermissionModule, PermissionAction[]>>;

export const rbacMatrix: Matrix = {
  SUPER_ADMIN: {
    users: ["view", "create", "update", "delete", "approve", "export"],
    organization: ["view", "create", "update", "delete", "approve", "export"],
    security: ["view", "create", "update", "delete", "approve", "export"],
    monitoring: ["view", "export"],
    governance: ["view", "create", "update", "delete", "approve", "export"],
    settings: ["view", "update", "approve"],
    approvals: ["view", "approve"],
  },
  ADMIN: {
    users: ["view", "create", "update"],
    organization: ["view", "create", "update"],
    security: ["view"],
    monitoring: ["view"],
    governance: ["view", "export"],
    settings: ["view"],
    approvals: ["view"],
  },
  DOKTER: {
    users: [],
    organization: ["view"],
    security: [],
    monitoring: [],
    governance: ["view"],
    settings: [],
    approvals: [],
  },
  PASIEN: {
    users: [],
    organization: [],
    security: [],
    monitoring: [],
    governance: [],
    settings: [],
    approvals: [],
  },
};

export function can(role: AppRole, module: PermissionModule, action: PermissionAction): boolean {
  return rbacMatrix[role][module].includes(action);
}
