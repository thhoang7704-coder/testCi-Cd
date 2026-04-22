import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/shared/components/Modal';

import { reportService, type BackendReportResponse, type ReportStatus, type ReportType } from '@/services/report.service';
import { projectService } from '@/services/project.service';
import type { Project } from '@/types';

const REVIEW_STATUSES: ReportStatus[] = ['APPROVED', 'REJECTED', 'REVISION_NEEDED'];

const backendBaseUrl = (): string => {
  const envBase = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envBase) return String(envBase).replace(/\/+$/, '');
  if ((import.meta as any).env?.DEV) return 'http://localhost:8082';
  return window.location.origin;
};

const resolveAttachmentUrl = (maybeUrl: string): string => {
  const raw = String(maybeUrl || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = backendBaseUrl();
  if (raw.startsWith('/')) return `${base}${raw}`;
  return `${base}/${raw}`;
};

const LabAdminReports: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);

  const [tab, setTab] = useState<'view' | 'review' | 'send'>('view');
  const [reports, setReports] = useState<BackendReportResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [sendForm, setSendForm] = useState({
    projectId: '',
    title: '',
    content: '',
    attachmentUrl: '',
    submitAfterCreate: false,
  });

  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const selectedReport = useMemo(
    () => reports.find((r) => r.id === selectedReportId),
    [reports, selectedReportId],
  );

  const [review, setReview] = useState({
    status: 'APPROVED' as ReportStatus,
    notes: '',
  });

  const [isViewOpen, setIsViewOpen] = useState(false);
  const openView = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsViewOpen(true);
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      const list = await reportService.getAllReports();
      setReports(list);
      if (!selectedReportId && list.length) setSelectedReportId(list[0].id);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProjectsOnce = async () => {
    if (projectsLoaded) return;
    try {
      const list = await projectService.listAllProjectsFromBackend();
      setProjects(list);
      setProjectsLoaded(true);
      if (!sendForm.projectId && list.length) {
        setSendForm((s) => ({ ...s, projectId: String(list[0].id) }));
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load projects');
      setProjects([]);
      setProjectsLoaded(true);
    }
  };

  const onReview = async () => {
    if (!selectedReportId) {
      toast.error('Please select a report');
      return;
    }

    if (!user?.id) {
      toast.error('Missing admin id');
      return;
    }

    try {
      setLoading(true);
      await reportService.reviewReport({
        reportId: selectedReportId,
        adminId: String(user.id),
        status: review.status,
        notes: review.notes?.trim() || undefined,
      });
      toast.success('Review saved');
      await loadAll();
      setTab('view');
    } catch (e: any) {
      toast.error(e?.message || 'Review failed');
    } finally {
      setLoading(false);
    }
  };

  const onSend = async () => {
    const project = projects.find((p) => String(p.id) === String(sendForm.projectId));
    const mentorId = project?.mentor_id;

    if (!project) {
      toast.error('Please select a project');
      return;
    }
    if (!mentorId) {
      toast.error('Selected project has no mentor assigned');
      return;
    }
    if (!sendForm.title.trim() || !sendForm.content.trim()) {
      toast.error('Please enter title and content');
      return;
    }

    try {
      setLoading(true);
      const created = await reportService.createReport(String(mentorId), {
        projectId: String(project.id),
        title: sendForm.title.trim(),
        content: sendForm.content.trim(),
        reportType: 'GENERAL' as ReportType,
        attachmentUrl: sendForm.attachmentUrl.trim() || undefined,
      });

      if (sendForm.submitAfterCreate) {
        await reportService.submitReport(String(created.id));
      }

      toast.success(sendForm.submitAfterCreate ? 'Report created and submitted' : 'Report created');
      setSendForm((s) => ({ ...s, title: '', content: '', attachmentUrl: '' }));
      await loadAll();
      setTab('view');
    } catch (e: any) {
      toast.error(e?.message || 'Send report failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-600">Review mentor reports, or create a report by project for company viewing.</p>
        </div>
        <div className="text-sm text-gray-500">Logged in as: {user?.role}</div>
      </div>

      <div className="flex gap-2">
        <Button text="View reports" className={tab === 'view' ? '' : 'btn-outline'} onClick={() => setTab('view')} />
        <Button text="Review report" className={tab === 'review' ? '' : 'btn-outline'} onClick={() => setTab('review')} />
        <Button
          text="Send report"
          className={tab === 'send' ? '' : 'btn-outline'}
          onClick={() => {
            setTab('send');
            void loadProjectsOnce();
          }}
        />
      </div>

      {tab !== 'send' && (
        <Card title="Select report">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <select
                className="form-control w-full"
                value={selectedReportId}
                onChange={(e) => setSelectedReportId(e.target.value)}
                disabled={reports.length === 0}
              >
                {reports.length === 0 ? (
                  <option value="">No reports</option>
                ) : (
                  reports.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({String(r.status || '')})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="text-sm text-gray-600">
              <div>Status: <StatusBadge status={String(selectedReport?.status || '—')} /></div>
              <div>Project: {selectedReport?.projectId || '—'}</div>
              <div>Mentor: {selectedReport?.mentorId || '—'}</div>
            </div>
          </div>
        </Card>
      )}

      {tab === 'view' ? (
        <Card title="All reports">
          {loading ? (
            <div className="text-sm text-gray-600">Loading…</div>
          ) : reports.length === 0 ? (
            <div className="text-sm text-gray-600">No reports found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-3">Title</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Project</th>
                    <th className="py-2 pr-3">Mentor</th>
                    <th className="py-2 pr-3">Created</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2 pr-3 font-medium text-gray-900">{r.title}</td>
                      <td className="py-2 pr-3">{String(r.reportType || '')}</td>
                      <td className="py-2 pr-3"><StatusBadge status={String(r.status || '')} /></td>
                      <td className="py-2 pr-3">{r.projectId || '—'}</td>
                      <td className="py-2 pr-3">{r.mentorId || '—'}</td>
                      <td className="py-2 pr-3">{r.createdAt ? String(r.createdAt).slice(0, 10) : '—'}</td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <Button
                            text="View"
                            className="btn-outline"
                            onClick={() => openView(String(r.id))}
                            disabled={loading}
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
      ) : tab === 'review' ? (
        <Card title="Review">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New status</label>
              <select
                className="form-control w-full"
                value={review.status}
                onChange={(e) => setReview((s) => ({ ...s, status: e.target.value as ReportStatus }))}
              >
                {REVIEW_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                className="form-control w-full"
                rows={5}
                value={review.notes}
                onChange={(e) => setReview((s) => ({ ...s, notes: e.target.value }))}
                placeholder="Optional review notes…"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <Button text={loading ? 'Saving…' : 'Save review'} onClick={onReview} disabled={loading || !selectedReportId} />
              <Button text="Reload" className="btn-outline" onClick={loadAll} disabled={loading} />
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Send report">
          {!projectsLoaded && loading ? (
            <div className="text-sm text-gray-600">Loading projects…</div>
          ) : null}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                className="form-control w-full"
                value={sendForm.projectId}
                onChange={(e) => setSendForm((s) => ({ ...s, projectId: e.target.value }))}
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.project_name || `Project ${p.id}`}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-xs text-gray-500">Company will view this report via the project reports screen.</div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                className="form-control w-full"
                value={sendForm.title}
                onChange={(e) => setSendForm((s) => ({ ...s, title: e.target.value }))}
                placeholder="Enter report title"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                className="form-control w-full"
                rows={6}
                value={sendForm.content}
                onChange={(e) => setSendForm((s) => ({ ...s, content: e.target.value }))}
                placeholder="Enter report content…"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment URL (optional)</label>
              <input
                className="form-control w-full"
                value={sendForm.attachmentUrl}
                onChange={(e) => setSendForm((s) => ({ ...s, attachmentUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={sendForm.submitAfterCreate}
                  onChange={(e) => setSendForm((s) => ({ ...s, submitAfterCreate: e.target.checked }))}
                />
                Submit immediately
              </label>
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <Button text={loading ? 'Sending…' : 'Send'} onClick={onSend} disabled={loading} />
              <Button
                text="Clear"
                className="btn-outline"
                onClick={() => setSendForm((s) => ({ ...s, title: '', content: '', attachmentUrl: '' }))}
                disabled={loading}
              />
            </div>
          </div>
        </Card>
      )}

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Report details"
        size="lg"
      >
        {!selectedReport ? (
          <div className="text-sm text-gray-600">No report selected.</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Title</div>
                <div className="font-medium text-gray-900">{selectedReport.title}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="mt-1"><StatusBadge status={String(selectedReport.status || '')} /></div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Type</div>
                <div className="text-gray-900">{String(selectedReport.reportType || '—')}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Created</div>
                <div className="text-gray-900">{selectedReport.createdAt ? String(selectedReport.createdAt).slice(0, 19) : '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Project</div>
                <div className="text-gray-900">{selectedReport.projectId || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Mentor</div>
                <div className="text-gray-900">{selectedReport.mentorId || '—'}</div>
              </div>
            </div>

            {selectedReport.content ? (
              <div>
                <div className="text-xs text-gray-500">Content</div>
                <div className="mt-1 whitespace-pre-wrap text-sm text-gray-900 border rounded p-3 bg-gray-50">
                  {selectedReport.content}
                </div>
              </div>
            ) : null}

            <div>
              <div className="text-xs text-gray-500">Attachment</div>
              {selectedReport.attachmentUrl ? (
                <div className="mt-2 flex flex-col gap-2">
                  <a
                    className="text-sm text-blue-600 hover:underline break-all"
                    href={resolveAttachmentUrl(selectedReport.attachmentUrl)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {resolveAttachmentUrl(selectedReport.attachmentUrl)}
                  </a>
                  <div className="flex items-center gap-2">
                    <Button
                      text="Open"
                      className="btn-outline"
                      onClick={() => {
                        const url = resolveAttachmentUrl(selectedReport.attachmentUrl || '');
                        if (!url) return;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                    />
                    <Button
                      text="Download"
                      className="btn-outline"
                      onClick={() => {
                        const url = resolveAttachmentUrl(selectedReport.attachmentUrl || '');
                        if (!url) return;
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = '';
                        link.rel = 'noreferrer';
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                      }}
                    />
                    <Button
                      text="Copy link"
                      className="btn-outline"
                      onClick={async () => {
                        const url = resolveAttachmentUrl(selectedReport.attachmentUrl || '');
                        if (!url) return;
                        try {
                          await navigator.clipboard.writeText(url);
                          toast.success('Copied');
                        } catch {
                          toast.error('Copy failed');
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-1 text-sm text-gray-600">No attachment</div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LabAdminReports;
