import { createSlice } from "@reduxjs/toolkit";

// ================= SAFE READ TOKEN =================
const storedToken =
  localStorage.getItem("access_token") || localStorage.getItem("token");
const storedUserRaw = localStorage.getItem("user");

const safeJsonParse = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const safeDecodeJwtPayload = (token) => {
  if (!token) return null;
  const parts = String(token).split(".");
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
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const decoded = safeDecodeJwtPayload(storedToken);
const parsedUser = safeJsonParse(storedUserRaw);

const initialRolesRaw = Array.isArray(decoded?.roles)
  ? decoded.roles
  : decoded?.roles
    ? [decoded.roles]
    : decoded?.role
      ? [decoded.role]
      : [];

const initialRoles = (initialRolesRaw || [])
  .filter(Boolean)
  .map((r) => String(r).replace(/^ROLE_/, ""));

const initialPermissions = Array.isArray(decoded?.permissions)
  ? decoded.permissions
  : decoded?.permissions
    ? [decoded.permissions]
    : [];

const initialUser =
  parsedUser ||
  (decoded
    ? {
        username: decoded.sub,
        role: initialRoles?.[0],
      }
    : null);

const initialState = {
  token: storedToken || null,
  user: initialUser,
  roles: initialRoles,
  permissions: initialPermissions,
  // Keep both flags for compatibility across the codebase
  isAuthenticated: storedToken ? true : false,
  isAuth: storedToken ? true : false,
};

const normalizeAuthUserDates = (user) => {
  if (!user || typeof user !== 'object') return user;
  const out = { ...user };

  // snake_case
  if (out.last_login_at instanceof Date) out.last_login_at = out.last_login_at.toISOString();
  if (out.created_at instanceof Date) out.created_at = out.created_at.toISOString();
  if (out.updated_at instanceof Date) out.updated_at = out.updated_at.toISOString();

  // camelCase
  if (out.lastLoginAt instanceof Date) out.lastLoginAt = out.lastLoginAt.toISOString();
  if (out.createdAt instanceof Date) out.createdAt = out.createdAt.toISOString();
  if (out.updatedAt instanceof Date) out.updatedAt = out.updatedAt.toISOString();

  return out;
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Preferred action after login
    setAuth: (state, action) => {
      const { token, user, roles = [], permissions = [] } = action.payload;

      const decodedNow = safeDecodeJwtPayload(token);
      const derivedRolesRaw = Array.isArray(decodedNow?.roles)
        ? decodedNow.roles
        : decodedNow?.roles
          ? [decodedNow.roles]
          : decodedNow?.role
            ? [decodedNow.role]
            : [];
      const derivedRoles = (derivedRolesRaw || [])
        .filter(Boolean)
        .map((r) => String(r).replace(/^ROLE_/, ""));

      const derivedPermissions = Array.isArray(decodedNow?.permissions)
        ? decodedNow.permissions
        : decodedNow?.permissions
          ? [decodedNow.permissions]
          : [];

      state.token = token;
      state.user = normalizeAuthUserDates(user);
      state.roles = roles?.length ? roles : derivedRoles;
      state.permissions = permissions?.length ? permissions : derivedPermissions;
      state.isAuthenticated = true;
      state.isAuth = true;

      // Persist token (write both keys for backwards compatibility)
      localStorage.setItem("access_token", token);
      localStorage.setItem("token", token);

      if (user) {
        localStorage.setItem("user", JSON.stringify(normalizeAuthUserDates(user)));
      }
    },

    // Backwards-compatible alias used by existing UI code
    setUser: (state, action) => {
      const { user, token } = action.payload;
      const decodedNow = safeDecodeJwtPayload(token);
      const derivedRolesRaw = Array.isArray(decodedNow?.roles)
        ? decodedNow.roles
        : decodedNow?.roles
          ? [decodedNow.roles]
          : decodedNow?.role
            ? [decodedNow.role]
            : [];
      const derivedRoles = (derivedRolesRaw || [])
        .filter(Boolean)
        .map((r) => String(r).replace(/^ROLE_/, ""));

      const derivedPermissions = Array.isArray(decodedNow?.permissions)
        ? decodedNow.permissions
        : decodedNow?.permissions
          ? [decodedNow.permissions]
          : [];
      // Reuse setAuth behavior without requiring roles/permissions.
      state.token = token;
      state.user = normalizeAuthUserDates(user);
      state.roles = derivedRoles;
      state.permissions = derivedPermissions;
      state.isAuthenticated = true;
      state.isAuth = true;

      localStorage.setItem("access_token", token);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizeAuthUserDates(user)));
    },

    logOut: (state) => {
      state.token = null;
      state.user = null;
      state.roles = [];
      state.permissions = [];
      state.isAuthenticated = false;
      state.isAuth = false;

      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setAuth, setUser, logOut } = authSlice.actions;
export default authSlice.reducer;
