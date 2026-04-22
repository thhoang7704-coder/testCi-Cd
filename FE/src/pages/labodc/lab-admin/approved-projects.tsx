import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import { toast } from 'react-toastify';
import { projectService } from '@/services/project.service';
import type { Project } from '@/types';
import { requireRoleFromToken } from '@/utils/auth';

const ApprovedProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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
      setProjects(list || []);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const approved = useMemo(
    () => projects.filter((p) => String(p.validation_status || '').toUpperCase() === 'APPROVED'),
    [projects],
  );

  const columns = [
    {
      key: 'project_name',
      header: 'Project',
      render: (value: string, item: Project) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">Company: {item.company_id || '-'}</div>
        </div>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (value: number) => <span className="font-semibold text-blue-600">${Number(value || 0).toLocaleString()}</span>,
    },
    {
      key: 'duration_months',
      header: 'Duration',
      render: (value: number) => `${value} months`,
    },
    {
      key: 'validated_at',
      header: 'Validated At',
      render: (value: any) => (value ? new Date(value).toLocaleString() : '-'),
    },
    {
      key: 'validated_by',
      header: 'Validated By',
      render: (value: any) => value || '-',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Approved Projects</h1>
            <p className="text-gray-600 mt-1">Projects already approved by Lab Admin</p>
          </div>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold text-gray-900">{approved.length}</span>
          </div>
        </div>
      </div>

      <Card>
        <DataTable
          data={approved}
          columns={columns}
          loading={loading}
          emptyMessage="No approved projects"
        />
      </Card>
    </div>
  );
};

export default ApprovedProjects;
