import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import type { Project } from '@/types';
import { projectService } from '@/services/project.service';
import { paymentService } from '@/services/payment.service';
import {
	projectChangeRequestService,
	type BackendProjectChangeRequestResponse,
	type BackendProjectChangeRequestType,
} from '@/services/projectChangeRequest.service';

type StoredAuthUser = { id?: string; role?: string; email?: string } | null;

const getStoredUser = (): StoredAuthUser => {
	try {
		const raw = localStorage.getItem('user');
		return raw ? (JSON.parse(raw) as StoredAuthUser) : null;
	} catch {
		return null;
	}
};

const REQUEST_TYPES: Array<{ value: BackendProjectChangeRequestType; label: string }> = [
	{ value: 'SCOPE_CHANGE', label: 'Scope change' },
	{ value: 'TIMELINE_EXTENSION', label: 'Timeline extension' },
	{ value: 'BUDGET_CHANGE', label: 'Budget change' },
	{ value: 'TEAM_CHANGE', label: 'Team change' },
	{ value: 'CANCELLATION', label: 'Cancellation' },
];

const statusPillClass = (status: string) => {
	const s = String(status || '').toUpperCase();
	if (s === 'APPROVED') return 'bg-green-50 text-green-700 border-green-200';
	if (s === 'REJECTED') return 'bg-red-50 text-red-700 border-red-200';
	if (s === 'CANCELLED') return 'bg-gray-50 text-gray-700 border-gray-200';
	return 'bg-yellow-50 text-yellow-700 border-yellow-200';
};

