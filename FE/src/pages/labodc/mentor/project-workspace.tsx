import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/shared/components/Modal";

import { mentorService } from "@/services/mentor.service";
import { mentorTaskService } from "@/services/mentorTask.service";
import { projectTeamService } from "@/services/projectTeam.service";
import {
  talentService,
  type BackendTalentResponse,
} from "@/services/talent.service";
import { taskService } from "@/services/task.service";
import { projectService } from "@/services/project.service";
import { devSeedService } from "@/services/devSeed.service";
import type { Project, Task } from "@/types";

const isoDateOrEmpty = (d?: Date): string => {
  if (!d) return "";
  try {
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const normalizeYmd = (raw: string): string => {
  const s = String(raw || "").trim();
  if (!s) return "";

  // Accept YYYY-MM-DD or YYYY-M-D and normalize to YYYY-MM-DD.
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return s;
  const yyyy = m[1];
  const mm = String(Number(m[2])).padStart(2, "0");
  const dd = String(Number(m[3])).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const parseEstimatedHours = (raw: string): number | undefined => {
  const s = String(raw || "").trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

const MentorProjectWorkspace: React.FC = () => {
  const { isAuth, user } = useSelector((state: any) => state.auth);
  const isMentor = isAuth && user?.role === "MENTOR";

  const navigate = useNavigate();
  const { id: routeProjectId } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completionLocked, setCompletionLocked] = useState(false);

  const [teamTalents, setTeamTalents] = useState<BackendTalentResponse[]>([]);
  const talentById = useMemo(() => {
    const m = new Map<string, BackendTalentResponse>();
    for (const t of teamTalents) m.set(String(t.id), t);
    return m;
  }, [teamTalents]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId],
  );

  const isProjectCompleted =
    String(selectedProject?.status || "").toUpperCase() === "COMPLETED";
  const areProjectActionsLocked = completionLocked || isProjectCompleted;

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignTaskId, setAssignTaskId] = useState<string>("");

  // Forms
  const [createForm, setCreateForm] = useState({
    taskName: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    startDate: "",
    dueDate: "",
    estimatedHours: "",
    assignedTo: "",
    attachments: "",
  });

  const [importUrl, setImportUrl] = useState<string>("");
  const [importFile, setImportFile] = useState<File | null>(null);

  const [assignTalentId, setAssignTalentId] = useState<string>("");

  const loadMyProjects = async () => {
    if (!isMentor) return;
    try {
      setLoading(true);
      const list = await mentorService.getMyAssignedProjects();
      setProjects(list);

      const routed = (routeProjectId || "").trim();
      if (routed) {
        const found = list.find((p) => String(p.id) === routed);
        if (found) {
          setSelectedProjectId(found.id);
        } else if (!selectedProjectId && list.length) {
          setSelectedProjectId(list[0].id);
          toast.error("You are not assigned to that project");
        }
      } else if (!selectedProjectId && list.length) {
        setSelectedProjectId(list[0].id);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (projectId: string, opts?: { silent?: boolean }) => {
    if (!projectId) {
      setTasks([]);
      return;
    }
    try {
      if (!opts?.silent) setLoading(true);
      const list = await taskService.getTasks({ project_id: projectId });
      setTasks(list);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load tasks");
      setTasks([]);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  const loadProjectTeamTalents = async (projectId: string) => {
    if (!projectId) {
      setTeamTalents([]);
      return;
    }
    try {
      const team = await projectTeamService.getByProject(projectId);
      const talentIds = Array.from(
        new Set(
          team
            .map((x) => x.talentId)
            .filter(Boolean)
            .map((x) => String(x)),
        ),
      );

      if (talentIds.length === 0) {
        setTeamTalents([]);
        return;
      }

      const details = await Promise.all(
        talentIds.map(async (id) => {
          try {
            return await talentService.getTalentById(id);
          } catch {
            return { id } as any;
          }
        }),
      );
      setTeamTalents(details);
    } catch (e: any) {
      // team endpoint currently public; errors should not block core workflow
      console.warn(e);
      setTeamTalents([]);
    }
  };

  useEffect(() => {
    loadMyProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMentor, routeProjectId]);

  useEffect(() => {
    if (!selectedProjectId) return;
    setCompletionLocked(false);
    loadTasks(selectedProjectId);
    loadProjectTeamTalents(selectedProjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  // Auto-refresh tasks so mentor sees updates when talents mark Done.
  useEffect(() => {
    if (!selectedProjectId) return;
    const interval = window.setInterval(() => {
      loadTasks(selectedProjectId, { silent: true });
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const onCreateTask = async () => {
    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }
    if (!createForm.taskName.trim()) {
      toast.error("Task name is required");
      return;
    }

    try {
      setLoading(true);
      const startDate = normalizeYmd(createForm.startDate);
      const dueDate = normalizeYmd(createForm.dueDate);
      const estimatedHours = parseEstimatedHours(createForm.estimatedHours);

      await mentorTaskService.createTask(selectedProjectId, {
        taskName: createForm.taskName.trim(),
        description: createForm.description?.trim() || undefined,
        priority: createForm.priority,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        estimatedHours,
        assignedTo: createForm.assignedTo?.trim() || undefined,
        attachments: createForm.attachments
          ? createForm.attachments
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
      });
      toast.success("Task created");
      setIsAddOpen(false);
      setCreateForm({
        taskName: "",
        description: "",
        priority: "MEDIUM",
        startDate: "",
        dueDate: "",
        estimatedHours: "",
        assignedTo: "",
        attachments: "",
      });
      await loadTasks(selectedProjectId);
    } catch (e: any) {
      toast.error(e?.message || "Create task failed");
    } finally {
      setLoading(false);
    }
  };

  const onImportExcel = async () => {
    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }

    if (!importFile && !importUrl.trim()) {
      toast.error("Please choose a file or enter a URL");
      return;
    }

    try {
      setLoading(true);
      if (importFile) {
        await mentorTaskService.importTasksFromExcelFile(
          selectedProjectId,
          importFile,
        );
      } else {
        await mentorTaskService.importTasksFromExcelUrl(
          selectedProjectId,
          importUrl.trim(),
        );
      }
      toast.success("Imported tasks from Excel");
      setIsImportOpen(false);
      setImportFile(null);
      setImportUrl("");
      await loadTasks(selectedProjectId);
    } catch (e: any) {
      toast.error(e?.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const openAssign = (taskId: string, currentTalentId?: string) => {
    setAssignTaskId(taskId);
    setAssignTalentId(currentTalentId || "");
    setIsAssignOpen(true);
  };

  const onAssign = async () => {
    if (!assignTaskId) return;
    if (!assignTalentId.trim()) {
      toast.error("Talent is required");
      return;
    }
    try {
      setLoading(true);
      await mentorTaskService.assignTask(assignTaskId, assignTalentId.trim());
      toast.success("Task assigned");
      setIsAssignOpen(false);
      setAssignTaskId("");
      setAssignTalentId("");
      await loadTasks(selectedProjectId);
    } catch (e: any) {
      toast.error(e?.message || "Assign failed");
    } finally {
      setLoading(false);
    }
  };

  const onSeedDemoData = async () => {
    try {
      setLoading(true);
      const result = await devSeedService.seedMentorWorkflow();
      toast.success(
        `Seeded demo data. Talent login: ${result.talentEmail} / ${result.talentPassword}`,
      );
      await loadMyProjects();
      if (result.projectId) {
        setSelectedProjectId(result.projectId);
      }
    } catch (e: any) {
      toast.error(e?.message || "Seed failed");
    } finally {
      setLoading(false);
    }
  };

  const canRequestComplete = useMemo(() => {
    if (!selectedProject) return false;
    if (!tasks || tasks.length === 0) return false;
    return tasks.every((t) => {
      const s = String(t.status || "").toUpperCase();
      return s === "DONE" || s === "COMPLETED";
    });
  }, [selectedProject, tasks]);

  const requestCompleteProject = async () => {
    if (!selectedProjectId) return;
    try {
      setLoading(true);
      await projectService.requestCompleteInBackend(selectedProjectId);
      setCompletionLocked(true);
      toast.success("done project");
      await loadMyProjects();
      await loadTasks(selectedProjectId);
    } catch (e: any) {
      toast.error(e?.message || "Request complete failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isMentor) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Project Workspace</h1>
        <div className="text-sm text-gray-600">You are not authorized.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Project Workspace
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Create tasks, import from Excel, and assign to talents.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Boolean((import.meta as any).env?.DEV) ? (
            <Button
              text="Seed Demo Data"
              className="btn-outline"
              onClick={onSeedDemoData}
              disabled={loading}
            />
          ) : null}
          <Button
            text="Import Excel"
            className="btn-outline"
            onClick={() => setIsImportOpen(true)}
            disabled={loading || !selectedProjectId}
          />
          <Button
            text="Add Task"
            className="bg-primary-500 text-white"
            onClick={() => setIsAddOpen(true)}
            disabled={loading || !selectedProjectId || areProjectActionsLocked}
          />
          <Button
            text="Complete Project"
            className="bg-green-600 text-white"
            onClick={() => void requestCompleteProject()}
            disabled={
              loading ||
              !selectedProjectId ||
              !canRequestComplete ||
              areProjectActionsLocked
            }
          />
        </div>
      </div>

      <Card title="Project">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned projects
            </label>
            <select
              className="form-control w-full"
              value={selectedProjectId}
              onChange={(e) => {
                const nextId = e.target.value;
                setSelectedProjectId(nextId);
                if (nextId) {
                  navigate(`/mentor/project/${nextId}`, { replace: true });
                }
              }}
            >
              <option value="">Select a project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name}
                </option>
              ))}
            </select>
            {selectedProject ? (
              <div className="mt-1 text-xs text-gray-500">
                Project ID: {selectedProject.id}
              </div>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button
              text={loading ? "Loading…" : "Reload"}
              className="btn-outline"
              onClick={() => {
                if (selectedProjectId) {
                  loadTasks(selectedProjectId);
                  loadProjectTeamTalents(selectedProjectId);
                }
              }}
              disabled={loading || !selectedProjectId}
            />
            <Button
              text="Refresh Projects"
              className="btn-outline"
              onClick={loadMyProjects}
              disabled={loading}
            />
          </div>
        </div>
      </Card>

      <Card
        title={`Tasks${selectedProject ? ` • ${selectedProject.project_name}` : ""}`}
        className=""
      >
        {loading ? (
          <div className="text-sm text-gray-600">Loading…</div>
        ) : tasks.length === 0 ? (
          <div className="text-sm text-gray-600">No tasks yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Priority</th>
                  <th className="py-2 pr-3">Due</th>
                  <th className="py-2 pr-3">Assigned to</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => {
                  const talent = t.assigned_to
                    ? talentById.get(String(t.assigned_to))
                    : undefined;
                  const talentLabel = talent
                    ? `${talent.studentCode || "Talent"} (${talent.id})`
                    : t.assigned_to
                      ? String(t.assigned_to)
                      : "—";
                  return (
                    <tr key={t.id} className="border-t">
                      <td className="py-2 pr-3">
                        <div className="font-medium text-gray-900">
                          {t.title}
                        </div>
                        {t.description ? (
                          <div className="text-xs text-gray-500 line-clamp-2">
                            {t.description}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3">{String(t.status)}</td>
                      <td className="py-2 pr-3">{String(t.priority)}</td>
                      <td className="py-2 pr-3">
                        {t.due_date ? isoDateOrEmpty(t.due_date) : "—"}
                      </td>
                      <td className="py-2 pr-3">{talentLabel}</td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <Button
                            text={t.assigned_to ? "Reassign" : "Assign"}
                            className="btn-outline"
                            onClick={() => openAssign(t.id, t.assigned_to)}
                            disabled={loading}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Task */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Task"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task name *
            </label>
            <input
              className="form-control w-full"
              value={createForm.taskName}
              onChange={(e) =>
                setCreateForm((s) => ({ ...s, taskName: e.target.value }))
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="form-control w-full"
              rows={4}
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((s) => ({ ...s, description: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              className="form-control w-full"
              value={createForm.priority}
              onChange={(e) =>
                setCreateForm((s) => ({
                  ...s,
                  priority: e.target.value as any,
                }))
              }
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated hours
            </label>
            <input
              className="form-control w-full"
              type="number"
              step="0.25"
              value={createForm.estimatedHours}
              onChange={(e) =>
                setCreateForm((s) => ({ ...s, estimatedHours: e.target.value }))
              }
              placeholder="e.g. 8"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start date (YYYY-MM-DD)
            </label>
            <input
              className="form-control w-full"
              type="date"
              value={createForm.startDate}
              onChange={(e) =>
                setCreateForm((s) => ({
                  ...s,
                  startDate: normalizeYmd(e.target.value),
                }))
              }
              placeholder="2026-02-01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due date (YYYY-MM-DD)
            </label>
            <input
              className="form-control w-full"
              type="date"
              value={createForm.dueDate}
              onChange={(e) =>
                setCreateForm((s) => ({
                  ...s,
                  dueDate: normalizeYmd(e.target.value),
                }))
              }
              placeholder="2026-02-10"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign to (optional)
            </label>
            {teamTalents.length ? (
              <select
                className="form-control w-full"
                value={createForm.assignedTo}
                onChange={(e) =>
                  setCreateForm((s) => ({ ...s, assignedTo: e.target.value }))
                }
              >
                <option value="">— Not assigned —</option>
                {teamTalents.map((t) => (
                  <option key={String(t.id)} value={String(t.id)}>
                    {t.studentCode || "Talent"} ({String(t.id)})
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="form-control w-full"
                value={createForm.assignedTo}
                onChange={(e) =>
                  setCreateForm((s) => ({ ...s, assignedTo: e.target.value }))
                }
                placeholder="Talent ID"
              />
            )}
            <div className="mt-1 text-xs text-gray-500">
              If you don’t see talents, ensure the project has team members.
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachments (comma-separated URLs)
            </label>
            <input
              className="form-control w-full"
              value={createForm.attachments}
              onChange={(e) =>
                setCreateForm((s) => ({ ...s, attachments: e.target.value }))
              }
              placeholder="https://... , https://..."
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <Button
              text={loading ? "Saving…" : "Create"}
              onClick={onCreateTask}
              disabled={loading}
            />
            <Button
              text="Cancel"
              className="btn-outline"
              onClick={() => setIsAddOpen(false)}
              disabled={loading}
            />
          </div>
        </div>
      </Modal>

      {/* Import Excel */}
      <Modal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Import Tasks from Excel"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload .xlsx file
            </label>
            <input
              type="file"
              className="form-control w-full"
              accept=".xlsx"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
            <div className="mt-1 text-xs text-gray-500">
              Expected columns: A=TaskName, B=Description, C=Priority,
              D=StartDate, E=DueDate, F=EstimatedHours, G=TalentId (optional).
            </div>
          </div>

          <div className="text-center text-xs text-gray-500">— OR —</div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excel URL
            </label>
            <input
              className="form-control w-full"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://.../template.xlsx"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              text={loading ? "Importing…" : "Import"}
              onClick={onImportExcel}
              disabled={loading}
            />
            <Button
              text="Cancel"
              className="btn-outline"
              onClick={() => setIsImportOpen(false)}
              disabled={loading}
            />
          </div>
        </div>
      </Modal>

      {/* Assign */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Assign Task"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Talent
            </label>
            {teamTalents.length ? (
              <select
                className="form-control w-full"
                value={assignTalentId}
                onChange={(e) => setAssignTalentId(e.target.value)}
              >
                <option value="">Select a talent…</option>
                {teamTalents.map((t) => (
                  <option key={String(t.id)} value={String(t.id)}>
                    {t.studentCode || "Talent"} ({String(t.id)})
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="form-control w-full"
                value={assignTalentId}
                onChange={(e) => setAssignTalentId(e.target.value)}
                placeholder="Talent ID"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              text={loading ? "Saving…" : "Assign"}
              onClick={onAssign}
              disabled={loading}
            />
            <Button
              text="Cancel"
              className="btn-outline"
              onClick={() => setIsAssignOpen(false)}
              disabled={loading}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MentorProjectWorkspace;
