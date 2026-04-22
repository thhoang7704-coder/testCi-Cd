import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Card from "@/components/ui/Card";
import { toast } from "react-toastify";
import {
  companyService,
  type BackendCompanyCreateRequest,
  type BackendCompanyResponse,
  type BackendCompanySize,
} from "@/services/company.service";

const getAuthToken = (): string | null => {
  return localStorage.getItem("token") || localStorage.getItem("access_token");
};

const decodeJwtPayload = (token: string): any => {
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
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const tokenHasUserRole = (token: string): boolean => {
  const payload = decodeJwtPayload(token) || {};
  const rolesRaw: string[] = Array.isArray(payload.roles)
    ? payload.roles.map((v: unknown) => String(v))
    : [];
  const roles = rolesRaw.map((r: string) =>
    r.replace(/^ROLE_/, "").toUpperCase(),
  );
  return roles.includes("USER") || roles.includes("SYSTEM_ADMIN");
};

const normalizeCompanySize = (
  value: BackendCompanySize | "" | string,
): BackendCompanySize | undefined => {
  const v = String(value || "").trim();
  if (!v) return undefined;

  const enumValues: BackendCompanySize[] = [
    "ONE_TO_10",
    "ELEVEN_TO_50",
    "FIFTYONE_TO_200",
    "TWOZEROONE_TO_500",
    "FIVE_HUNDRED_PLUS",
  ];
  if ((enumValues as string[]).includes(v)) return v as BackendCompanySize;

  const mapped: Record<string, BackendCompanySize> = {
    "1-10": "ONE_TO_10",
    "1 - 10": "ONE_TO_10",
    "11-50": "ELEVEN_TO_50",
    "11 - 50": "ELEVEN_TO_50",
    "51-200": "FIFTYONE_TO_200",
    "51 - 200": "FIFTYONE_TO_200",
    "201-500": "TWOZEROONE_TO_500",
    "201 - 500": "TWOZEROONE_TO_500",
    "500+": "FIVE_HUNDRED_PLUS",
    "500 +": "FIVE_HUNDRED_PLUS",
  };
  return mapped[v];
};

const storageKeyForUser = (userId: string) => `company_registration:${userId}`;

type InputFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (value: string) => void;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}) => {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[48px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-slate-900 dark:text-slate-100"
      />
    </label>
  );
};

const CompanyVerification: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [address, setAddress] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [companySize, setCompanySize] = useState<BackendCompanySize | "">("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const myRequest = useMemo<BackendCompanyResponse | null>(() => {
    void refreshKey;
    if (!user?.id) return null;
    const raw = localStorage.getItem(storageKeyForUser(user.id));
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [refreshKey, user?.id]);

  const statusLabel = myRequest?.status || "NONE";

  const submit = async () => {
    if (!user?.id) return;

    const token = getAuthToken();
    if (!token) {
      toast.error("Please sign in to submit a company registration.");
      return;
    }
    if (!tokenHasUserRole(token)) {
      toast.error(
        "Your account must have the USER role to register a company.",
      );
      return;
    }

    if ((import.meta as any).env?.DEV) {
      // If token doesn't contain 2 dots, it's not a JWT (often a demo token).
      const tokenLooksLikeJwt = token.split(".").length === 3;
      console.debug("[company-verification] submit", {
        tokenLooksLikeJwt,
        tokenPrefix: token.slice(0, 12),
      });
    }

    if (!companyName.trim()) {
      toast.error("Please enter Company Name.");
      return;
    }
    if (!taxCode.trim()) {
      toast.error("Please enter Tax Code.");
      return;
    }

    const payload: BackendCompanyCreateRequest = {
      companyName: companyName.trim(),
      taxCode: taxCode.trim(),
      address: address.trim() || undefined,
      industry: industry.trim() || undefined,
      website: website.trim() || undefined,
      description: description.trim() || undefined,
      companySize: normalizeCompanySize(companySize),
    };

    if ((import.meta as any).env?.DEV) {
      console.debug("[company-verification] payload", payload);
    }

    try {
      setSubmitting(true);
      const created = await companyService.registerCompanyProfile(payload);
      localStorage.setItem(storageKeyForUser(user.id), JSON.stringify(created));
      toast.success("Company registration submitted.");

      setCompanyName("");
      setTaxCode("");
      setAddress("");
      setIndustry("");
      setWebsite("");
      setCompanySize("");
      setDescription("");
      setNote("");
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <Card title="Company Verification">
          <div className="text-gray-600">Please login first.</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Register as a Company
        </h1>
        <p className="text-gray-600 mt-1">
          Submit your company information for Lab Admin approval
        </p>
      </div>

      <Card title="Current Status">
        <div className="text-sm text-gray-700">
          Status: <span className="font-semibold">{statusLabel}</span>
        </div>
        {myRequest ? (
          <div className="mt-3 text-sm text-gray-700 space-y-1">
            <div>
              Company:{" "}
              <span className="font-semibold">{myRequest.companyName}</span>
            </div>
            {myRequest.taxCode ? (
              <div>Tax code: {myRequest.taxCode}</div>
            ) : null}
            {myRequest.createdAt ? (
              <div>
                Submitted: {new Date(myRequest.createdAt).toLocaleString()}
              </div>
            ) : null}
            {myRequest.rejectionReason ? (
              <div>Rejection: {myRequest.rejectionReason}</div>
            ) : null}
          </div>
        ) : (
          <div className="mt-2 text-gray-500 text-sm">
            No request submitted yet.
          </div>
        )}
      </Card>

      <Card title="Submit Company Verification">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Company Name"
            placeholder="e.g. TechNova Co., Ltd"
            value={companyName}
            onChange={setCompanyName}
          />
          <InputField
            label="Tax Code"
            placeholder="e.g. 0123456789"
            value={taxCode}
            onChange={setTaxCode}
          />
          <InputField
            label="Address (optional)"
            placeholder="Address"
            value={address}
            onChange={setAddress}
          />
          <InputField
            label="Industry (optional)"
            placeholder="e.g. Technology"
            value={industry}
            onChange={setIndustry}
          />
          <InputField
            label="Website (optional)"
            placeholder="https://..."
            value={website}
            onChange={setWebsite}
          />
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Company Size (optional)
            </span>
            <select
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value as any)}
              className="w-full h-[48px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select...</option>
              <option value="ONE_TO_10">1-10</option>
              <option value="ELEVEN_TO_50">11-50</option>
              <option value="FIFTYONE_TO_200">51-200</option>
              <option value="TWOZEROONE_TO_500">201-500</option>
              <option value="FIVE_HUNDRED_PLUS">500+</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Description (optional)
            </span>
            <textarea
              value={description}
              placeholder="Describe your company"
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Note (optional)
            </span>
            <textarea
              value={note}
              placeholder="Any additional info"
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            className={`btn inline-flex justify-center bg-primary-600 text-white ${
              !companyName.trim() ||
              !taxCode.trim() ||
              myRequest?.status === "PENDING" ||
              submitting
                ? "opacity-40 cursor-not-allowed"
                : ""
            }`}
            disabled={
              !companyName.trim() ||
              !taxCode.trim() ||
              myRequest?.status === "PENDING" ||
              submitting
            }
            onClick={submit}
          >
            {myRequest?.status === "PENDING"
              ? "Request Submitted (Pending)"
              : submitting
                ? "Submitting..."
                : "Submit Request"}
          </button>
          <div className="text-xs text-gray-500">
            Lab Admin will review your request in “Company Approvals”.
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CompanyVerification;
