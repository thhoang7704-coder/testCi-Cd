import apiClient from "./apiClient";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  UserRole,
} from "../types";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  statusCode?: number;
};

type BackendAuthData = {
  token: string;
  authenticated: boolean;
};

const decodeJwtPayload = (token: string): any => {
  // JWT: header.payload.signature (payload is base64url)
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  // Pad base64 string
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

const normalizeRoleFromJwt = (roles: unknown): UserRole => {
  const rawList = Array.isArray(roles) ? roles.map(String) : [];
  const list = rawList.map((r) => r.replace(/^ROLE_/, "").toUpperCase());

  if (list.includes("SYSTEM_ADMIN")) return "SYSTEM_ADMIN";
  if (list.includes("LAB_ADMIN")) return "LAB_ADMIN";
  if (list.includes("COMPANY")) return "COMPANY";
  if (list.includes("MENTOR")) return "MENTOR";
  if (list.includes("TALENT_LEADER")) return "TALENT_LEADER";
  if (list.includes("TALENT")) return "TALENT";
  if (list.includes("USER")) return "USER";

  // Default to TALENT to keep legacy behavior for unknown roles.
  return "TALENT";
};

const userFromBackendToken = (token: string): User => {
  const payload = decodeJwtPayload(token) || {};
  const subject = String(payload.sub || payload.subject || "");
  const role = normalizeRoleFromJwt(payload.roles);

  const rolesRaw: string[] = Array.isArray(payload.roles)
    ? payload.roles.map((v: unknown) => String(v))
    : [];
  const roles = rolesRaw.map((r: string) => r.replace(/^ROLE_/, "").toUpperCase());

  const permissions = Array.isArray(payload.permissions)
    ? payload.permissions.map(String)
    : payload.permissions
      ? [String(payload.permissions)]
      : [];

  const nowIso = new Date().toISOString();

  return {
    id: subject || "unknown",
    email: subject || "unknown",
    role,

    // Prefer keeping both naming styles for compatibility.
    fullName: subject || "User",
    full_name: subject || "User",

    username: subject || "unknown",
    roles,
    permissions,

    isActive: true,
    is_active: true,

    emailVerified: true,
    email_verified: true,

    lastLoginAt: nowIso,
    last_login_at: nowIso,

    createdAt: nowIso,
    created_at: nowIso,

    updatedAt: nowIso,
    updated_at: nowIso,
  };
};

const isAxiosNotFoundOrNetwork = (error: any): boolean => {
  const status = error?.response?.status;
  return status === 404 || status === 502 || status === 503 || status === 504 || !error?.response;
};

export const authService = {
  async loginForRoles(
    credentials: LoginRequest,
    allowedRoles: UserRole[],
  ): Promise<AuthResponse> {
    const result = await this.login(credentials);
    if (!allowedRoles.includes(result.user.role)) {
      throw new Error("Account does not have required role");
    }
    return result;
  },

  loginSystemAdmin(credentials: LoginRequest): Promise<AuthResponse> {
    return this.loginForRoles(credentials, ["SYSTEM_ADMIN"]);
  },

  loginLabAdmin(credentials: LoginRequest): Promise<AuthResponse> {
    return this.loginForRoles(credentials, ["LAB_ADMIN"]);
  },

  loginCompany(credentials: LoginRequest): Promise<AuthResponse> {
    return this.loginForRoles(credentials, ["COMPANY"]);
  },

  loginMentor(credentials: LoginRequest): Promise<AuthResponse> {
    return this.loginForRoles(credentials, ["MENTOR"]);
  },

  loginUser(credentials: LoginRequest): Promise<AuthResponse> {
    // Accept both TALENT and TALENT_LEADER; backend may also return USER.
    return this.loginForRoles(credentials, ["TALENT", "TALENT_LEADER", "USER"]);
  },

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Spring Boot endpoint: POST /auth/token
    // Request body: { username, password }
    const username = credentials.username || credentials.email;
    if (!username) {
      throw new Error("Username is required");
    }
    const response = await apiClient.post<ApiResponse<BackendAuthData>>(
      "/auth/token",
      {
        username,
        password: credentials.password,
      },
    );

    const token = response.data?.data?.token;
    const authenticated = response.data?.data?.authenticated;
    if (!token || authenticated !== true) {
      throw new Error(response.data?.message || "Authentication failed");
    }

    const user = userFromBackendToken(token);
    return { user, token };
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    } catch (error: any) {
      // Keep register strict; if backend isn't ready, tell caller.
      if (isAxiosNotFoundOrNetwork(error)) {
        throw new Error("Backend register API is not available yet");
      }
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      // Backend does not expose /auth/me in current code.
      // Derive user info from stored token or localStorage user.
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      if (token) {
        const derived = userFromBackendToken(token);
        return derived;
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed;
      }

      throw new Error("Not authenticated");
    } catch (error: any) {
      if (isAxiosNotFoundOrNetwork(error)) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          return parsed;
        }
      }
      throw error;
    }
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.patch(`/users/${userId}`, data);
    return response.data;
  },

  async uploadAvatar(userId: string, file: File): Promise<User> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await apiClient.post(`/users/${userId}/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  async updateAvatarsForAllUsers(
    avatarUrl: string,
    userIds: string[],
  ): Promise<void> {
    const updatePromises = userIds.map((userId) =>
      apiClient.patch(`/users/${userId}`, { avatar: avatarUrl }),
    );
    await Promise.all(updatePromises);
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post("/auth/reset-password", { token, password });
  },

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post("/auth/verify-email", { token });
  },

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },
};
