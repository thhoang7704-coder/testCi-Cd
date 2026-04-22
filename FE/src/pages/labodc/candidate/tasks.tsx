import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import Select from "@/components/ui/Select";

import {
  talentService,
  type BackendTalentTaskResponse,
} from "@/services/talent.service";
import { taskService } from "@/services/task.service";
import type { Task } from "@/types";

const parseDateOrUndefined = (v: unknown): Date | undefined => {
  if (!v) return undefined;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? undefined : d;
};

const mapBackendTalentTaskToTask = (t: BackendTalentTaskResponse): Task => {
  const createdAt = parseDateOrUndefined(t.createdAt) || new Date();
  const updatedAt = parseDateOrUndefined(t.updatedAt) || createdAt;
  const rawStatus = String(t.status || "TODO").toUpperCase();
  return {
    id: String(t.id || ""),
    project_id: String(t.projectId || ""),
    title: String(t.taskName || ""),
    description: String(t.description || ""),
    status: (rawStatus === "DONE" ? "COMPLETED" : rawStatus) as Task["status"],
    priority: String(t.priority || "MEDIUM").toUpperCase() as Task["priority"],
    assigned_to: t.assignedTo ? String(t.assignedTo) : undefined,
    created_by: String(t.createdBy || ""),
    excel_template_url: t.excelTemplateUrl
      ? String(t.excelTemplateUrl)
      : undefined,
    attachments: Array.isArray(t.attachments) ? t.attachments : undefined,
    due_date: parseDateOrUndefined(t.dueDate),
    completed_at: parseDateOrUndefined(t.completedDate),
    created_at: createdAt,
    updated_at: updatedAt,
  };
};

const CandidateTasks: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "TODO", label: "To Do" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
  ];

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
  ];

  // Select.jsx is a JS component; TS can infer overly-strict required props.
  const SelectAny = Select as any;

  const loadTasks = async () => {
    try {
      setLoading(true);
      const isTalent = user?.role?.toString().includes("TALENT");
      const list = isTalent
        ? (await talentService.getMyTasks()).map(mapBackendTalentTaskToTask)
        : await taskService.getMyTasks({
            status: statusFilter || undefined,
            priority: priorityFilter || undefined,
          });

      setTasks(list);
    } catch (e) {
      console.error("Failed to load tasks", e);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter && String(t.status).toUpperCase() !== statusFilter)
        return false;
      if (priorityFilter && String(t.priority).toUpperCase() !== priorityFilter)
        return false;
      return true;
    });
  }, [tasks, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    return { total, completed, inProgress };
  }, [tasks]);

  const markDone = async (taskId: string) => {
    try {
      setUpdatingTaskId(taskId);
      await talentService.updateTaskProgress(taskId, "DONE");
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "COMPLETED",
                completed_at: new Date(),
                updated_at: new Date(),
              }
            : t,
        ),
      );
    } catch (e) {
      console.error("Failed to mark task done", e);
    } finally {
      setUpdatingTaskId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your assigned tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            text={loading ? "Refreshing..." : "Refresh"}
            className="btn-outline-dark btn-sm"
            disabled={loading}
            isLoading={loading}
            onClick={loadTasks}
          />
        </div>
      </div>

      <Card title="Filters" noborder={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <SelectAny
              label=""
              name="status"
              options={statusOptions}
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              placeholder="Select status..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <SelectAny
              label=""
              name="priority"
              options={priorityOptions}
              value={priorityFilter}
              onChange={(e: any) => setPriorityFilter(e.target.value)}
              placeholder="Select priority..."
            />
          </div>
        </div>
      </Card>

      <Card
        title="My Tasks"
        headerslot={
          <Link to="/candidate/dashboard">
            <Button text="Back" className="btn-outline-dark btn-sm" />
          </Link>
        }
      >
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tasks assigned yet.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {task.description || "—"}
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    <StatusBadge status={task.status} />
                    <span className="text-xs text-gray-500">
                      Priority: {task.priority}
                    </span>
                    {task.due_date && (
                      <span className="text-xs text-gray-500">
                        Due: {task.due_date.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  text={
                    task.status === "COMPLETED"
                      ? "Completed"
                      : updatingTaskId === task.id
                        ? "Saving..."
                        : "Done"
                  }
                  className={
                    task.status === "COMPLETED"
                      ? "btn-outline-dark btn-sm"
                      : "bg-primary-500 text-white btn-sm"
                  }
                  disabled={
                    loading ||
                    updatingTaskId === task.id ||
                    task.status === "COMPLETED"
                  }
                  isLoading={updatingTaskId === task.id}
                  onClick={() => markDone(task.id)}
                />
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
          <div className="text-gray-600">Total</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.inProgress}
          </div>
          <div className="text-gray-600">In Progress</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.completed}
          </div>
          <div className="text-gray-600">Completed</div>
        </Card>
      </div>
    </div>
  );
};

export default CandidateTasks;
