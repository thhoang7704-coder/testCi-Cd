import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';

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

type TargetType = 'MENTOR' | 'COMPANY';

const CandidateEvaluations: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);

  const [tab, setTab] = useState<'send' | 'mine' | 'about'>('send');
  const [loading, setLoading] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [targetType, setTargetType] = useState<TargetType>('MENTOR');

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
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

  const [myEvaluations, setMyEvaluations] = useState<BackendEvaluationResponse[]>([]);
  const [aboutMe, setAboutMe] = useState<BackendEvaluationResponse[]>([]);

  const loadProjects = async () => {
    try {
      const res = await projectService.getMyProjects();
      setProjects(res.data);
      if (!selectedProjectId && res.data?.length) {
        setSelectedProjectId(res.data[0].id);
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load my projects');
      setProjects([]);
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

  const loadAbout = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const list = await evaluationService.aboutMe(String(user.id));
      setAboutMe(list);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load received evaluations');
      setAboutMe([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadMine();
    void loadAbout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const canEvaluateTarget = useMemo(() => {
    if (!selectedProject) return { ok: false, reason: 'Please select a project' };
    if (selectedProject.status !== 'COMPLETED') return { ok: false, reason: 'Only COMPLETED projects can be evaluated' };

    if (targetType === 'MENTOR') {
      if (!selectedProject.mentor_id) return { ok: false, reason: 'Project has no mentor assigned' };
      return { ok: true, reason: '' };
    }

    if (!selectedProject.company_id) return { ok: false, reason: 'Project has no company' };
    return { ok: true, reason: '' };
  }, [selectedProject, targetType]);

  const onSubmit = async () => {
    if (!user?.id) {
      toast.error('Missing user id');
      return;
    }

    if (!canEvaluateTarget.ok) {
      toast.error(canEvaluateTarget.reason);
      return;
    }

    const evaluatedId =
      targetType === 'MENTOR'
        ? String(selectedProject!.mentor_id)
        : String(selectedProject!.company_id);

    try {
      setLoading(true);
      await evaluationService.createEvaluation({
        evaluatorId: String(user.id),
        evaluatorType: 'TALENT',
        dto: {
          projectId: String(selectedProjectId),
          evaluatedType: targetType,
          evaluatedId,
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
          <p className="mt-1 text-sm text-gray-600">Talent can evaluate mentor and company after project completion.</p>
        </div>
        <div className="text-sm text-gray-500">Logged in as: {user?.role}</div>
      </div>

      <div className="flex gap-2">
        <Button text="Send" className={tab === 'send' ? '' : 'btn-outline'} onClick={() => setTab('send')} />
        <Button text="My evaluations" className={tab === 'mine' ? '' : 'btn-outline'} onClick={() => setTab('mine')} />
        <Button text="About me" className={tab === 'about' ? '' : 'btn-outline'} onClick={() => setTab('about')} />
      </div>

      {tab === 'send' ? (
        <div className="space-y-6">
          <Card title="Context">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  className="form-control w-full"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">Select a project…</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.project_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                <select
                  className="form-control w-full"
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as TargetType)}
                  disabled={!selectedProjectId}
                >
                  <option value="MENTOR">Mentor</option>
                  <option value="COMPANY">Company</option>
                </select>
                <div className="mt-1 text-xs text-gray-500">
                  Mentor id: {selectedProject?.mentor_id || '—'} | Company id: {selectedProject?.company_id || '—'}
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <div>
                  Project status: <StatusBadge status={String(selectedProject?.status || '—')} />
                </div>
                <div className="mt-1 text-xs text-gray-500">Evaluation allowed when status is COMPLETED.</div>
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
                  disabled={loading || !canEvaluateTarget.ok}
                />
              </div>
            </div>
          </Card>
        </div>
      ) : tab === 'mine' ? (
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
      ) : (
        <Card title="Evaluations about me">
          {loading ? (
            <div className="text-sm text-gray-600">Loading…</div>
          ) : aboutMe.length === 0 ? (
            <div className="text-sm text-gray-600">No one has evaluated you yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-3">Project</th>
                    <th className="py-2 pr-3">From</th>
                    <th className="py-2 pr-3">Evaluator type</th>
                    <th className="py-2 pr-3">Rating</th>
                    <th className="py-2 pr-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {aboutMe.map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="py-2 pr-3">{e.projectId}</td>
                      <td className="py-2 pr-3">{e.evaluatorId}</td>
                      <td className="py-2 pr-3">{e.evaluatorType}</td>
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

export default CandidateEvaluations;
