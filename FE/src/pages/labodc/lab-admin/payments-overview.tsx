import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import { toast } from 'react-toastify';
import { requireRoleFromToken } from '@/utils/auth';
import { companyService } from '@/services/company.service';
import { paymentService, type BackendPaymentResponse } from '@/services/payment.service';

const PaymentsOverview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<BackendPaymentResponse[]>([]);

  const parseAmount = useCallback((amount: unknown): number => {
    if (typeof amount === 'number') return Number.isFinite(amount) ? amount : 0;
    if (typeof amount === 'string') {
      const n = Number(amount);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  }, []);

  const normalizeStatus = useCallback((status: unknown): string => {
    const s = String(status || '').toUpperCase();
    return s || 'UNKNOWN';
  }, []);

  const normalizeDate = useCallback((p: BackendPaymentResponse): Date | null => {
    const raw = p.paymentDate || p.createdAt || p.dueDate;
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const auth = requireRoleFromToken('LAB_ADMIN');
      if (!auth.ok) {
        toast.error(auth.reason);
        setPayments([]);
        return;
      }

      const companies = await companyService.listAllCompanies();
      const companyIds = (companies || [])
        .filter((c) => Boolean(c?.id))
        // Reduce API calls: most payments are expected from approved companies.
        .filter((c) => String(c?.status || '').toUpperCase() === 'APPROVED')
        .map((c) => c.id);

      if (companyIds.length === 0) {
        setPayments([]);
        return;
      }

      const settled = await Promise.allSettled(
        companyIds.map((companyId) => paymentService.listPaymentsByCompany(companyId)),
      );

      const all: BackendPaymentResponse[] = [];
      const failed = settled.filter((r) => r.status === 'rejected').length;
      for (const r of settled) {
        if (r.status === 'fulfilled') {
          all.push(...(r.value || []));
        }
      }

      if (failed > 0 && (import.meta as any).env?.DEV) {
        console.debug('[PaymentsOverview] some company payments failed', { failed, total: settled.length });
      }

      setPayments(all);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    const onPaymentsChanged = () => {
      void load();
    };
    window.addEventListener('payments:changed', onPaymentsChanged);
    return () => {
      window.removeEventListener('payments:changed', onPaymentsChanged);
    };
  }, [load]);

  const summary = useMemo(() => {
    const pendingStatuses = new Set(['PENDING', 'PROCESSING']);
    const approvedStatus = 'COMPLETED';

    let totalAmount = 0;
    let pendingCount = 0;
    let approvedCount = 0;

    for (const p of payments) {
      totalAmount += parseAmount(p.amount);
      const st = normalizeStatus(p.status);
      if (pendingStatuses.has(st)) pendingCount += 1;
      if (st === approvedStatus) approvedCount += 1;
    }

    return { totalAmount, pendingCount, approvedCount };
  }, [payments, normalizeStatus, parseAmount]);

  const recentPayments = useMemo(() => {
    const list = [...payments];
    list.sort((a, b) => {
      const da = normalizeDate(a);
      const db = normalizeDate(b);
      const ta = da ? da.getTime() : 0;
      const tb = db ? db.getTime() : 0;
      return tb - ta;
    });
    return list.slice(0, 20);
  }, [normalizeDate, payments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payments Overview</h1>
        <div className="flex space-x-2">
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={() => void load()}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Payments"
          value={`$${summary.totalAmount.toLocaleString()}`}
        />
        <MetricCard title="Approved" value={summary.approvedCount.toString()} />
        <MetricCard title="Pending" value={summary.pendingCount.toString()} />
      </div>

      <Card title="Recent Payments">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="text-gray-500">No payments found.</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">ID</th>
                <th className="py-2">Project</th>
                <th className="py-2">Company</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => {
                const amount = parseAmount(p.amount);
                const date = normalizeDate(p);
                const dateText = date ? date.toISOString().slice(0, 10) : '-';
                const status = normalizeStatus(p.status);

                return (
                  <tr key={p.id} className="border-t">
                    <td className="py-3">{p.id}</td>
                    <td className="py-3">{p.projectName || p.projectCode || '-'}</td>
                    <td className="py-3">{p.companyName || '-'}</td>
                    <td className="py-3">${amount.toLocaleString()}</td>
                    <td className="py-3">{status}</td>
                    <td className="py-3">{dateText}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </Card>
    </div>
  );
};

export default PaymentsOverview;
