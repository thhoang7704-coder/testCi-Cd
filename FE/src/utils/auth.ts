export type DecodedJwtPayload = {
  sub?: string;
  subject?: string;
  roles?: unknown;
  authorities?: unknown;
  role?: unknown;
  [k: string]: unknown;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("token") || localStorage.getItem("access_token");
};

export const decodeJwtPayload = (token: string): DecodedJwtPayload | null => {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);

  try {
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json) as DecodedJwtPayload;
  } catch {
    return null;
  }
};

const normalizeRole = (r: string) => r.replace(/^ROLE_/, "").toUpperCase();

export const getRolesFromToken = (token: string): string[] => {
  const payload = decodeJwtPayload(token);
  const raw = payload?.roles || payload?.authorities || payload?.role;
  const roles = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return roles.map(String).map(normalizeRole);
};

export const requireRoleFromToken = (
  role: string,
): { ok: true } | { ok: false; reason: string } => {
  const token = getAuthToken();
  if (!token)
    return { ok: false, reason: "You need to sign in (missing token)." };

  const roles = getRolesFromToken(token);
  if (!roles.includes(normalizeRole(role))) {
    return {
      ok: false,
      reason: `Account does not have role ${normalizeRole(role)}.`,
    };
  }

  return { ok: true };
};
