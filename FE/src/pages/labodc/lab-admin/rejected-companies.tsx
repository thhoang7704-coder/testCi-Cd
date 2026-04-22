import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import { toast } from 'react-toastify';
import { companyService, type BackendCompanyResponse } from '@/services/company.service';
import { requireRoleFromToken } from '@/utils/auth';

const RejectedCompanies: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<BackendCompanyResponse[]>([]);

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
      const rejected = (list || []).filter((c) => String(c?.status || '').toUpperCase() === 'REJECTED');
      setItems(rejected);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load rejected companies');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const total = useMemo(() => items.length, [items]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rejected Companies</h1>
            <p className="text-gray-600 mt-1">Companies that were rejected during verification</p>
          </div>
          <div className="text-sm text-gray-600">Total: <span className="font-semibold text-gray-900">{total}</span></div>
        </div>
      </div>

      <Card title="Company List">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">No rejected companies found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">Company</th>
                  <th className="py-2">Tax Code</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Reason</th>
                  <th className="py-2">Company ID</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="py-3 font-medium text-gray-900">{c.companyName}</td>
                    <td className="py-3">{c.taxCode}</td>
                    <td className="py-3">{String(c.status || '').toUpperCase()}</td>
                    <td className="py-3">{c.rejectionReason || '-'}</td>
                    <td className="py-3 text-gray-600">{c.id}</td>
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

export default RejectedCompanies;
