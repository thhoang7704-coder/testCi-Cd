import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';

import { evaluationService, type BackendEvaluationResponse } from '@/services/evaluation.service';
import { projectService } from '@/services/project.service';
import type { Project } from '@/types';

const LabAdminEvaluations: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId],
  );

  const [evaluations, setEvaluations] = useState<BackendEvaluationResponse[]>([]);
  const [avg, setAvg] = useState<number | null>(null);
  const [locked, setLocked] = useState<boolean | null>(null);
  const [finalExists, setFinalExists] = useState<boolean | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalSummary, setFinalSummary] = useState<any>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const list = await projectService.listAllProjectsFromBackend();
      setProjects(list);
      if (!selectedProjectId && list.length) setSelectedProjectId(String(list[0].id));
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectData = async (projectId: string) => {
    try {
      setLoading(true);
      const [list, avgRating, isLocked, hasFinal, fs, score] = await Promise.all([
        evaluationService.getByProject(projectId),
        evaluationService.projectAverage(projectId).catch(() => null),
        evaluationService.isProjectLocked(projectId).catch(() => null),
        evaluationService.finalExists(projectId).catch(() => null),
        evaluationService.finalSummary(projectId).catch(() => null),
        evaluationService.finalScore(projectId).catch(() => null),
      ]);

      setEvaluations(list);
      setAvg(typeof avgRating === 'number' ? avgRating : null);
      setLocked(typeof isLocked === 'boolean' ? isLocked : null);
      setFinalExists(typeof hasFinal === 'boolean' ? hasFinal : null);
      setFinalSummary(fs);
      setFinalScore(typeof score === 'number' ? score : null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load evaluations');
      setEvaluations([]);
      setAvg(null);
      setLocked(null);
      setFinalExists(null);
      setFinalSummary(null);
      setFinalScore(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedProjectId) void loadProjectData(selectedProjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const onLock = async () => {
    if (!selectedProjectId) return;
    try {
      setLoading(true);
      await evaluationService.lockProject(selectedProjectId);
      toast.success('Locked');
      await loadProjectData(selectedProjectId);
    } catch (e: any) {
      toast.error(e?.message || 'Lock failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluations (Lab Admin)</h1>
          <p className="mt-1 text-sm text-gray-600">View evaluations by project, lock, and see final summary.</p>
        </div>
      </div>

      <Card title="Select project">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
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

          <div className="text-sm text-gray-600 space-y-1">
            <div>Status: <StatusBadge status={String(selectedProject?.status || '—')} /></div>
            <div>Average: {avg === null ? '—' : avg.toFixed(2)}</div>
            <div>Locked: {locked === null ? '—' : locked ? 'Yes' : 'No'}</div>
            <div>Final exists: {finalExists === null ? '—' : finalExists ? 'Yes' : 'No'}</div>
            <div>Final score: {finalScore === null ? '—' : finalScore.toFixed(2)}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button text={loading ? 'Loading…' : 'Refresh'} onClick={() => selectedProjectId && loadProjectData(selectedProjectId)} disabled={loading || !selectedProjectId} />
          <Button text={loading ? 'Locking…' : 'Lock project evaluations'} onClick={onLock} disabled={loading || !selectedProjectId} />
        </div>
      </Card>

      <Card title="Final summary">
        {finalSummary ? (
          <pre className="text-xs bg-gray-50 border rounded p-3 overflow-auto max-h-[420px]">{JSON.stringify(finalSummary, null, 2)}</pre>
        ) : (
          <div className="text-sm text-gray-600">No final summary (or you don’t have permission).</div>
        )}
      </Card>

      <Card title={`Evaluations in project (${evaluations.length})`}>
        {loading ? (
          <div className="text-sm text-gray-600">Loading…</div>
        ) : evaluations.length === 0 ? (
          <div className="text-sm text-gray-600">No evaluations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-3">Evaluator</th>
                  <th className="py-2 pr-3">Evaluator type</th>
                  <th className="py-2 pr-3">Evaluated</th>
                  <th className="py-2 pr-3">Evaluated type</th>
                  <th className="py-2 pr-3">Rating</th>
                  <th className="py-2 pr-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="py-2 pr-3">{e.isAnonymous ? 'Anonymous' : e.evaluatorId}</td>
                    <td className="py-2 pr-3">{e.evaluatorType}</td>
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
    </div>
  );
};

export default LabAdminEvaluations;
