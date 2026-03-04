export const ROLE = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  DOKTER: "DOKTER",
  PASIEN: "PASIEN",
} as const;

export type AppRole = (typeof ROLE)[keyof typeof ROLE];

export const SUPER_ADMIN_ONLY = [ROLE.SUPER_ADMIN] as const;
export const ADMIN_OR_SUPER_ADMIN = [ROLE.ADMIN, ROLE.SUPER_ADMIN] as const;
