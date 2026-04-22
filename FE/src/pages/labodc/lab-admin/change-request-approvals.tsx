import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import { requireRoleFromToken } from '@/utils/auth';
import {
  projectChangeRequestService,
  type BackendProjectChangeRequestResponse,
} from '@/services/projectChangeRequest.service';

const ChangeRequestApprovals: React.FC = () => {
  const [items, setItems] = useState<BackendProjectChangeRequestResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selected, setSelected] = useState<BackendProjectChangeRequestResponse | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const auth = requireRoleFromToken('LAB_ADMIN');
      if (!auth.ok) {
        toast.error(auth.reason);
        setItems([]);
        return;
      }

      const list = await projectChangeRequestService.listAll();
      setItems(list || []);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load change requests');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pending = useMemo(
    () => items.filter((r) => String(r?.status || '').toUpperCase() === 'PENDING'),
    [items],
  );

  const approve = useCallback(
    async (item: BackendProjectChangeRequestResponse) => {
      try {
        setActionLoading(true);
        const auth = requireRoleFromToken('LAB_ADMIN');
        if (!auth.ok) {
          toast.error(auth.reason);
          return;
        }
        await projectChangeRequestService.approve(item.id);
        toast.success('Change request approved');
        await load();
      } catch (e: any) {
        toast.error(e?.message || 'Approve failed');
      } finally {
        setActionLoading(false);
      }
    },
    [load],
  );

  const openReject = useCallback((item: BackendProjectChangeRequestResponse) => {
    setSelected(item);
    setReviewNotes('');
    setShowRejectModal(true);
  }, []);

  const reject = useCallback(async () => {
    if (!selected) return;
    if (!reviewNotes.trim()) {
      toast.error('Please enter review notes');
      return;
    }
    try {
      setActionLoading(true);
      const auth = requireRoleFromToken('LAB_ADMIN');
      if (!auth.ok) {
        toast.error(auth.reason);
        return;
      }
      await projectChangeRequestService.reject(selected.id, reviewNotes.trim());
      toast.success('Change request rejected');
      setShowRejectModal(false);
      setSelected(null);
      await load();
    } catch (e: any) {
      toast.error(e?.message || 'Reject failed');
    } finally {
      setActionLoading(false);
    }
  }, [load, reviewNotes, selected]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Change Requests</h1>
          <p className="text-gray-600 mt-1">Approve or reject project scope changes</p>
        </div>
      </div>

      <Card title="Pending Requests">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : pending.length === 0 ? (
          <div className="text-gray-500">No pending requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">Request ID</th>
                  <th className="py-2">Project ID</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Reason</th>
                  <th className="py-2">Requested Date</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-3 font-medium text-gray-900">{r.id}</td>
                    <td className="py-3">{r.projectId || '-'}</td>
                    <td className="py-3">{r.requestType || '-'}</td>
                    <td className="py-3">{r.reason || '-'}</td>
                    <td className="py-3">{r.requestedDate || '-'}</td>
                    <td className="py-3">{String(r.status || '').toUpperCase()}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => void approve(r)}
                          disabled={actionLoading}
                          className="inline-flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          <Icon icon="check" className="w-4 h-4" />
                          <span className="text-sm font-medium">Approve</span>
                        </button>
                        <button
                          onClick={() => openReject(r)}
                          disabled={actionLoading}
                          className="inline-flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <Icon icon="close" className="w-4 h-4" />
                          <span className="text-sm font-medium">Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Reject Change Request</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Request ID</p>
                <p className="text-gray-600">{selected?.id}</p>
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-900 mb-2">
                  Review Notes
                </label>
                <textarea
                  id="notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={4}
                  placeholder="Explain why this request is rejected"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded-lg border border-gray-300"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelected(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50"
                  onClick={() => void reject()}
                  disabled={actionLoading}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeRequestApprovals;
