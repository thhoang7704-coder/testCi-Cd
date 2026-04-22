import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import { companyService } from '@/services/company.service';
import { projectService } from '@/services/project.service';
import {
	projectChangeRequestService,
	type BackendProjectChangeRequestResponse,
	type BackendProjectChangeRequestType,
} from '@/services/projectChangeRequest.service';
import type { Project } from '@/types';

type StoredAuthUser = { id?: string; role?: string; email?: string } | null;

const APPLIED_CHANGE_REQUEST_IDS_KEY = 'company_applied_change_request_ids';

const loadAppliedChangeRequestIds = (): Record<string, true> => {
	try {
		const raw = localStorage.getItem(APPLIED_CHANGE_REQUEST_IDS_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return {};
		const map: Record<string, true> = {};
		for (const id of parsed) {
			const key = String(id || '').trim();
			if (key) map[key] = true;
		}
		return map;
	} catch {
		return {};
	}
};

const persistAppliedChangeRequestIds = (ids: Record<string, true>) => {
	try {
		localStorage.setItem(APPLIED_CHANGE_REQUEST_IDS_KEY, JSON.stringify(Object.keys(ids)));
	} catch {
		// ignore
	}
};

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

const isApproved = (status?: string | null) => String(status || '').toUpperCase() === 'APPROVED';
const isPending = (status?: string | null) => String(status || '').toUpperCase() === 'PENDING';

type ApplyDraft = {
	budget?: string;
	durationMonths?: string;
	startDate?: string;
	endDate?: string;
	description?: string;
	requirements?: string;
	requiredSkills?: string;
	maxTeamSize?: string;
};

const safeParseJsonObject = (raw?: string | null): Record<string, any> | null => {
	if (!raw) return null;
	const trimmed = String(raw).trim();
	if (!trimmed) return null;
	if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null;
	try {
		const parsed = JSON.parse(trimmed);
		return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
	} catch {
		return null;
	}
};

const ChangeRequests: React.FC = () => {
	const [projects, setProjects] = useState<Project[]>([]);
	const [selectedProjectId, setSelectedProjectId] = useState<string>('');
	const [items, setItems] = useState<BackendProjectChangeRequestResponse[]>([]);
	const [loading, setLoading] = useState(false);
	const [actionLoading, setActionLoading] = useState(false);
	const [appliedOnceMap, setAppliedOnceMap] = useState<Record<string, true>>(() => loadAppliedChangeRequestIds());

	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showApplyModal, setShowApplyModal] = useState(false);
	const [applyTarget, setApplyTarget] = useState<BackendProjectChangeRequestResponse | null>(null);
	const [applyDraft, setApplyDraft] = useState<ApplyDraft>({});
	const [requestType, setRequestType] = useState<BackendProjectChangeRequestType>('SCOPE_CHANGE');
	const [reason, setReason] = useState('');
	const [proposedChanges, setProposedChanges] = useState('');
	const [impactAnalysis, setImpactAnalysis] = useState('');

	const loadProjects = useCallback(async () => {
		const myCompany = await companyService.getMyCompany();
		const companyId = String(myCompany.id || '');

		const list = await projectService.listAllProjectsFromBackend();
		const companyProjects = companyId ? list.filter((p) => String(p.company_id) === companyId) : list;
		setProjects(companyProjects);
		if (!selectedProjectId && companyProjects.length) {
			setSelectedProjectId(companyProjects[0].id);
		}
	}, [selectedProjectId]);

	const loadRequests = useCallback(async (projectId: string) => {
		if (!projectId) {
			setItems([]);
			return;
		}
		const list = await projectChangeRequestService.listByProject(projectId);
		setItems(list || []);
	}, []);

	const loadAll = useCallback(async () => {
		try {
			setLoading(true);
			await loadProjects();
		} catch (e: any) {
			toast.error(e?.message || 'Failed to load projects');
			setProjects([]);
		} finally {
			setLoading(false);
		}
	}, [loadProjects]);

	useEffect(() => {
		void loadAll();
	}, [loadAll]);

	useEffect(() => {
		if (!selectedProjectId) return;
		(async () => {
			try {
				setLoading(true);
				await loadRequests(selectedProjectId);
			} catch (e: any) {
				toast.error(e?.message || 'Failed to load change requests');
				setItems([]);
			} finally {
				setLoading(false);
			}
		})();
	}, [loadRequests, selectedProjectId]);

	const selectedProject = useMemo(
		() => projects.find((p) => p.id === selectedProjectId) || null,
		[projects, selectedProjectId],
	);

	const closeApply = useCallback(() => {
		setShowApplyModal(false);
		setApplyTarget(null);
		setApplyDraft({});
	}, []);

	const openCreate = useCallback(() => {
		if (!selectedProjectId) {
			toast.error('Please select a project first');
			return;
		}
		setRequestType('SCOPE_CHANGE');
		setReason('');
		setProposedChanges('');
		setImpactAnalysis('');
		setShowCreateModal(true);
	}, [selectedProjectId]);

	const openApply = useCallback(
		(r: BackendProjectChangeRequestResponse) => {
			if (!selectedProjectId) {
				toast.error('Please select a project first');
				return;
			}
			if (!isApproved(r.status)) {
				toast.error('Only approved requests can be applied');
				return;
			}
			if (appliedOnceMap[String(r.id)]) {
				toast.info('This change request was already applied');
				return;
			}

			const parsed = safeParseJsonObject(r.proposedChanges);
			setApplyDraft({
				budget: parsed?.budget != null ? String(parsed.budget) : '',
				durationMonths: parsed?.durationMonths != null ? String(parsed.durationMonths) : '',
				startDate: parsed?.startDate != null ? String(parsed.startDate) : '',
				endDate: parsed?.endDate != null ? String(parsed.endDate) : '',
				description: parsed?.description != null ? String(parsed.description) : '',
				requirements: parsed?.requirements != null ? String(parsed.requirements) : '',
				requiredSkills: parsed?.requiredSkills != null ? String(parsed.requiredSkills) : '',
				maxTeamSize: parsed?.maxTeamSize != null ? String(parsed.maxTeamSize) : '',
			});
			setApplyTarget(r);
			setShowApplyModal(true);
		},
		[appliedOnceMap, selectedProjectId],
	);

	const applyApprovedRequest = useCallback(async () => {
		if (!applyTarget) return;
		try {
			setActionLoading(true);
			const type = String(applyTarget.requestType || '').toUpperCase();
			const payload: any = {};
			if (type === 'BUDGET_CHANGE') {
				if (applyDraft.budget) payload.budget = Number(applyDraft.budget);
			}
			if (type === 'TIMELINE_EXTENSION') {
				if (applyDraft.durationMonths) payload.durationMonths = Number(applyDraft.durationMonths);
				if (applyDraft.startDate) payload.startDate = applyDraft.startDate;
				if (applyDraft.endDate) payload.endDate = applyDraft.endDate;
			}
			if (type === 'SCOPE_CHANGE') {
				if (applyDraft.description) payload.description = applyDraft.description;
				if (applyDraft.requirements) payload.requirements = applyDraft.requirements;
				if (applyDraft.requiredSkills) payload.requiredSkills = applyDraft.requiredSkills;
			}
			if (type === 'TEAM_CHANGE') {
				if (applyDraft.maxTeamSize) payload.maxTeamSize = Number(applyDraft.maxTeamSize);
				if (applyDraft.requiredSkills) payload.requiredSkills = applyDraft.requiredSkills;
			}

			await projectChangeRequestService.applyApproved(applyTarget.id, Object.keys(payload).length ? payload : undefined);

			setAppliedOnceMap((prev) => {
				const next: Record<string, true> = { ...prev, [String(applyTarget.id)]: true as true };
				persistAppliedChangeRequestIds(next);
				return next;
			});

			toast.success('Project updated');
			closeApply();
			await loadProjects();
			await loadRequests(selectedProjectId);
		} catch (e: any) {
			toast.error(e?.message || 'Failed to apply changes');
		} finally {
			setActionLoading(false);
		}
	}, [applyDraft, applyTarget, closeApply, loadProjects, loadRequests, selectedProjectId]);

	const create = useCallback(async () => {
		const user = getStoredUser();
		const requestedById = user?.id ? String(user.id) : '';
		if (!requestedById) {
			toast.error('Missing current user id (requestedById). Please re-login.');
			return;
		}
		if (!selectedProjectId) {
			toast.error('Missing project');
			return;
		}

		try {
			setActionLoading(true);
			await projectChangeRequestService.create({
				projectId: selectedProjectId,
				requestedById,
				requestType,
				reason: reason.trim() || undefined,
				proposedChanges: proposedChanges.trim() || undefined,
				impactAnalysis: impactAnalysis.trim() || undefined,
			});
			toast.success('Change request created');
			setShowCreateModal(false);
			await loadRequests(selectedProjectId);
		} catch (e: any) {
			toast.error(e?.message || 'Create failed');
		} finally {
			setActionLoading(false);
		}
	}, [impactAnalysis, loadRequests, proposedChanges, reason, requestType, selectedProjectId]);

	const cancel = useCallback(
		async (id: string) => {
			try {
				setActionLoading(true);
				await projectChangeRequestService.cancel(id);
				toast.success('Request cancelled');
				await loadRequests(selectedProjectId);
			} catch (e: any) {
				toast.error(e?.message || 'Cancel failed');
			} finally {
				setActionLoading(false);
			}
		},
		[loadRequests, selectedProjectId],
	);

	const remove = useCallback(
		async (id: string) => {
			if (!window.confirm('Delete this change request?')) return;
			try {
				setActionLoading(true);
				await projectChangeRequestService.remove(id);
				toast.success('Request deleted');
				await loadRequests(selectedProjectId);
			} catch (e: any) {
				toast.error(e?.message || 'Delete failed');
			} finally {
				setActionLoading(false);
			}
		},
		[loadRequests, selectedProjectId],
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Change Requests</h1>
					<p className="text-gray-600 mt-1">Create and track change requests for your projects</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						text="Create Request"
						className="bg-primary-500 text-white"
						onClick={openCreate}
						isLoading={false}
						disabled={false}
						children=""
						icon=""
						loadingClass=""
						iconPosition="left"
						iconClass=""
						link=""
						div={false}
					/>
				</div>
			</div>

			<Card title="Filter" subtitle="" headerslot="" noborder={false}>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-900 mb-2">Project</label>
						<select
							value={selectedProjectId}
							onChange={(e) => setSelectedProjectId(e.target.value)}
							className="w-full border border-gray-300 rounded-lg px-3 py-2"
						>
							{projects.length === 0 ? (
								<option value="">No projects</option>
							) : (
								projects.map((p) => (
									<option key={p.id} value={p.id}>
										{p.project_name}
									</option>
								))
							)}
						</select>
					</div>
					<div className="text-sm text-gray-600 flex items-end">
						{selectedProject ? (
							<div>
								<div className="font-medium text-gray-900">Selected</div>
								<div className="line-clamp-1">{selectedProject.description || '—'}</div>
							</div>
						) : (
							<div>Select a project to view its change requests.</div>
						)}
					</div>
				</div>
			</Card>

			<Card title="Requests" subtitle="" headerslot="" noborder={false}>
				{loading ? (
					<div className="text-gray-500">Loading...</div>
				) : items.length === 0 ? (
					<div className="text-gray-500">No change requests found.</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead>
								<tr className="text-left text-gray-600">
									<th className="py-2">ID</th>
									<th className="py-2">Type</th>
									<th className="py-2">Reason</th>
									<th className="py-2">Status</th>
									<th className="py-2">Created</th>
									<th className="py-2">Actions</th>
								</tr>
							</thead>
							<tbody>
								{items.map((r) => (
									<tr key={r.id} className="border-t">
										<td className="py-3 font-medium text-gray-900">{r.id}</td>
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
											<div className="flex gap-2">
												{isApproved(r.status) ? (
													appliedOnceMap[String(r.id)] ? (
														<button
															disabled
															className="inline-flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg border border-gray-200 cursor-not-allowed"
															title="Already applied"
														>
															<Icon icon="check" className="w-4 h-4" />
															<span className="text-sm font-medium">Applied</span>
														</button>
													) : (
														<button
															onClick={() => openApply(r)}
															disabled={actionLoading}
															className="inline-flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
														>
															<Icon icon="check" className="w-4 h-4" />
															<span className="text-sm font-medium">Edit</span>
														</button>
													)
												) : isPending(r.status) ? (
													<>
														<button
															onClick={() => void cancel(r.id)}
															disabled={actionLoading}
														className="inline-flex items-center space-x-1 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
														>
															<Icon icon="close" className="w-4 h-4" />
															<span className="text-sm font-medium">Cancel</span>
														</button>
														<button
															onClick={() => void remove(r.id)}
															disabled={actionLoading}
														className="inline-flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
														>
															<span className="text-sm font-medium">Delete</span>
														</button>
													</>
												) : (
													<span className="text-xs text-gray-500">No actions</span>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</Card>

			{showApplyModal && applyTarget && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
						<div className="p-6 border-b border-gray-200 flex items-center justify-between">
							<h2 className="text-xl font-bold text-gray-900">Apply Approved Change</h2>
							<button
								onClick={closeApply}
								className="text-gray-500 hover:text-gray-700"
								disabled={actionLoading}
							>
								✕
							</button>
						</div>

						<div className="p-6 space-y-4">
							<div className="text-sm text-gray-700">
								<div className="font-medium text-gray-900">Request</div>
								<div className="mt-1">{String(applyTarget.requestType || '')}</div>
								{applyTarget.proposedChanges ? (
									<div className="mt-2">
										<div className="text-xs text-gray-500">Proposed changes (reference)</div>
										<pre className="mt-1 text-xs bg-gray-50 border border-gray-200 rounded p-3 whitespace-pre-wrap">{applyTarget.proposedChanges}</pre>
									</div>
								) : null}
							</div>

							{String(applyTarget.requestType || '').toUpperCase() === 'CANCELLATION' ? (
								<div className="text-sm text-gray-700">
									This will set the project status to <span className="font-medium">CANCELLED</span>.
								</div>
							) : (
								<>
									{String(applyTarget.requestType || '').toUpperCase() === 'BUDGET_CHANGE' && (
										<div>
											<label className="block text-sm font-medium text-gray-900 mb-2">Budget</label>
											<input
												type="number"
												min={0}
												value={applyDraft.budget || ''}
												onChange={(e) => setApplyDraft((p) => ({ ...p, budget: e.target.value }))}
												className="w-full border border-gray-300 rounded-lg px-3 py-2"
											/>
										</div>
									)}

									{String(applyTarget.requestType || '').toUpperCase() === 'TIMELINE_EXTENSION' && (
										<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
											<div>
												<label className="block text-sm font-medium text-gray-900 mb-2">Duration (months)</label>
												<input
													type="number"
													min={0}
													value={applyDraft.durationMonths || ''}
													onChange={(e) => setApplyDraft((p) => ({ ...p, durationMonths: e.target.value }))}
													className="w-full border border-gray-300 rounded-lg px-3 py-2"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-900 mb-2">Start date</label>
												<input
													type="date"
													value={applyDraft.startDate || ''}
													onChange={(e) => setApplyDraft((p) => ({ ...p, startDate: e.target.value }))}
													className="w-full border border-gray-300 rounded-lg px-3 py-2"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-900 mb-2">End date</label>
												<input
													type="date"
													value={applyDraft.endDate || ''}
													onChange={(e) => setApplyDraft((p) => ({ ...p, endDate: e.target.value }))}
													className="w-full border border-gray-300 rounded-lg px-3 py-2"
												/>
											</div>
										</div>
									)}

									{String(applyTarget.requestType || '').toUpperCase() === 'SCOPE_CHANGE' && (
										<>
											<div>
												<label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
												<textarea
													rows={3}
													value={applyDraft.description || ''}
													onChange={(e) => setApplyDraft((p) => ({ ...p, description: e.target.value }))}
													className="w-full border border-gray-300 rounded-lg px-3 py-2"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-900 mb-2">Requirements</label>
												<textarea
													rows={3}
													value={applyDraft.requirements || ''}
													onChange={(e) => setApplyDraft((p) => ({ ...p, requirements: e.target.value }))}
													className="w-full border border-gray-300 rounded-lg px-3 py-2"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-900 mb-2">Required skills</label>
												<input
													value={applyDraft.requiredSkills || ''}
													onChange={(e) => setApplyDraft((p) => ({ ...p, requiredSkills: e.target.value }))}
													className="w-full border border-gray-300 rounded-lg px-3 py-2"
													placeholder="React, TypeScript, Spring Boot"
												/>
											</div>
										</>
									)}

									{String(applyTarget.requestType || '').toUpperCase() === 'TEAM_CHANGE' && (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
											<div>
												<label className="block text-sm font-medium text-gray-900 mb-2">Max team size</label>
												<input
													type="number"
													min={0}
													value={applyDraft.maxTeamSize || ''}
													onChange={(e) => setApplyDraft((p) => ({ ...p, maxTeamSize: e.target.value }))}
													className="w-full border border-gray-300 rounded-lg px-3 py-2"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-900 mb-2">Required skills</label>
												<input
													value={applyDraft.requiredSkills || ''}
													onChange={(e) => setApplyDraft((p) => ({ ...p, requiredSkills: e.target.value }))}
													className="w-full border border-gray-300 rounded-lg px-3 py-2"
												/>
											</div>
										</div>
									)}
								</>
							)}

							<div className="flex justify-end gap-2 pt-2">
								<button
									className="px-4 py-2 rounded-lg border border-gray-300"
									onClick={closeApply}
									disabled={actionLoading}
								>
									Close
								</button>
								<button
									className="px-4 py-2 rounded-lg bg-primary-600 text-white disabled:opacity-50"
									onClick={() => void applyApprovedRequest()}
									disabled={actionLoading}
								>
									{actionLoading ? 'Editing...' : 'Edit'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

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

export default ChangeRequests;
