import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';

import ReportViewModal from '@/shared/components/ReportViewModal';

import { mentorService } from '@/services/mentor.service';
import { reportService, type BackendReportResponse, type ReportType } from '@/services/report.service';
import type { Project } from '@/types';

const REPORT_TYPES: ReportType[] = ['WEEKLY', 'MONTHLY', 'PHASE', 'FINAL', 'INCIDENT'];

const MentorReports: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const hasSession = Boolean(user);

  const [tab, setTab] = useState<'view' | 'send'>('view');
  const [viewType, setViewType] = useState<'mine' | 'all'>('mine');
  const [loading, setLoading] = useState(false);

  const [reports, setReports] = useState<BackendReportResponse[]>([]);
  const [allReports, setAllReports] = useState<BackendReportResponse[]>([]);
  const [selectedReport, setSelectedReport] = useState<BackendReportResponse | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId],
  );

  const [form, setForm] = useState({
    reportType: 'WEEKLY' as ReportType,
    title: '',
    content: '',
    reportPeriodStart: '',
    reportPeriodEnd: '',
    attachmentUrl: '',
  });
  const [pickedFileName, setPickedFileName] = useState<string>('');

  const loadMyReports = async () => {
    if (!hasSession) return;
    try {
      setLoading(true);
      const list = await reportService.getMyReportsCurrent();
      setReports(list);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load my reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllReports = async () => {
    if (!hasSession) return;
    try {
      const list = await reportService.getAllReports();
      setAllReports(list);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load all reports');
      setAllReports([]);
    }
  };

  const loadMyProjects = async () => {
    if (!hasSession) return;
    try {
      const mine = await mentorService.getMyAssignedProjects();
      setProjects(mine);
      if (!selectedProjectId && mine.length) setSelectedProjectId(mine[0].id);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load assigned projects');
      setProjects([]);
    }
  };

  useEffect(() => {
    loadMyReports();
    loadMyProjects();
    loadAllReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSession]);

  const onCreateDraft = async () => {
    if (!hasSession) {
      toast.error('Not logged in');
      return;
    }

    if (!selectedProjectId) {
      toast.error('Please select a project');
      return;
    }

    if (!form.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      setLoading(true);
      const created = await reportService.createMyReport({
        projectId: selectedProjectId,
        reportType: form.reportType,
        title: form.title.trim(),
        content: form.content?.trim() || undefined,
        reportPeriodStart: form.reportPeriodStart || undefined,
        reportPeriodEnd: form.reportPeriodEnd || undefined,
        attachmentUrl: form.attachmentUrl?.trim() || undefined,
      });
      toast.success('Report created (DRAFT)');
      setTab('view');
      await loadMyReports();
      return created;
    } catch (e: any) {
      toast.error(e?.message || 'Create report failed');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (reportId: string) => {
    try {
      setLoading(true);
      await reportService.submitReport(reportId);
      toast.success('Report submitted');
      await loadMyReports();
    } catch (e: any) {
      toast.error(e?.message || 'Submit failed');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Project Reports</h1>
          <p className="mt-1 text-sm text-gray-600">View your reports and submit new ones.</p>
        </div>
        <div className="text-sm text-gray-500">Logged in as: {user?.role}</div>
      </div>

      <div className="flex gap-2">
        <Button text="View" className={tab === 'view' ? '' : 'btn-outline'} onClick={() => setTab('view')} />
        <Button text="Send" className={tab === 'send' ? '' : 'btn-outline'} onClick={() => setTab('send')} />
      </div>

      {tab === 'view' ? (
        <>
          <div className="flex gap-2">
            <Button text="My reports" className={viewType === 'mine' ? '' : 'btn-outline'} onClick={() => setViewType('mine')} />
            <Button text="All reports" className={viewType === 'all' ? '' : 'btn-outline'} onClick={() => setViewType('all')} />
          </div>

          <Card title={viewType === 'mine' ? 'My reports' : 'All reports'}>
            {loading ? (
              <div className="text-sm text-gray-600">Loading…</div>
            ) : (viewType === 'mine' ? reports : allReports).length === 0 ? (
              <div className="text-sm text-gray-600">No reports yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 pr-3">Title</th>
                      <th className="py-2 pr-3">Type</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Project</th>
                      <th className="py-2 pr-3">Created</th>
                      <th className="py-2 pr-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewType === 'mine' ? reports : allReports).map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2 pr-3 font-medium text-gray-900">{r.title}</td>
                      <td className="py-2 pr-3">{String(r.reportType || '')}</td>
                      <td className="py-2 pr-3"><StatusBadge status={String(r.status || '')} /></td>
                      <td className="py-2 pr-3">{r.projectId || '—'}</td>
                      <td className="py-2 pr-3">{r.createdAt ? String(r.createdAt).slice(0, 10) : '—'}</td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <Button
                            text="View"
                            className="btn-outline"
                            onClick={() => openView(r)}
                            disabled={loading}
                          />
                          <Button
                            text="Submit"
                            className="btn-outline"
                            onClick={() => onSubmit(r.id)}
                            disabled={loading || String(r.status || '') !== 'DRAFT'}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        </>
      ) : (
        <Card title="Send report">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                className="form-control w-full"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="">Select a project…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.project_name}</option>
                ))}
              </select>
              {selectedProject ? (
                <div className="mt-1 text-xs text-gray-500">Project ID: {selectedProject.id}</div>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report type</label>
              <select
                className="form-control w-full"
                value={form.reportType}
                onChange={(e) => setForm((s) => ({ ...s, reportType: e.target.value as ReportType }))}
              >
                {REPORT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                className="form-control w-full"
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                className="form-control w-full"
                rows={5}
                value={form.content}
                onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period start (YYYY-MM-DD)</label>
              <input
                className="form-control w-full"
                value={form.reportPeriodStart}
                onChange={(e) => setForm((s) => ({ ...s, reportPeriodStart: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period end (YYYY-MM-DD)</label>
              <input
                className="form-control w-full"
                value={form.reportPeriodEnd}
                onChange={(e) => setForm((s) => ({ ...s, reportPeriodEnd: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <input
                    type="file"
                    className="form-control w-full"
                    onChange={(e) => setPickedFileName(e.target.files?.[0]?.name || '')}
                  />
                  <div className="mt-1 text-xs text-gray-500">Selected: {pickedFileName || '—'} (upload not supported by BE; use URL)</div>
                </div>
                <div>
                  <input
                    className="form-control w-full"
                    value={form.attachmentUrl}
                    onChange={(e) => setForm((s) => ({ ...s, attachmentUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <Button text={loading ? 'Sending…' : 'Create (DRAFT)'} onClick={onCreateDraft} disabled={loading || !selectedProjectId || !hasSession} />
              <Button text="Reload" className="btn-outline" onClick={loadMyReports} disabled={loading || !hasSession} />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MentorReports;
