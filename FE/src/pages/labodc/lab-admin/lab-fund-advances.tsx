import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import { toast } from 'react-toastify';
import { requireRoleFromToken, decodeJwtPayload, getAuthToken } from '@/utils/auth';
import {
	labFundAdvanceService,
	type BackendLabFundAdvance,
	type BackendLabFundAdvanceStatus,
} from '@/services/labFundAdvance.service';
import { useSelector } from 'react-redux';

const normalizeStatus = (s: unknown): BackendLabFundAdvanceStatus => String(s || '').toUpperCase();

const parseAmount = (amount: unknown): number => {
	if (typeof amount === 'number') return Number.isFinite(amount) ? amount : 0;
	if (typeof amount === 'string') {
		const n = Number(amount);
		return Number.isFinite(n) ? n : 0;
	}
	return 0;
};

const getCurrentUserId = (user: any): string | null => {
	if (user?.id) return String(user.id);
	if (user?.userId) return String(user.userId);
	if (user?.username) return String(user.username);
	if (user?.email) return String(user.email);

	const token = getAuthToken();
	const payload = token ? decodeJwtPayload(token) : null;
	const subject = String(payload?.sub || payload?.subject || '');
	return subject ? subject : null;
};

const getProjectLabel = (advance: BackendLabFundAdvance): string => {
	const project = (advance as any)?.project;
	return (
		project?.projectName ||
		project?.projectCode ||
		project?.id ||
		(advance as any)?.projectId ||
		'-'
	);
};

const getPaymentLabel = (advance: BackendLabFundAdvance): string => {
	const payment = (advance as any)?.payment;
	return payment?.id || (advance as any)?.paymentId || '-';
};

