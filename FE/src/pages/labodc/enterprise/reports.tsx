import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';

import ReportViewModal from '@/shared/components/ReportViewModal';

import { companyService } from '@/services/company.service';
import { projectService } from '@/services/project.service';
import { reportService, type BackendReportResponse } from '@/services/report.service';
import type { Project } from '@/types';

const EnterpriseReports: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [viewType, setViewType] = useState<'project' | 'all'>('project');

  const [reports, setReports] = useState<BackendReportResponse[]>([]);
  const [allReports, setAllReports] = useState<BackendReportResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedReport, setSelectedReport] = useState<BackendReportResponse | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId],
  );

  const loadMyProjects = async () => {
    try {
      setLoading(true);
      const myCompany = await companyService.getMyCompany();
      const all = await projectService.listAllProjectsFromBackend();
      const mine = all.filter((p) => String(p.company_id) === String(myCompany.id));
      setProjects(mine);
      if (!selectedProjectId && mine.length) setSelectedProjectId(mine[0].id);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async (projectId: string) => {
    if (!projectId) {
      setReports([]);
      return;
    }

    try {
      setLoading(true);
      const list = await reportService.getReportsByProject(projectId);
      setReports(list);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllReports = async () => {
    try {
      const list = await reportService.getAllReports();
      setAllReports(list);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load all reports');
      setAllReports([]);
    }
  };

  useEffect(() => {
    void loadMyProjects();
    void loadAllReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadReports(selectedProjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const openView = (report: BackendReportResponse) => {
    setSelectedReport(report);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <ReportViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        report={selectedReport}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-600">View reports by project.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button text="Project reports" className={viewType === 'project' ? '' : 'btn-outline'} onClick={() => setViewType('project')} />
        <Button text="All reports" className={viewType === 'all' ? '' : 'btn-outline'} onClick={() => setViewType('all')} />
      </div>

      {viewType === 'project' && (
        <Card title="Project">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select project</label>
            <select
              className="form-control w-full"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={projects.length === 0}
            >
              {projects.length === 0 ? (
                <option value="">No projects</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="md:col-span-2 text-sm text-gray-600">
            <div>Mentor ID: {selectedProject?.mentor_id || '—'}</div>
            <div>
              Status: <StatusBadge status={String(selectedProject?.status || '—')} />
            </div>
          </div>
        </div>
      </Card>
      )}

      <Card title={viewType === 'project' ? 'Project Reports' : 'All Reports'}>
        {loading ? (
          <div className="text-sm text-gray-600">Loading…</div>
        ) : (viewType === 'project' ? reports : allReports).length === 0 ? (
          <div className="text-sm text-gray-600">{viewType === 'project' ? 'No reports found for this project.' : 'No reports found.'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Created</th>
                  <th className="py-2 pr-3">Submitted</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(viewType === 'project' ? reports : allReports).map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2 pr-3 font-medium text-gray-900">{r.title}</td>
                    <td className="py-2 pr-3">{String(r.reportType || '')}</td>
                    <td className="py-2 pr-3"><StatusBadge status={String(r.status || '')} /></td>
                    <td className="py-2 pr-3">{r.createdAt ? String(r.createdAt).slice(0, 10) : '—'}</td>
                    <td className="py-2 pr-3">{r.submittedDate || '—'}</td>
                    <td className="py-2 pr-3">
                      <Button
                        text="View"
                        className="btn-outline"
                        onClick={() => openView(r)}
                        disabled={loading}
                      />
                    </td>
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

export default EnterpriseReports;

