export const AUTH_ROLE_KEY = "portal-role";
export const AUTH_USER_KEY = "portal-user";

export type Role = "staff" | "manager" | "hq";

export function getAuth(): { role: Role; userId: string } | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem(AUTH_ROLE_KEY) as Role | null;
  const userId = localStorage.getItem(AUTH_USER_KEY);
  if (role === "staff" || role === "manager" || role === "hq") {
    return { role, userId: userId || "" };
  }
  return null;
}

export function setAuth(role: Role, userId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_ROLE_KEY, role);
  localStorage.setItem(AUTH_USER_KEY, userId);
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_ROLE_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
