import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import { toast } from 'react-toastify';
import { requireRoleFromToken, decodeJwtPayload, getAuthToken } from '@/utils/auth';
import {
	companyRiskRecordService,
	type BackendCompanyRiskRecordResponse,
	type BackendCompanyRiskType,
	type BackendRiskSeverity,
} from '@/services/companyRiskRecord.service';
import { useSelector } from 'react-redux';

const RISK_TYPES: BackendCompanyRiskType[] = [
	'PAYMENT',
	'SCOPE',
	'LEGAL',
	'COMMUNICATION',
	'QUALITY',
	'OTHER',
];

const SEVERITIES: BackendRiskSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

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

const RiskRecords: React.FC = () => {
	const { user } = useSelector((state: any) => state.auth);
	const currentUserId = useMemo(() => getCurrentUserId(user), [user]);

	const [loading, setLoading] = useState(false);
	const [items, setItems] = useState<BackendCompanyRiskRecordResponse[]>([]);
	const [mode, setMode] = useState<'HIGH_RISK' | 'BY_COMPANY' | 'BY_PROJECT'>('HIGH_RISK');

	const [companyId, setCompanyId] = useState('');
	const [projectId, setProjectId] = useState('');

	const [createCompanyId, setCreateCompanyId] = useState('');
	const [createProjectId, setCreateProjectId] = useState('');
	const [riskType, setRiskType] = useState<BackendCompanyRiskType>('PAYMENT');
	const [severity, setSeverity] = useState<BackendRiskSeverity>('LOW');
	const [description, setDescription] = useState('');
	const [creating, setCreating] = useState(false);

	const load = useCallback(async () => {
		try {
			setLoading(true);
			const auth = requireRoleFromToken('LAB_ADMIN');
			if (!auth.ok) {
				toast.error(auth.reason);
				setItems([]);
				return;
			}

			if (mode === 'BY_COMPANY') {
				const cid = companyId.trim();
				if (!cid) {
					setItems([]);
					return;
				}
				const list = await companyRiskRecordService.listByCompany(cid);
				setItems(list || []);
				return;
			}

			if (mode === 'BY_PROJECT') {
				const pid = projectId.trim();
				if (!pid) {
					setItems([]);
					return;
				}
				const list = await companyRiskRecordService.listByProject(pid);
				setItems(list || []);
				return;
			}

			const list = await companyRiskRecordService.listHighRisk();
			setItems(list || []);
		} catch (e: any) {
			toast.error(e?.message || 'Failed to load risk records');
			setItems([]);
		} finally {
			setLoading(false);
		}
	}, [companyId, mode, projectId]);

	useEffect(() => {
		void load();
	}, [load]);

	const create = useCallback(async () => {
		try {
			setCreating(true);
			const auth = requireRoleFromToken('LAB_ADMIN');
			if (!auth.ok) {
				toast.error(auth.reason);
				return;
			}

			const cid = createCompanyId.trim();
			if (!cid) {
				toast.error('Company ID is required');
				return;
			}

			const desc = description.trim();
			if (!desc) {
				toast.error('Description is required');
				return;
			}

			if (!currentUserId) {
				toast.error('Cannot determine current user id for recordedById');
				return;
			}

			await companyRiskRecordService.create({
				companyId: cid,
				projectId: createProjectId.trim() || undefined,
				riskType,
				severity,
				description: desc,
				recordedById: currentUserId,
			});

			toast.success('Risk record created');
			setCreateCompanyId('');
			setCreateProjectId('');
			setRiskType('PAYMENT');
			setSeverity('LOW');
			setDescription('');
			await load();
		} catch (e: any) {
			toast.error(e?.message || 'Failed to create risk record');
		} finally {
			setCreating(false);
		}
	}, [createCompanyId, createProjectId, currentUserId, description, load, riskType, severity]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Risk Records</h1>
					<p className="text-gray-600 mt-1">Track company and project risks</p>
				</div>
				<button type="button" className="btn btn-outline-dark" onClick={() => void load()}>
					Refresh
				</button>
			</div>

			<Card title="Create Risk Record">
				<div className="grid grid-cols-1 md:grid-cols-6 gap-4">
					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-900 mb-1">Company ID</label>
						<input
							className="w-full border border-gray-300 rounded-lg px-3 py-2"
							value={createCompanyId}
							onChange={(e) => setCreateCompanyId(e.target.value)}
							placeholder="company-id"
						/>
					</div>
					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-900 mb-1">Project ID (optional)</label>
						<input
							className="w-full border border-gray-300 rounded-lg px-3 py-2"
							value={createProjectId}
							onChange={(e) => setCreateProjectId(e.target.value)}
							placeholder="project-id"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-900 mb-1">Risk Type</label>
						<select
							className="w-full border border-gray-300 rounded-lg px-3 py-2"
							value={riskType}
							onChange={(e) => setRiskType(e.target.value)}
						>
							{RISK_TYPES.map((t) => (
								<option key={t} value={t}>
									{t}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-900 mb-1">Severity</label>
						<select
							className="w-full border border-gray-300 rounded-lg px-3 py-2"
							value={severity}
							onChange={(e) => setSeverity(e.target.value)}
						>
							{SEVERITIES.map((s) => (
								<option key={s} value={s}>
									{s}
								</option>
							))}
						</select>
					</div>
				</div>
				<div className="mt-4">
					<label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
					<input
						className="w-full border border-gray-300 rounded-lg px-3 py-2"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Describe the risk"
					/>
				</div>
				<div className="mt-4 flex justify-end">
					<button
						type="button"
						className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
						onClick={() => void create()}
						disabled={creating}
					>
						Create
					</button>
				</div>
			</Card>

			<Card title="Risk Records">
				<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-3">
					<div className="flex gap-2">
						<button
							type="button"
							className={`px-3 py-2 rounded-lg border ${mode === 'HIGH_RISK' ? 'bg-gray-900 text-white' : 'bg-white'}`}
							onClick={() => setMode('HIGH_RISK')}
						>
							High Risk
						</button>
						<button
							type="button"
							className={`px-3 py-2 rounded-lg border ${mode === 'BY_COMPANY' ? 'bg-gray-900 text-white' : 'bg-white'}`}
							onClick={() => setMode('BY_COMPANY')}
						>
							By Company
						</button>
						<button
							type="button"
							className={`px-3 py-2 rounded-lg border ${mode === 'BY_PROJECT' ? 'bg-gray-900 text-white' : 'bg-white'}`}
							onClick={() => setMode('BY_PROJECT')}
						>
							By Project
						</button>
					</div>

					{mode === 'BY_COMPANY' && (
						<div className="flex gap-2 items-end">
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">Company ID</label>
								<input
									className="border border-gray-300 rounded-lg px-3 py-2"
									value={companyId}
									onChange={(e) => setCompanyId(e.target.value)}
									placeholder="company-id"
								/>
							</div>
							<button type="button" className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700" onClick={() => void load()}>
								Load
							</button>
						</div>
					)}

					{mode === 'BY_PROJECT' && (
						<div className="flex gap-2 items-end">
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">Project ID</label>
								<input
									className="border border-gray-300 rounded-lg px-3 py-2"
									value={projectId}
									onChange={(e) => setProjectId(e.target.value)}
									placeholder="project-id"
								/>
							</div>
							<button type="button" className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700" onClick={() => void load()}>
								Load
							</button>
						</div>
					)}
				</div>

				{loading ? (
					<div className="text-gray-500">Loading...</div>
				) : items.length === 0 ? (
					<div className="text-gray-500">No risk records found.</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead>
								<tr className="text-left text-gray-600">
									<th className="py-2">Company</th>
									<th className="py-2">Project</th>
									<th className="py-2">Type</th>
									<th className="py-2">Severity</th>
									<th className="py-2">Description</th>
									<th className="py-2">Recorded By</th>
									<th className="py-2">Recorded At</th>
								</tr>
							</thead>
							<tbody>
								{items.map((r) => (
									<tr key={r.id} className="border-t">
										<td className="py-3">
											<div className="font-medium text-gray-900">{r.companyName || '-'}</div>
											<div className="text-xs text-gray-500">{r.companyTaxCode || ''}</div>
										</td>
										<td className="py-3">
											<div className="font-medium text-gray-900">{r.projectName || '-'}</div>
											<div className="text-xs text-gray-500">{r.projectCode || ''}</div>
										</td>
										<td className="py-3">{String(r.riskType || '').toUpperCase() || '-'}</td>
										<td className="py-3">{String(r.severity || '').toUpperCase() || '-'}</td>
										<td className="py-3">{r.description || '-'}</td>
										<td className="py-3">{r.recordedByName || '-'}</td>
										<td className="py-3">{r.recordedAt || '-'}</td>
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

export default RiskRecords;
