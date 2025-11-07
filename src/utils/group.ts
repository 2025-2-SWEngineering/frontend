export type GroupWithRole = { id: number; name?: string; user_role?: "admin" | "member" };

export function isAdminFor(groups: Array<GroupWithRole>, groupId: number | null): boolean {
  if (!groupId) return false;
  return !!groups.find((g) => g.id === groupId && g.user_role === "admin");
}
