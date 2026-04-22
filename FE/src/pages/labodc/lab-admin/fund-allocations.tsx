import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
// NOTE: `@/components/ui/Button` in this codebase does not expose an onClick prop.
import { toast } from 'react-toastify';
import { requireRoleFromToken } from '@/utils/auth';
import { companyService } from '@/services/company.service';
import { paymentService, type BackendPaymentResponse } from '@/services/payment.service';
import { fundAllocationService, type BackendFundAllocationResponse } from '@/services/fundAllocation.service';

const TOTAL_PARTS = 10;
const TEAM_PARTS = 7;
const MENTOR_PARTS = 2;
const LAB_PARTS = 1;

const FundAllocations: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [payments, setPayments] = useState<BackendPaymentResponse[]>([]);
	const [allocationsByPaymentId, setAllocationsByPaymentId] = useState<Record<string, BackendFundAllocationResponse>>({});
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

	const parseAmount = useCallback((amount: unknown): number => {
		if (typeof amount === 'number') return Number.isFinite(amount) ? amount : 0;
		if (typeof amount === 'string') {
			const n = Number(amount);
			return Number.isFinite(n) ? n : 0;
		}
		return 0;
	}, []);

	const splitAmount = useCallback((total: number) => {
		const team = (total * TEAM_PARTS) / TOTAL_PARTS;
		const mentor = (total * MENTOR_PARTS) / TOTAL_PARTS;
		const lab = (total * LAB_PARTS) / TOTAL_PARTS;
		return { team, mentor, lab };
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

			// Show allocation candidates primarily for COMPLETED payments.
			const completed = all.filter((p) => String(p?.status || '').toUpperCase() === 'COMPLETED');
			setPayments(completed);
		} catch (e: any) {
			toast.error(e?.message || 'Failed to load payments for allocation');
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

	const rows = useMemo(() => {
		return payments.map((p) => {
			const total = parseAmount(p.amount);
			const split = splitAmount(total);
			const existing = allocationsByPaymentId[p.id];
			return { payment: p, total, split, existing };
		});
	}, [allocationsByPaymentId, parseAmount, payments, splitAmount]);

	const createAllocation = useCallback(async (payment: BackendPaymentResponse) => {
		try {
			setActionLoadingId(payment.id);
			const auth = requireRoleFromToken('LAB_ADMIN');
			if (!auth.ok) {
				toast.error(auth.reason);
				return;
			}

			const total = parseAmount(payment.amount);
			if (total <= 0) {
				toast.error('Invalid payment amount');
				return;
			}

			const allocation = await fundAllocationService.create({
				paymentId: payment.id,
				totalAmount: String(total),
				notes: `Auto allocation ratio ${TEAM_PARTS}/${MENTOR_PARTS}/${LAB_PARTS}/${TOTAL_PARTS}`,
			});

			toast.success('Fund allocation created');
			setAllocationsByPaymentId((prev) => ({ ...prev, [payment.id]: allocation }));
		} catch (e: any) {
			toast.error(e?.message || 'Failed to create fund allocation');
		} finally {
			setActionLoadingId(null);
		}
	}, [parseAmount]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Fund Allocation</h1>
					<p className="text-gray-600 mt-1">Allocation ratio: {TEAM_PARTS}/{MENTOR_PARTS}/{LAB_PARTS}/{TOTAL_PARTS} (Team/Mentor/Lab/Total)</p>
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						className="btn btn-outline-dark"
						onClick={() => void load()}
					>
						Refresh
					</button>
				</div>
			</div>

			<Card title="Completed Payments">
				{loading ? (
					<div className="text-gray-500">Loading...</div>
				) : rows.length === 0 ? (
					<div className="text-gray-500">No completed payments found.</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead>
								<tr className="text-left text-gray-600">
									<th className="py-2">Payment ID</th>
									<th className="py-2">Project</th>
									<th className="py-2">Company</th>
									<th className="py-2">Total</th>
									<th className="py-2">Team (70%)</th>
									<th className="py-2">Mentor (20%)</th>
									<th className="py-2">Lab (10%)</th>
									<th className="py-2">Status</th>
									<th className="py-2">Actions</th>
								</tr>
							</thead>
							<tbody>
								{rows.map(({ payment, total, split, existing }) => (
									<tr key={payment.id} className="border-t">
										<td className="py-3 text-gray-700">{payment.id}</td>
										<td className="py-3 font-medium text-gray-900">{payment.projectName || payment.projectCode || '-'}</td>
										<td className="py-3">{payment.companyName || '-'}</td>
										<td className="py-3">${total.toLocaleString()}</td>
										<td className="py-3">${split.team.toLocaleString()}</td>
										<td className="py-3">${split.mentor.toLocaleString()}</td>
										<td className="py-3">${split.lab.toLocaleString()}</td>
										<td className="py-3">{existing?.status || 'NOT_CREATED'}</td>
										<td className="py-3">
											{existing ? (
												<span className="text-green-700 font-medium">Created</span>
											) : (
												<button
													className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50"
													disabled={actionLoadingId === payment.id}
													onClick={() => void createAllocation(payment)}
												>
													Create
												</button>
											)}
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

export default FundAllocations;