const ProjectDetailEnterprise: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const projectId = String(id || '');

	const [project, setProject] = useState<Project | null>(null);
	const [requests, setRequests] = useState<BackendProjectChangeRequestResponse[]>([]);
	const [loading, setLoading] = useState(false);
	const [actionLoading, setActionLoading] = useState(false);

	const [showCreateModal, setShowCreateModal] = useState(false);
	const [requestType, setRequestType] = useState<BackendProjectChangeRequestType>('SCOPE_CHANGE');
	const [reason, setReason] = useState('');
	const [proposedChanges, setProposedChanges] = useState('');
	const [impactAnalysis, setImpactAnalysis] = useState('');

	const load = useCallback(async () => {
		if (!projectId) return;
		try {
			setLoading(true);
			const p = await projectService.getProjectFromBackend(projectId);

			// Ensure payment badge/UI is correct even if project.payment_status isn't populated.
			let effectiveProject: Project = p;
			try {
				const payments = await paymentService.listPaymentsByProject(projectId);
				const paidStatuses = new Set(['PAID', 'SUCCESS', 'COMPLETED']);
				const hasPaid = payments.some((pay) => paidStatuses.has(String(pay.status || '').toUpperCase()));
				if (hasPaid) {
					effectiveProject = { ...p, payment_status: 'PAID' };
				}
			} catch {
				// ignore payment lookup failures
			}

			setProject(effectiveProject);

			const list = await projectChangeRequestService.listByProject(projectId);
			setRequests(list || []);
		} catch (e: any) {
			toast.error(e?.message || 'Failed to load project');
			setProject(null);
			setRequests([]);
		} finally {
			setLoading(false);
		}
	}, [projectId]);

	useEffect(() => {
		void load();
	}, [load]);

	const canComplete = useMemo(() => {
		if (!project) return false;
		const paid = String(project.payment_status || '').toUpperCase() === 'PAID';
		if (!paid) return false;
		const s = String(project.status || '').toUpperCase();
		return s !== 'COMPLETED' && s !== 'CANCELLED';
	}, [project]);

	const complete = useCallback(async () => {
		if (!project) return;
		try {
			setActionLoading(true);
			await projectService.completeProjectInBackend(project.id);
			toast.success('Project submitted');
			window.dispatchEvent(new Event('projects:changed'));
			await load();
		} catch (e: any) {
			toast.error(e?.message || 'Complete failed');
		} finally {
			setActionLoading(false);
		}
	}, [load, project]);

	const openCreate = useCallback(() => {
		if (!projectId) return;
		setRequestType('SCOPE_CHANGE');
		setReason('');
		setProposedChanges('');
		setImpactAnalysis('');
		setShowCreateModal(true);
	}, [projectId]);

	const create = useCallback(async () => {
		const user = getStoredUser();
		const requestedById = user?.id ? String(user.id) : '';
		if (!requestedById) {
			toast.error('Missing current user id (requestedById). Please re-login.');
			return;
		}
		if (!projectId) return;

		try {
			setActionLoading(true);
			await projectChangeRequestService.create({
				projectId,
				requestedById,
				requestType,
				reason: reason.trim() || undefined,
				proposedChanges: proposedChanges.trim() || undefined,
				impactAnalysis: impactAnalysis.trim() || undefined,
			});
			toast.success('Change request created');
			setShowCreateModal(false);
			await load();
		} catch (e: any) {
			toast.error(e?.message || 'Create failed');
		} finally {
			setActionLoading(false);
		}
	}, [impactAnalysis, load, projectId, proposedChanges, reason, requestType]);

	const cancel = useCallback(
		async (requestId: string) => {
			try {
				setActionLoading(true);
				await projectChangeRequestService.cancel(requestId);
				toast.success('Request cancelled');
				await load();
			} catch (e: any) {
				toast.error(e?.message || 'Cancel failed');
			} finally {
				setActionLoading(false);
			}
		},
		[load],
	);

	if (loading && !project) {
		return <div className="text-gray-500">Loading...</div>;
	}

	if (!project) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-gray-900">Project Detail</h1>
					<Link to="/enterprise/projects">
						<Button text="Back" className="btn-outline-dark" />
					</Link>
				</div>
				<Card>
					<div className="text-gray-600">Project not found or you don't have access.</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex items-start gap-3">
					<Link to="/enterprise/projects">
						<Button text="←" className="bg-white border border-gray-300 p-2" />
					</Link>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">{project.project_name}</h1>
						<p className="text-gray-600 mt-1">Project detail & change requests</p>
						<div className="mt-2 flex flex-wrap items-center gap-2">
							<StatusBadge status={project.status} />
							{String(project.payment_status || '').toUpperCase() === 'PAID' ? <StatusBadge status="PAID" /> : null}
							<span
								className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium ${statusPillClass(
									String(project.validation_status || ''),
								)}`}
							>
								{String(project.validation_status || '').toUpperCase()}
							</span>
						</div>
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					<button
						onClick={() => void complete()}
						disabled={!canComplete || actionLoading}
						className="inline-flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
					>
						<span className="text-sm font-medium">Submit</span>
					</button>
					<button
						onClick={openCreate}
						disabled={actionLoading}
						className="inline-flex items-center space-x-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
					>
						<span className="text-sm font-medium">Change Request</span>
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					<Card title="Description" subtitle="" headerslot="" noborder={false}>
						<p className="text-gray-700 whitespace-pre-line">{project.description || '—'}</p>
					</Card>

					<Card title="Requirements" subtitle="" headerslot="" noborder={false}>
						<p className="text-gray-700 whitespace-pre-line">{project.requirements || '—'}</p>
					</Card>

					<Card title="Required Skills" subtitle="" headerslot="" noborder={false}>
						{project.required_skills?.length ? (
							<div className="flex flex-wrap gap-2">
								{project.required_skills.map((skill, idx) => (
									<span
										key={idx}
										className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
									>
										{skill}
									</span>
								))}
							</div>
						) : (
							<div className="text-gray-500">No skills listed.</div>
						)}
					</Card>

					<Card title="Change Requests" subtitle="" headerslot="" noborder={false}>
						{loading ? (
							<div className="text-gray-500">Loading...</div>
						) : requests.length === 0 ? (
							<div className="text-gray-500">No change requests for this project.</div>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full text-sm">
									<thead>
										<tr className="text-left text-gray-600">
											<th className="py-2">Type</th>
											<th className="py-2">Reason</th>
											<th className="py-2">Status</th>
											<th className="py-2">Created</th>
											<th className="py-2">Actions</th>
										</tr>
									</thead>
									<tbody>
										{requests.map((r) => (
											<tr key={r.id} className="border-t">
												<td className="py-3">{r.requestType || '-'}</td>
												<td className="py-3">{r.reason || '-'}</td>
												<td className="py-3">
													<span
														className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium ${statusPillClass(
															String(r.status || ''),
														)}`}
													>
														{String(r.status || 'PENDING').toUpperCase()}
													</span>
												</td>
												<td className="py-3">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
												<td className="py-3">
													<button
														onClick={() => void cancel(r.id)}
														disabled={actionLoading}
														className="inline-flex items-center space-x-1 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
													>
														<Icon icon="close" className="w-4 h-4" />
														<span className="text-sm font-medium">Cancel</span>
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

				<div className="space-y-6">
					<Card title="Project Info" subtitle="" headerslot="" noborder={false}>
						<div className="space-y-4">
							<div className="flex items-center space-x-3">
								<span className="text-green-600">💰</span>
								<div>
									<p className="text-sm text-gray-600">Budget</p>
									<p className="font-semibold">${project.budget.toLocaleString()}</p>
								</div>
							</div>
							<div className="flex items-center space-x-3">
								<span className="text-blue-600">📅</span>
								<div>
									<p className="text-sm text-gray-600">Duration</p>
									<p className="font-semibold">{project.duration_months} months</p>
								</div>
							</div>
							<div className="flex items-center space-x-3">
								<span className="text-purple-600">👥</span>
								<div>
									<p className="text-sm text-gray-600">Team Size</p>
									<p className="font-semibold">{project.max_team_size} members</p>
								</div>
							</div>
							{project.rejection_reason && (
								<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
									<div className="text-sm font-medium text-red-800">Rejection reason</div>
									<div className="text-sm text-red-700 mt-1">{project.rejection_reason}</div>
								</div>
							)}
						</div>
					</Card>

					<Card title="Timeline" subtitle="" headerslot="" noborder={false}>
						<div className="space-y-3">
							<div>
								<p className="text-sm text-gray-600">Start Date</p>
								<p className="font-medium">
									{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">End Date</p>
								<p className="font-medium">
									{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'TBD'}
								</p>
							</div>
						</div>
					</Card>
				</div>
			</div>

			{showCreateModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
						<div className="p-6 border-b border-gray-200 flex items-center justify-between">
							<h2 className="text-xl font-bold text-gray-900">Create Change Request</h2>
							<button
								onClick={() => setShowCreateModal(false)}
								className="text-gray-500 hover:text-gray-700"
								disabled={actionLoading}
							>
								✕
							</button>
						</div>

						<div className="p-6 space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">Type</label>
								<select
									value={String(requestType)}
									onChange={(e) => setRequestType(e.target.value)}
									className="w-full border border-gray-300 rounded-lg px-3 py-2"
								>
									{REQUEST_TYPES.map((t) => (
										<option key={t.value} value={t.value}>
											{t.label}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">Reason</label>
								<textarea
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									className="w-full border border-gray-300 rounded-lg px-3 py-2"
									rows={3}
									placeholder="Why do you need this change?"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">Proposed Changes</label>
								<textarea
									value={proposedChanges}
									onChange={(e) => setProposedChanges(e.target.value)}
									className="w-full border border-gray-300 rounded-lg px-3 py-2"
									rows={4}
									placeholder="Describe what you propose to change"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">Impact Analysis</label>
								<textarea
									value={impactAnalysis}
									onChange={(e) => setImpactAnalysis(e.target.value)}
									className="w-full border border-gray-300 rounded-lg px-3 py-2"
									rows={4}
									placeholder="How will this impact timeline / budget / scope?"
								/>
							</div>

							<div className="flex justify-end gap-2 pt-2">
								<button
									className="px-4 py-2 rounded-lg border border-gray-300"
									onClick={() => setShowCreateModal(false)}
									disabled={actionLoading}
								>
									Close
								</button>
								<button
									className="px-4 py-2 rounded-lg bg-primary-600 text-white disabled:opacity-50"
									onClick={() => void create()}
									disabled={actionLoading}
								>
									{actionLoading ? 'Creating...' : 'Create'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

		</div>
	);
};

export default ProjectDetailEnterprise;
