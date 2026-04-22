import React, { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import { verificationService, type MentorRoleRequest } from "@/services/verification.service";

const statusPill = (status: MentorRoleRequest["status"]) => {
  const base = "inline-flex items-center px-2 py-1 rounded text-xs font-medium";
  if (status === "PENDING") return `${base} bg-yellow-100 text-yellow-800`;
  if (status === "APPROVED") return `${base} bg-green-100 text-green-800`;
  return `${base} bg-red-100 text-red-800`;
};

const MentorRoleRequests: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const requests = useMemo(() => {
    void refreshKey;
    return verificationService.listMentorRoleRequests();
  }, [refreshKey]);

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  const decide = (id: string, status: "APPROVED" | "REJECTED") => {
    verificationService.decideMentorRoleRequest(id, status);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentor Role Requests</h1>
            <p className="text-gray-600 mt-1">Confirm whether users can become mentors</p>
          </div>
          <div className="text-sm text-gray-600">
            Pending: <span className="font-semibold text-gray-900">{pendingCount}</span>
          </div>
        </div>
      </div>

      <Card title="Requests">
        {requests.length === 0 ? (
          <div className="text-gray-500">No requests yet.</div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-gray-900">{r.fullName}</div>
                      <span className={statusPill(r.status)}>{r.status}</span>
                    </div>
                    <div className="text-sm text-gray-600">{r.email}</div>
                    <div className="text-xs text-gray-500 mt-1">Requested: {new Date(r.createdAt).toLocaleString()}</div>
                    {r.note ? (
                      <div className="text-sm text-gray-700 mt-2">Note: {r.note}</div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
            <button
              type="button"
              className={`btn inline-flex justify-center bg-green-600 text-white text-xs ${
                r.status !== "PENDING" ? "opacity-40 cursor-not-allowed" : ""
              }`}
              disabled={r.status !== "PENDING"}
              onClick={() => decide(r.id, "APPROVED")}
            >
              Approve
            </button>
            <button
              type="button"
              className={`btn inline-flex justify-center bg-red-600 text-white text-xs ${
                r.status !== "PENDING" ? "opacity-40 cursor-not-allowed" : ""
              }`}
              disabled={r.status !== "PENDING"}
              onClick={() => decide(r.id, "REJECTED")}
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
            Approving a request will update the user role to <span className="font-semibold">MENTOR</span> (FE-only via localStorage).
          </div>
          <div>
            This is a frontend demo workflow until backend endpoints are available.
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MentorRoleRequests;
