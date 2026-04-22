import React, { useMemo } from 'react';

import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/shared/components/Modal';

import {
  resolveReportAttachmentUrl,
  type BackendReportResponse,
} from '@/services/report.service';

export type ReportViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  report?: BackendReportResponse | null;
};

const downloadFromUrl = (url: string) => {
  const link = document.createElement('a');
  link.href = url;
  // Best-effort: browsers may ignore this cross-origin.
  link.download = '';
  link.rel = 'noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const ReportViewModal: React.FC<ReportViewModalProps> = ({ isOpen, onClose, report }) => {
  const attachmentUrl = useMemo(
    () => resolveReportAttachmentUrl(report?.attachmentUrl || ''),
    [report?.attachmentUrl],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report details" size="lg">
      {!report ? (
        <div className="text-sm text-gray-600">No report selected.</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Title</div>
              <div className="font-medium text-gray-900">{report.title || '—'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Status</div>
              <div>
                <StatusBadge status={String(report.status || '—')} />
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Type</div>
              <div className="text-gray-900">{String(report.reportType || '—')}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Project</div>
              <div className="text-gray-900">{report.projectId || '—'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Mentor</div>
              <div className="text-gray-900">{report.mentorId || '—'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Period</div>
              <div className="text-gray-900">
                {report.reportPeriodStart || '—'} → {report.reportPeriodEnd || '—'}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Created</div>
              <div className="text-gray-900">{report.createdAt ? String(report.createdAt) : '—'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Submitted</div>
              <div className="text-gray-900">{report.submittedDate || '—'}</div>
            </div>
          </div>

          {report.content ? (
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Content</div>
              <div className="mt-1 whitespace-pre-wrap rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                {report.content}
              </div>
            </div>
          ) : null}

          {report.reviewNotes ? (
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Review notes</div>
              <div className="mt-1 whitespace-pre-wrap rounded border border-gray-200 bg-white p-3 text-sm text-gray-800">
                {report.reviewNotes}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button text="Close" className="btn-outline" onClick={onClose} />
            </div>
            <div className="flex items-center gap-2">
              <Button
                text="Open file"
                className="btn-outline"
                onClick={() => attachmentUrl && window.open(attachmentUrl, '_blank', 'noopener,noreferrer')}
                disabled={!attachmentUrl}
              />
              <Button
                text="Download"
                onClick={() => attachmentUrl && downloadFromUrl(attachmentUrl)}
                disabled={!attachmentUrl}
              />
            </div>
          </div>

          {!attachmentUrl ? (
            <div className="text-xs text-gray-500">No attachment URL for this report.</div>
          ) : null}
        </div>
      )}
    </Modal>
  );
};

export default ReportViewModal;
