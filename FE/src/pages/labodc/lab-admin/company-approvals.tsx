import React, { useCallback, useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { companyService, type BackendCompanyResponse } from "@/services/company.service";

const statusPill = (status: string | undefined) => {
  const base = "inline-flex items-center px-2 py-1 rounded text-xs font-medium";
  if (status === "PENDING") return `${base} bg-yellow-100 text-yellow-800`;
  if (status === "APPROVED") return `${base} bg-green-100 text-green-800`;
  return `${base} bg-red-100 text-red-800`;
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

const getAuthToken = (): string | null => {
  return localStorage.getItem("token") || localStorage.getItem("access_token");
};

const getLabAdminIdForRequest = (user: any): string => {
  // BE approve/reject currently only logs labAdminId, but controller requires it.
  // Prefer a stable identifier if present.
  if (user?.id) return String(user.id);
  if (user?.userId) return String(user.userId);
  if (user?.username) return String(user.username);
  if (user?.email) return String(user.email);

  const token = getAuthToken();
  const payload = token ? decodeJwtPayload(token) : null;
  return String(payload?.sub || payload?.subject || "lab-admin");
};

const CompanyApprovals: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [items, setItems] = useState<BackendCompanyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyService.listPendingCompanies();
      setItems(data || []);
    } catch (e: any) {
      const msg = e?.message || "Failed to load pending companies";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshKey;
    void load();
  }, [load, refreshKey]);

  const pendingCount = useMemo(
    () => items.filter((r) => (r.status || "").toUpperCase() === "PENDING").length,
    [items],
  );

  const approve = async (companyId: string) => {
    const labAdminId = getLabAdminIdForRequest(user);
    const ok = window.confirm("Approve this company?");
    if (!ok) return;
    try {
      await companyService.approveCompany(companyId, labAdminId);
      toast.success("Company approved");
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      toast.error(e?.message || "Approve failed");
    }
  };

  const reject = async (companyId: string) => {
    const labAdminId = getLabAdminIdForRequest(user);
    const reason = window.prompt("Enter rejection reason", "Missing information");
    if (reason === null) return; // cancelled
    const trimmed = reason.trim();
    if (!trimmed) {
      toast.error("Please enter a rejection reason");
      return;
    }
    try {
      await companyService.rejectCompany(companyId, trimmed, labAdminId);
      toast.success("Company rejected");
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      toast.error(e?.message || "Reject failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Approvals</h1>
            <p className="text-gray-600 mt-1">Review company verification requests</p>
          </div>
          <div className="text-sm text-gray-600">
            Pending: <span className="font-semibold text-gray-900">{pendingCount}</span>
          </div>
        </div>
      </div>

      <Card title="Requests">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">No requests yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((r) => (
              <div key={r.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-gray-900">{r.companyName}</div>
                      <span className={statusPill(r.status)}>{r.status || "PENDING"}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Submitted: {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                    </div>

                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                      {r.taxCode ? <div>Tax code: {r.taxCode}</div> : null}
                      {r.website ? <div>Website: {r.website}</div> : null}
                      {r.address ? <div className="md:col-span-2">Address: {r.address}</div> : null}
                      {r.description ? <div className="md:col-span-2">Description: {r.description}</div> : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
            <button
              type="button"
              className={`btn inline-flex justify-center bg-green-600 text-white text-xs ${
                (r.status || "PENDING") !== "PENDING" ? "opacity-40 cursor-not-allowed" : ""
              }`}
              disabled={(r.status || "PENDING") !== "PENDING"}
              onClick={() => approve(r.id)}
            >
              Approve
            </button>
            <button
              type="button"
              className={`btn inline-flex justify-center bg-red-600 text-white text-xs ${
                (r.status || "PENDING") !== "PENDING" ? "opacity-40 cursor-not-allowed" : ""
              }`}
              disabled={(r.status || "PENDING") !== "PENDING"}
              onClick={() => reject(r.id)}
            >
              Reject
            </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Notes">
        <div className="text-sm text-gray-700 space-y-2">
          <div>
            Approve/Reject sẽ gọi API BE và cập nhật trạng thái công ty.
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CompanyApprovals;
