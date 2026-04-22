import React, { useCallback, useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import { toast } from "react-toastify";
import {
  talentService,
  type BackendTalentResponse,
} from "@/services/talent.service";
import { requireRoleFromToken } from "@/utils/auth";

const StudentsManagement: React.FC = () => {
  const [items, setItems] = useState<BackendTalentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const auth = requireRoleFromToken("LAB_ADMIN");
      if (!auth.ok) {
        toast.error(auth.reason);
        setItems([]);
        return;
      }
      const list =
        statusFilter === "ALL"
          ? await talentService.listAllTalents()
          : await talentService.listTalentsByStatus(statusFilter);
      setItems(list || []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load students list");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const total = useMemo(() => items.length, [items]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-600 mt-1">Lab Admin student directory</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
            <div className="text-sm text-gray-600">
              Total:{" "}
              <span className="font-semibold text-gray-900">{total}</span>
            </div>
          </div>
        </div>
      </div>

      <Card title="Student List">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">No students found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">Student Code</th>
                  <th className="py-2">Major</th>
                  <th className="py-2">Year</th>
                  <th className="py-2">GPA</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Talent ID</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="py-3 font-medium text-gray-900">
                      {t.studentCode || "-"}
                    </td>
                    <td className="py-3">{t.major || "-"}</td>
                    <td className="py-3">{t.year ?? "-"}</td>
                    <td className="py-3">{t.gpa ?? "-"}</td>
                    <td className="py-3">{t.status || "-"}</td>
                    <td className="py-3 text-gray-600">{t.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentsManagement;
