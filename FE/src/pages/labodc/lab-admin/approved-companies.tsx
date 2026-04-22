import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import { toast } from 'react-toastify';
import { companyService, type BackendCompanyResponse } from '@/services/company.service';
import { requireRoleFromToken } from '@/utils/auth';

const statusPill = (status: string | undefined) => {
  const base = 'inline-flex items-center px-2 py-1 rounded text-xs font-medium';
  if (status === 'APPROVED') return `${base} bg-green-100 text-green-800`;
  if (status === 'PENDING') return `${base} bg-yellow-100 text-yellow-800`;
  if (status === 'SUSPENDED') return `${base} bg-orange-100 text-orange-800`;
  return `${base} bg-red-100 text-red-800`;
};

const ApprovedCompanies: React.FC = () => {
  const [items, setItems] = useState<BackendCompanyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const auth = requireRoleFromToken('LAB_ADMIN');
      if (!auth.ok) {
        toast.error(auth.reason);
        setItems([]);
        return;
      }
      const list = await companyService.listAllCompanies();
      setItems(list || []);
    } catch (e: any) {
      const msg = e?.message || 'Failed to load companies';
      toast.error(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshKey;
    void load();
  }, [load, refreshKey]);

  const approvedItems = useMemo(
    () => items.filter((c) => String(c.status || '').toUpperCase() === 'APPROVED'),
    [items],
  );

  const suspend = async (companyId: string) => {
    const auth = requireRoleFromToken('LAB_ADMIN');
    if (!auth.ok) {
      toast.error(auth.reason);
      return;
    }
    const reason = window.prompt('Enter suspension reason', 'Policy violation');
    if (reason === null) return;
    const trimmed = reason.trim();
    if (!trimmed) {
      toast.error('Please enter a reason');
      return;
    }

    try {
      await companyService.suspendCompany(companyId, trimmed);
      toast.success('Company suspended');
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      toast.error(e?.message || 'Suspend failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Approved Companies</h1>
            <p className="text-gray-600 mt-1">Manage companies that have been approved</p>
          </div>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold text-gray-900">{approvedItems.length}</span>
          </div>
        </div>
      </div>

      <Card title="Companies">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : approvedItems.length === 0 ? (
          <div className="text-gray-500">No approved companies.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">Company</th>
                  <th className="py-2">Tax Code</th>
                  <th className="py-2">Website</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvedItems.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="py-3">
                      <div className="font-medium text-gray-900">{c.companyName}</div>
                      <div className="text-xs text-gray-500">{c.address || '-'}</div>
                    </td>
                    <td className="py-3">{c.taxCode || '-'}</td>
                    <td className="py-3">
                      {c.website ? (
                        <a className="text-blue-600 hover:underline" href={c.website} target="_blank" rel="noreferrer">
                          {c.website}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3">
                      <span className={statusPill(String(c.status || ''))}>{String(c.status || '-')}</span>
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        className="btn inline-flex justify-center bg-orange-600 text-white text-xs"
                        onClick={() => suspend(c.id)}
                      >
                        Suspend
                      </button>
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

export default ApprovedCompanies;
