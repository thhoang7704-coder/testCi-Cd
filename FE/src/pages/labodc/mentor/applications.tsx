import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Icon from "@/components/ui/Icon";

import { projectService } from "@/services/project.service";
import type { ProjectApplication } from "@/types";

const MentorApplications: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [applications, setApplications] = useState<ProjectApplication[]>([]);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selected, setSelected] = useState<ProjectApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pending = useMemo(
    () => applications.filter((a) => a.status === "PENDING"),
    [applications],
  );

  const loadApplications = async () => {
    try {
      setLoading(true);
      const list = await projectService.getMyPendingApplicationsAsMentor();
      // Endpoint only returns PENDING; keep defensive sort/filter.
      setApplications(list);
    } catch (e: any) {
      console.error(e);
      setApplications([]);
      toast.error(e?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const onApprove = async (app: ProjectApplication) => {
    try {
      setActionLoading(true);
      await projectService.approveApplicationAsMentor(app.id);
      toast.success("Talent approved into project");
      await loadApplications();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Approve failed");
    } finally {
      setActionLoading(false);
    }
  };

  const openReject = (app: ProjectApplication) => {
    setSelected(app);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const onReject = async () => {
    if (!selected) return;
    if (!rejectReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }

    try {
      setActionLoading(true);
      await projectService.rejectApplicationAsMentor(
        selected.id,
        rejectReason.trim(),
      );
      toast.success("Application rejected");
      setShowRejectModal(false);
      setSelected(null);
      await loadApplications();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Reject failed");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: "project_id",
      header: "Project",
      render: (_v: any, a: ProjectApplication) => (
        <div>
          <div className="font-medium text-gray-900">{a.project_id}</div>
          <div className="text-xs text-gray-500">Talent: {a.talent_id}</div>
        </div>
      ),
    },
    {
      key: "applied_at",
      header: "Applied",
      render: (v: Date) => (v ? new Date(v as any).toLocaleString() : "-"),
    },
    {
      key: "cover_letter",
      header: "Cover Letter",
      render: (v: string) => (
        <div className="max-w-md">
          <div className="text-sm text-gray-700 line-clamp-2">{v || "-"}</div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_: any, a: ProjectApplication) => (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(a)}
            disabled={actionLoading || a.status !== "PENDING"}
            className="inline-flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            <Icon icon="check" className="w-4 h-4" />
            <span className="text-sm font-medium">Approve</span>
          </button>
          <button
            onClick={() => openReject(a)}
            disabled={actionLoading || a.status !== "PENDING"}
            className="inline-flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Icon icon="close" className="w-4 h-4" />
            <span className="text-sm font-medium">Reject</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Talent Applications
          </h1>
          <p className="text-gray-600 mt-1">
            Approve talents into your project teams
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-200 rounded-full">
              <Icon icon="clock" className="w-6 h-6 text-yellow-700" />
            </div>
            <div>
              <div className="text-sm text-yellow-700">Pending</div>
              <div className="text-2xl font-bold text-yellow-900">
                {pending.length}
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-slate-200 rounded-full">
              <Icon
                icon="heroicons-outline:briefcase"
                className="w-6 h-6 text-slate-700"
              />
            </div>
            <div>
              <div className="text-sm text-slate-700">Showing</div>
              <div className="text-2xl font-bold text-slate-900">
                {applications.length}
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-200 rounded-full">
              <Icon
                icon="heroicons-outline:arrow-path"
                className="w-6 h-6 text-blue-700"
              />
            </div>
            <div>
              <div className="text-sm text-blue-700">Auto refresh</div>
              <div className="text-2xl font-bold text-blue-900">Manual</div>
            </div>
          </div>
        </Card>
      </div>

      <Card
        headerslot={
          <button
            onClick={loadApplications}
            disabled={loading}
            className="btn btn-sm btn-outline-dark"
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        }
      >
        <DataTable
          data={applications}
          columns={columns}
          loading={loading}
          emptyMessage="No pending applications"
        />
      </Card>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Reject Application
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Application
                </p>
                <p className="text-gray-600">{selected?.id}</p>
                <p className="text-gray-500 text-xs mt-1">
                  Project: {selected?.project_id}
                </p>
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Reason
                </label>
                <textarea
                  id="reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter rejection reason…"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelected(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={onReject}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Rejecting…" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorApplications;
