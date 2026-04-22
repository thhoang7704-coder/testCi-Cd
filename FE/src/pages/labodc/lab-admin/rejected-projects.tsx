import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import { toast } from 'react-toastify';
import { projectService } from '@/services/project.service';
import type { Project } from '@/types';
import { requireRoleFromToken } from '@/utils/auth';

const RejectedProjects: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const auth = requireRoleFromToken('LAB_ADMIN');
      if (!auth.ok) {
        toast.error(auth.reason);
        setProjects([]);
        return;
      }

      const list = await projectService.listAllProjectsFromBackend();
      const rejected = (list || []).filter((p: any) => String(p?.validation_status || '').toUpperCase() === 'REJECTED');
      setProjects(rejected);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load rejected projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const total = useMemo(() => projects.length, [projects]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rejected Projects</h1>
            <p className="text-gray-600 mt-1">Projects that were rejected during validation</p>
          </div>
          <div className="text-sm text-gray-600">Total: <span className="font-semibold text-gray-900">{total}</span></div>
        </div>
      </div>

      <Card title="Project List">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-gray-500">No rejected projects found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">Project</th>
                  <th className="py-2">Company ID</th>
                  <th className="py-2">Budget</th>
                  <th className="py-2">Validation Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p: any) => (
                  <tr key={p.id} className="border-t">
                    <td className="py-3 font-medium text-gray-900">{p.project_name || p.projectName || p.id}</td>
                    <td className="py-3">{p.company_id || p.companyId || '-'}</td>
                    <td className="py-3">{typeof p.budget === 'number' ? `$${p.budget.toLocaleString()}` : '-'}</td>
                    <td className="py-3">{String(p.validation_status || '').toUpperCase() || '-'}</td>
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

export default RejectedProjects;
