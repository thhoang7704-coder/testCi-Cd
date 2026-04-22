import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
// NOTE: `@/components/ui/Button` in this codebase does not expose an onClick prop.
import { toast } from 'react-toastify';
import { requireRoleFromToken } from '@/utils/auth';
import { companyService } from '@/services/company.service';
import { paymentService, type BackendPaymentResponse } from '@/services/payment.service';

const TransparencyReport: React.FC = () => {
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
				.filter((c) => String(c?.status || '').toUpperCase() === 'APPROVED')
				.map((c) => c.id);

			const settled = await Promise.allSettled(
				companyIds.map((companyId) => paymentService.listPaymentsByCompany(companyId)),
			);
			const all: BackendPaymentResponse[] = [];
			for (const r of settled) {
				if (r.status === 'fulfilled') all.push(...(r.value || []));
			}
			setPayments(all);
		} catch (e: any) {
			toast.error(e?.message || 'Failed to load transparency data');
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
		const received = payments.reduce((acc, p) => acc + parseAmount(p.amount), 0);
		const distributed = payments
			.filter((p) => normalizeStatus(p.status) === 'COMPLETED')
			.reduce((acc, p) => acc + parseAmount(p.amount), 0);
		const pending = payments.filter((p) => {
			const st = normalizeStatus(p.status);
			return st === 'PENDING' || st === 'PROCESSING';
		}).length;
		return { totalReceived: received, totalDistributed: distributed, pending };
	}, [normalizeStatus, parseAmount, payments]);

	const transactions = useMemo(() => {
		const list = payments.map((p) => {
			const amount = parseAmount(p.amount);
			const status = normalizeStatus(p.status);
			const date = p.paymentDate || p.createdAt || p.dueDate;
			return {
				id: p.id,
				type: 'Receipt',
				amount,
				project: p.projectName || p.projectCode || '-',
				date: date || '-',
				status,
			};
		});

		list.sort((a, b) => String(b.date).localeCompare(String(a.date)));
		return list.slice(0, 30);
	}, [normalizeStatus, parseAmount, payments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transparency Report</h1>
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
        <MetricCard title="Total Received" value={`$${summary.totalReceived.toLocaleString()}`} />
        <MetricCard title="Total Distributed" value={`$${summary.totalDistributed.toLocaleString()}`} />
        <MetricCard title="Pending Transactions" value={summary.pending.toString()} />
      </div>

      <Card title="Overview">
        <div className="text-sm text-gray-600">
          This report summarizes receipts and their processing status.
        </div>
      </Card>


			<Card title="Recent Transactions">
				{loading ? (
					<div className="text-gray-500">Loading...</div>
				) : transactions.length === 0 ? (
					<div className="text-gray-500">No transactions found.</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead>
								<tr className="text-left text-gray-600">
									<th className="py-2">ID</th>
									<th className="py-2">Type</th>
									<th className="py-2">Project</th>
									<th className="py-2">Amount</th>
									<th className="py-2">Date</th>
									<th className="py-2">Status</th>
								</tr>
							</thead>
							<tbody>
								{transactions.map((t) => (
									<tr key={t.id} className="border-t">
										<td className="py-3">{t.id}</td>
										<td className="py-3">{t.type}</td>
										<td className="py-3">{t.project}</td>
										<td className="py-3">${t.amount.toLocaleString()}</td>
										<td className="py-3">{t.date}</td>
										<td className="py-3">{t.status}</td>
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

export default TransparencyReport;
