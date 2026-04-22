import type { UserRole } from "@/types";

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type MentorRoleRequest = {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  note?: string;
  status: VerificationStatus;
  createdAt: string;
  decidedAt?: string;
};

export type CompanyVerificationRequest = {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  companyName: string;
  taxCode?: string;
  address?: string;
  website?: string;
  note?: string;
  status: VerificationStatus;
  createdAt: string;
  decidedAt?: string;
};

const LS_KEYS = {
  mentorRequests: "labodc:mentorRoleRequests",
  companyRequests: "labodc:companyVerificationRequests",
  roleOverrides: "labodc:roleOverrides",
} as const;

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const nowIso = () => new Date().toISOString();

const ensureSeeded = () => {
  const mentorRaw = localStorage.getItem(LS_KEYS.mentorRequests);
  if (!mentorRaw) {
    const seeded: MentorRoleRequest[] = [
      {
        id: "mrq-001",
        userId: "demo-talent",
        email: "talent1@example.com",
        fullName: "Talent",
        note: "I have 2 years experience mentoring juniors.",
        status: "PENDING",
        createdAt: nowIso(),
      },
    ];
    localStorage.setItem(LS_KEYS.mentorRequests, JSON.stringify(seeded));
  }

  const companyRaw = localStorage.getItem(LS_KEYS.companyRequests);
  if (!companyRaw) {
    const seeded: CompanyVerificationRequest[] = [
      {
        id: "crq-001",
        userId: "demo-talent",
        email: "talent1@example.com",
        fullName: "Talent",
        companyName: "TechNova Co., Ltd (sample)",
        taxCode: "0102030405",
        address: "HCMC",
        website: "https://example.com",
        note: "Need enterprise account to create projects.",
        status: "PENDING",
        createdAt: nowIso(),
      },
    ];
    localStorage.setItem(LS_KEYS.companyRequests, JSON.stringify(seeded));
  }

  const roleOverridesRaw = localStorage.getItem(LS_KEYS.roleOverrides);
  if (!roleOverridesRaw) {
    localStorage.setItem(LS_KEYS.roleOverrides, JSON.stringify({}));
  }
};

const loadMentorRequests = (): MentorRoleRequest[] => {
  ensureSeeded();
  return safeParse<MentorRoleRequest[]>(
    localStorage.getItem(LS_KEYS.mentorRequests),
    []
  );
};

const saveMentorRequests = (items: MentorRoleRequest[]) => {
  localStorage.setItem(LS_KEYS.mentorRequests, JSON.stringify(items));
};

const loadCompanyRequests = (): CompanyVerificationRequest[] => {
  ensureSeeded();
  return safeParse<CompanyVerificationRequest[]>(
    localStorage.getItem(LS_KEYS.companyRequests),
    []
  );
};

const saveCompanyRequests = (items: CompanyVerificationRequest[]) => {
  localStorage.setItem(LS_KEYS.companyRequests, JSON.stringify(items));
};

const loadRoleOverrides = (): Record<string, UserRole> => {
  ensureSeeded();
  return safeParse<Record<string, UserRole>>(
    localStorage.getItem(LS_KEYS.roleOverrides),
    {}
  );
};

const saveRoleOverrides = (items: Record<string, UserRole>) => {
  localStorage.setItem(LS_KEYS.roleOverrides, JSON.stringify(items));
};

export const verificationService = {
  getRoleOverride(userId: string): UserRole | null {
    const map = loadRoleOverrides();
    return map[userId] || null;
  },

  setRoleOverride(userId: string, role: UserRole): void {
    const map = loadRoleOverrides();
    map[userId] = role;
    saveRoleOverrides(map);
  },

  // Mentor role approval flow (System Admin)
  listMentorRoleRequests(): MentorRoleRequest[] {
    return loadMentorRequests().sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt)
    );
  },

  submitMentorRoleRequest(payload: {
    userId: string;
    email: string;
    fullName: string;
    note?: string;
  }): MentorRoleRequest {
    const items = loadMentorRequests();
    const existingPending = items.find(
      (r) => r.userId === payload.userId && r.status === "PENDING"
    );
    if (existingPending) return existingPending;

    const req: MentorRoleRequest = {
      id: `mrq-${Date.now()}`,
      userId: payload.userId,
      email: payload.email,
      fullName: payload.fullName,
      note: payload.note,
      status: "PENDING",
      createdAt: nowIso(),
    };
    saveMentorRequests([req, ...items]);
    return req;
  },

  decideMentorRoleRequest(id: string, status: Exclude<VerificationStatus, "PENDING">): MentorRoleRequest | null {
    const items = loadMentorRequests();
    const idx = items.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const updated: MentorRoleRequest = {
      ...items[idx],
      status,
      decidedAt: nowIso(),
    };
    items[idx] = updated;
    saveMentorRequests(items);

    if (status === "APPROVED") {
      this.setRoleOverride(updated.userId, "MENTOR");
    }

    return updated;
  },

  // Company verification flow (User submits, Lab Admin approves)
  listCompanyVerificationRequests(): CompanyVerificationRequest[] {
    return loadCompanyRequests().sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt)
    );
  },

  submitCompanyVerificationRequest(payload: {
    userId: string;
    email: string;
    fullName: string;
    companyName: string;
    taxCode?: string;
    address?: string;
    website?: string;
    note?: string;
  }): CompanyVerificationRequest {
    const items = loadCompanyRequests();
    const existingPending = items.find(
      (r) => r.userId === payload.userId && r.status === "PENDING"
    );
    if (existingPending) return existingPending;

    const req: CompanyVerificationRequest = {
      id: `crq-${Date.now()}`,
      userId: payload.userId,
      email: payload.email,
      fullName: payload.fullName,
      companyName: payload.companyName,
      taxCode: payload.taxCode,
      address: payload.address,
      website: payload.website,
      note: payload.note,
      status: "PENDING",
      createdAt: nowIso(),
    };

    saveCompanyRequests([req, ...items]);
    return req;
  },

  decideCompanyVerificationRequest(id: string, status: Exclude<VerificationStatus, "PENDING">): CompanyVerificationRequest | null {
    const items = loadCompanyRequests();
    const idx = items.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const updated: CompanyVerificationRequest = {
      ...items[idx],
      status,
      decidedAt: nowIso(),
    };
    items[idx] = updated;
    saveCompanyRequests(items);

    if (status === "APPROVED") {
      this.setRoleOverride(updated.userId, "COMPANY");
    }

    return updated;
  },

  getMyCompanyRequest(userId: string): CompanyVerificationRequest | null {
    const items = loadCompanyRequests();
    return items.find((r) => r.userId === userId) || null;
  },
};