const LabFundAdvances: React.FC = () => {
	const { user } = useSelector((state: any) => state.auth);
	const [loading, setLoading] = useState(false);
	const [items, setItems] = useState<BackendLabFundAdvance[]>([]);
	const [outstandingTotal, setOutstandingTotal] = useState<number>(0);
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

	const [projectId, setProjectId] = useState('');
	const [paymentId, setPaymentId] = useState('');
	const [advanceAmount, setAdvanceAmount] = useState('');
	const [advanceReason, setAdvanceReason] = useState('');

	const currentUserId = useMemo(() => getCurrentUserId(user), [user]);

	const load = useCallback(async () => {
		try {
			setLoading(true);
			const auth = requireRoleFromToken('LAB_ADMIN');
			if (!auth.ok) {
				toast.error(auth.reason);
				setItems([]);
				setOutstandingTotal(0);
				return;
			}

			const [list, total] = await Promise.all([
				labFundAdvanceService.listUnsettled(),
				labFundAdvanceService.getOutstandingTotal(),
			]);
			setItems(list || []);
			setOutstandingTotal(total || 0);
		} catch (e: any) {
			toast.error(e?.message || 'Failed to load lab fund advances');
			setItems([]);
			setOutstandingTotal(0);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const createAdvance = useCallback(async () => {
		try {
			const auth = requireRoleFromToken('LAB_ADMIN');
			if (!auth.ok) {
				toast.error(auth.reason);
				return;
			}

			const pid = projectId.trim();
			const reason = advanceReason.trim();
			const amountNum = Number(advanceAmount);

			if (!pid) {
				toast.error('Project ID is required');
				return;
			}
			if (!Number.isFinite(amountNum) || amountNum <= 0) {
				toast.error('Advance amount must be a positive number');
				return;
			}
			if (!reason) {
				toast.error('Reason is required');
				return;
			}

			setActionLoadingId('CREATE');
			await labFundAdvanceService.create({
				projectId: pid,
				paymentId: paymentId.trim() || undefined,
				advanceAmount: amountNum,
				advanceReason: reason,
			});
			toast.success('Advance request created');
			setProjectId('');
			setPaymentId('');
			setAdvanceAmount('');
			setAdvanceReason('');
			await load();
		} catch (e: any) {
			toast.error(e?.message || 'Failed to create advance');
		} finally {
			setActionLoadingId(null);
		}
	}, [advanceAmount, advanceReason, load, paymentId, projectId]);

	const approve = useCallback(
		async (advance: BackendLabFundAdvance) => {
			try {
				const auth = requireRoleFromToken('LAB_ADMIN');
				if (!auth.ok) {
					toast.error(auth.reason);
					return;
				}
				setActionLoadingId(advance.id);
				await labFundAdvanceService.approve(advance.id, currentUserId || undefined);
				toast.success('Advance approved');
				await load();
			} catch (e: any) {
				toast.error(e?.message || 'Approve failed');
			} finally {
				setActionLoadingId(null);
			}
		},
		[currentUserId, load],
	);

	const settle = useCallback(
		async (advance: BackendLabFundAdvance) => {
			try {
				const auth = requireRoleFromToken('LAB_ADMIN');
				if (!auth.ok) {
					toast.error(auth.reason);
					return;
				}

				const pid = window.prompt('Payment ID to settle with (optional):', '');
				setActionLoadingId(advance.id);
				await labFundAdvanceService.settle(advance.id, pid?.trim() || undefined);
				toast.success('Advance settled');
				await load();
			} catch (e: any) {
				toast.error(e?.message || 'Settle failed');
			} finally {
				setActionLoadingId(null);
			}
		},
		[load],
	);

	const cancel = useCallback(
		async (advance: BackendLabFundAdvance) => {
			try {
				const auth = requireRoleFromToken('LAB_ADMIN');
				if (!auth.ok) {
					toast.error(auth.reason);
					return;
				}
				const reason = window.prompt('Cancel reason (optional):', '') || undefined;
				setActionLoadingId(advance.id);
				await labFundAdvanceService.cancel(advance.id, reason?.trim() || undefined);
				toast.success('Advance cancelled');
				await load();
			} catch (e: any) {
				toast.error(e?.message || 'Cancel failed');
			} finally {
				setActionLoadingId(null);
			}
		},
		[load],
	);

	const rows = useMemo(() => {
		return (items || []).map((a) => {
			const amount = parseAmount((a as any)?.advanceAmount);
			const status = normalizeStatus((a as any)?.status);
			return { a, amount, status };
		});
	}, [items]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Lab Fund Advances</h1>
					<p className="text-gray-600 mt-1">Manage advance requests and settlements</p>
				</div>
				<button type="button" className="btn btn-outline-dark" onClick={() => void load()}>
					Refresh
				</button>
			</div>

			<Card title="Create Advance">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-900 mb-1">Project ID</label>
						<input
							className="w-full border border-gray-300 rounded-lg px-3 py-2"
							value={projectId}
							onChange={(e) => setProjectId(e.target.value)}
							placeholder="project-id"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-900 mb-1">Payment ID (optional)</label>
						<input
							className="w-full border border-gray-300 rounded-lg px-3 py-2"
							value={paymentId}
							onChange={(e) => setPaymentId(e.target.value)}
							placeholder="payment-id"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-900 mb-1">Advance Amount</label>
						<input
							type="number"
							min={0}
							className="w-full border border-gray-300 rounded-lg px-3 py-2"
							value={advanceAmount}
							onChange={(e) => setAdvanceAmount(e.target.value)}
							placeholder="0"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-900 mb-1">Reason</label>
						<input
							className="w-full border border-gray-300 rounded-lg px-3 py-2"
							value={advanceReason}
							onChange={(e) => setAdvanceReason(e.target.value)}
							placeholder="Why is this advance needed?"
						/>
					</div>
				</div>

				<div className="mt-4 flex justify-end">
					<button
						type="button"
						className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
						onClick={() => void createAdvance()}
						disabled={actionLoadingId === 'CREATE'}
					>
						Create
					</button>
				</div>
			</Card>

			<Card title="Unsettled Advances">
				<div className="flex items-center justify-between mb-3">
					<div className="text-sm text-gray-700">
						Outstanding total: <span className="font-semibold">${outstandingTotal.toLocaleString()}</span>
					</div>
				</div>

				{loading ? (
					<div className="text-gray-500">Loading...</div>
				) : rows.length === 0 ? (
					<div className="text-gray-500">No unsettled advances found.</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead>
								<tr className="text-left text-gray-600">
									<th className="py-2">Advance ID</th>
									<th className="py-2">Project</th>
									<th className="py-2">Payment</th>
									<th className="py-2">Amount</th>
									<th className="py-2">Status</th>
									<th className="py-2">Created</th>
									<th className="py-2">Actions</th>
								</tr>
							</thead>
							<tbody>
								{rows.map(({ a, amount, status }) => (
									<tr key={a.id} className="border-t">
										<td className="py-3 font-medium text-gray-900">{a.id}</td>
										<td className="py-3">{getProjectLabel(a)}</td>
										<td className="py-3">{getPaymentLabel(a)}</td>
										<td className="py-3">${amount.toLocaleString()}</td>
										<td className="py-3">{status || '-'}</td>
										<td className="py-3">{(a as any)?.createdAt || '-'}</td>
										<td className="py-3">
											<div className="flex gap-2">
												<button
													className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50"
													disabled={actionLoadingId === a.id}
													onClick={() => void approve(a)}
												>
													Approve
												</button>
												<button
													className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50"
													disabled={actionLoadingId === a.id}
													onClick={() => void settle(a)}
												>
													Settle
												</button>
												<button
													className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50"
													disabled={actionLoadingId === a.id}
													onClick={() => void cancel(a)}
												>
													Cancel
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
		</div>
	);
};

export default LabFundAdvances;
