import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';

import { companyService } from '@/services/company.service';
import { evaluationService, type BackendEvaluationResponse } from '@/services/evaluation.service';
import { projectService } from '@/services/project.service';
import type { Project } from '@/types';

const clampRating = (value: any): number | undefined => {
	const n = Number(value);
	if (!Number.isFinite(n)) return undefined;
	if (n < 1) return 1;
	if (n > 5) return 5;
	return Math.round(n);
};

const CompanyEvaluations: React.FC = () => {
	const { user } = useSelector((state: any) => state.auth);

	const [tab, setTab] = useState<'create' | 'mine'>('create');
	const [loading, setLoading] = useState(false);

	const [projects, setProjects] = useState<Project[]>([]);
	const [selectedProjectId, setSelectedProjectId] = useState('');

	const [myEvaluations, setMyEvaluations] = useState<BackendEvaluationResponse[]>([]);

	const selectedProject = useMemo(
		() => projects.find((p) => String(p.id) === String(selectedProjectId)),
		[projects, selectedProjectId],
	);

	const [form, setForm] = useState({
		rating: 5,
		technicalSkills: 5,
		communication: 5,
		teamwork: 5,
		punctuality: 5,
		feedback: '',
		isAnonymous: false,
	});

	const canEvaluateThisProject = useMemo(() => {
		// Requirement: company đánh giá project khi project hoàn thành.
		return String(selectedProject?.status || '') === 'COMPLETED';
	}, [selectedProject?.status]);

	const loadProjects = async () => {
		try {
			setLoading(true);
			const myCompany = await companyService.getMyCompany();
			const all = await projectService.listAllProjectsFromBackend();
			const mine = all.filter((p) => String(p.company_id) === String(myCompany.id));
			setProjects(mine);
			if (!selectedProjectId && mine.length) setSelectedProjectId(String(mine[0].id));
		} catch (e: any) {
			toast.error(e?.message || 'Failed to load projects');
			setProjects([]);
		} finally {
			setLoading(false);
		}
	};

	const loadMine = async () => {
		if (!user?.id) return;
		try {
			setLoading(true);
			const list = await evaluationService.myEvaluations(String(user.id));
			setMyEvaluations(list);
		} catch (e: any) {
			toast.error(e?.message || 'Failed to load my evaluations');
			setMyEvaluations([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadProjects();
		void loadMine();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onSubmit = async () => {
		if (!user?.id) {
			toast.error('Missing user id');
			return;
		}
		if (!selectedProject) {
			toast.error('Please select a project');
			return;
		}
		if (!canEvaluateThisProject) {
			toast.error('Only completed projects can be evaluated');
			return;
		}

		try {
			setLoading(true);
			await evaluationService.createEvaluation({
				evaluatorId: String(user.id),
				evaluatorType: 'COMPANY',
				dto: {
					projectId: String(selectedProject.id),
					evaluatedType: 'PROJECT',
					evaluatedId: String(selectedProject.id),
					rating: clampRating(form.rating),
					technicalSkills: clampRating(form.technicalSkills),
					communication: clampRating(form.communication),
					teamwork: clampRating(form.teamwork),
					punctuality: clampRating(form.punctuality),
					feedback: form.feedback?.trim() || undefined,
					isAnonymous: Boolean(form.isAnonymous),
				},
			});

			toast.success('Evaluation submitted');
			setForm((s) => ({ ...s, feedback: '' }));
			setTab('mine');
			await loadMine();
		} catch (e: any) {
			toast.error(e?.message || 'Submit evaluation failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Evaluations</h1>
					<p className="mt-1 text-sm text-gray-600">Company evaluates projects when they are completed.</p>
				</div>
			</div>

			<div className="flex gap-2">
				<Button text="Create" className={tab === 'create' ? '' : 'btn-outline'} onClick={() => setTab('create')} />
				<Button text="My evaluations" className={tab === 'mine' ? '' : 'btn-outline'} onClick={() => setTab('mine')} />
			</div>

			{tab === 'create' ? (
				<div className="space-y-6">
					<Card title="Project">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Select project</label>
								<select
									className="form-control w-full"
									value={selectedProjectId}
									onChange={(e) => setSelectedProjectId(e.target.value)}
								>
									{projects.map((p) => (
										<option key={p.id} value={p.id}>
											{p.project_name}
										</option>
									))}
								</select>
							</div>
							<div className="md:col-span-2 text-sm text-gray-600">
								<div>Status: <StatusBadge status={String(selectedProject?.status || '—')} /></div>
								<div className={canEvaluateThisProject ? 'text-green-700' : 'text-amber-700'}>
									{canEvaluateThisProject ? 'Eligible for evaluation' : 'Only COMPLETED projects can be evaluated'}
								</div>
							</div>
						</div>
					</Card>

					<Card title="Evaluation">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{(
								[
									['rating', 'Overall'],
									['technicalSkills', 'Technical'],
									['communication', 'Communication'],
									['teamwork', 'Teamwork'],
									['punctuality', 'Punctuality'],
								] as const
							).map(([key, label]) => (
								<div key={key}>
									<label className="block text-sm font-medium text-gray-700 mb-1">{label} (1-5)</label>
									<input
										className="form-control w-full"
										type="number"
										min={1}
										max={5}
										value={(form as any)[key]}
										onChange={(e) => setForm((s) => ({ ...s, [key]: Number(e.target.value) }))}
									/>
								</div>
							))}

							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
								<textarea
									className="form-control w-full"
									rows={4}
									value={form.feedback}
									onChange={(e) => setForm((s) => ({ ...s, feedback: e.target.value }))}
									placeholder="Optional comments…"
								/>
							</div>

							<div className="md:col-span-2 flex items-center justify-between">
								<label className="inline-flex items-center gap-2 text-sm text-gray-700">
									<input
										type="checkbox"
										checked={Boolean(form.isAnonymous)}
										onChange={(e) => setForm((s) => ({ ...s, isAnonymous: e.target.checked }))}
									/>
									Submit anonymously
								</label>

								<Button
									text={loading ? 'Submitting…' : 'Submit evaluation'}
									onClick={onSubmit}
									disabled={loading || !selectedProjectId || !canEvaluateThisProject}
								/>
							</div>
						</div>
					</Card>
				</div>
			) : (
				<Card title="My evaluations">
					{loading ? (
						<div className="text-sm text-gray-600">Loading…</div>
					) : myEvaluations.length === 0 ? (
						<div className="text-sm text-gray-600">No evaluations yet.</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead>
									<tr className="text-left text-gray-600">
										<th className="py-2 pr-3">Project</th>
										<th className="py-2 pr-3">Evaluated</th>
										<th className="py-2 pr-3">Type</th>
										<th className="py-2 pr-3">Rating</th>
										<th className="py-2 pr-3">Date</th>
									</tr>
								</thead>
								<tbody>
									{myEvaluations.map((e) => (
										<tr key={e.id} className="border-t">
											<td className="py-2 pr-3">{e.projectId}</td>
											<td className="py-2 pr-3">{e.evaluatedId}</td>
											<td className="py-2 pr-3">{e.evaluatedType}</td>
											<td className="py-2 pr-3">{e.rating ?? '—'}</td>
											<td className="py-2 pr-3">{e.evaluationDate || (e.createdAt ? String(e.createdAt).slice(0, 10) : '—')}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</Card>
			)}
		</div>
	);
};

export default CompanyEvaluations;
