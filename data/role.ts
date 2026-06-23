export const dataRole = {
  superadmin: "Super Admin",
  admin: "Admin",
  pimpinan: "Pimpinan",
  staff: "Staff",
} as const;

export type RoleKey = keyof typeof dataRole;
