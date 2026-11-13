import type { Role } from "@prisma/client";

const rank: Record<Role, number> = {
  CUSTOMER: 0,
  DESIGNER: 1,
  BUSINESS: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export function hasRole(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}

export function atLeast(role: Role, minimum: Role) {
  return rank[role] >= rank[minimum];
}
