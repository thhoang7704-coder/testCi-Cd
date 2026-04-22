import React, { useCallback, useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import {
  mentorService,
  type BackendMentorResponse,
} from "@/services/mentor.service";
import { projectService } from "@/services/project.service";
import { mentorInvitationService } from "@/services/mentorInvitation.service";
import { requireRoleFromToken } from "@/utils/auth";
import type { Project } from "@/types";

const MentorsManagement: React.FC = () => {
  const [items, setItems] = useState<BackendMentorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteMentor, setInviteMentor] =
    useState<BackendMentorResponse | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [invitationMessage, setInvitationMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const auth = requireRoleFromToken("LAB_ADMIN");
      if (!auth.ok) {
        toast.error(auth.reason);
        setItems([]);
        return;
      }
      const list =
        statusFilter === "ALL"
          ? await mentorService.listAllMentors()
          : await mentorService.listMentorsByStatus(statusFilter);
      setItems(list || []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load mentors");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const openInvite = useCallback(async (mentor: BackendMentorResponse) => {
    const auth = requireRoleFromToken("LAB_ADMIN");
    if (!auth.ok) {
      toast.error(auth.reason);
      return;
    }

    setInviteMentor(mentor);
    setInviteOpen(true);
    setInvitationMessage("");
    setSelectedProjectId(null);
    setSelectedProject(null);

    try {
      setProjectsLoading(true);
      const all = await projectService.listAllProjectsFromBackend();
      // Each project can have only 1 mentor -> only show those without assigned mentor.
      const eligible = (all || []).filter((p) => !p.mentor_id);
      setProjects(eligible);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load projects");
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  const closeInvite = useCallback(() => {
    setInviteOpen(false);
    setInviteMentor(null);
    setProjects([]);
    setSelectedProjectId(null);
    setSelectedProject(null);
    setInvitationMessage("");
    setSendingInvite(false);
  }, []);

  const selectProject = useCallback(async (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedProject(null);
    try {
      // Requirement: click project -> load project information from backend
      const p = await projectService.getProjectDetailsForLabAdmin(projectId);
      setSelectedProject(p);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load project detail");
    }
  }, []);

  const sendInvitation = useCallback(async () => {
    const auth = requireRoleFromToken("LAB_ADMIN");
    if (!auth.ok) {
      toast.error(auth.reason);
      return;
    }

    if (!inviteMentor) {
      toast.error("Missing mentor");
      return;
    }
    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }

    try {
      setSendingInvite(true);
      const project =
        selectedProject ||
        (await projectService.getProjectDetailsForLabAdmin(selectedProjectId));
      if (project.mentor_id) {
        toast.error("This project already has a mentor");
        return;
      }

      // Create invitation so mentor can approve/reject.
      await mentorInvitationService.createInvitation({
        projectId: selectedProjectId,
        mentorId: String(inviteMentor.id),
        invitationMessage: invitationMessage.trim() || undefined,
      });

      toast.success("Invitation sent to mentor");
      closeInvite();
    } catch (e: any) {
      toast.error(e?.message || "Failed to send invitation");
    } finally {
      setSendingInvite(false);
    }
  }, [
    closeInvite,
    invitationMessage,
    inviteMentor,
    selectedProject,
    selectedProjectId,
  ]);

  const total = useMemo(() => items.length, [items]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentors</h1>
            <p className="text-gray-600 mt-1">Lab Admin mentor directory</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
            <div className="text-sm text-gray-600">
              Total:{" "}
              <span className="font-semibold text-gray-900">{total}</span>
            </div>
          </div>
        </div>
      </div>

      <Card title="Mentor List">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">No mentors found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">Mentor ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Mentor Name</th>
                  <th className="py-2">User ID</th>
                  <th className="py-2">Expertise</th>
                  <th className="py-2">Experience</th>
                  <th className="py-2">Rating</th>
                  <th className="py-2">Projects</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="py-3 font-medium text-gray-900">{m.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {m.name || m.fullName || m.username || 'Chưa có tên'}</td>
                    <td className="py-3">{m.userId || "-"}</td>
                    <td className="py-3">{m.expertise || "-"}</td>
                    <td className="py-3">{m.yearsExperience ?? "-"}</td>
                    <td className="py-3">{m.rating ?? "-"}</td>
                    <td className="py-3">{m.totalProjects ?? "-"}</td>
                    <td className="py-3">{m.status || "-"}</td>
                    <td className="py-3">
                      <Button
                        text="Invite"
                        className="btn-outline-primary btn-sm"
                        onClick={() => void openInvite(m)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl rounded-lg bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Invite Mentor
                </h2>
                <p className="text-sm text-gray-600">
                  Mentor:{" "}
                  <span className="font-medium">{inviteMentor?.id}</span>
                  {inviteMentor?.expertise
                    ? ` • ${inviteMentor.expertise}`
                    : ""}
                </p>
              </div>
              <Button
                text="Close"
                className="btn-outline-dark btn-sm"
                onClick={closeInvite}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Projects</h3>
                  {projectsLoading && (
                    <span className="text-sm text-gray-500">Loading…</span>
                  )}
                </div>

                <div className="mt-3 max-h-[360px] overflow-auto space-y-2">
                  {!projectsLoading && projects.length === 0 && (
                    <div className="text-sm text-gray-500">
                      No eligible projects (missing mentor).
                    </div>
                  )}

                  {projects.map((p) => (
                    <button
                      key={p.id}
                      className={
                        `w-full text-left rounded-lg border px-3 py-2 hover:bg-gray-50 ` +
                        (selectedProjectId === p.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200")
                      }
                      onClick={() => void selectProject(p.id)}
                      type="button"
                    >
                      <div className="font-medium text-gray-900">
                        {p.project_name}
                      </div>
                      <div className="text-xs text-gray-500">ID: {p.id}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">Project Detail</h3>
                {!selectedProjectId ? (
                  <div className="mt-3 text-sm text-gray-500">
                    Select a project to view details.
                  </div>
                ) : !selectedProject ? (
                  <div className="mt-3 text-sm text-gray-500">
                    Loading project details…
                  </div>
                ) : (
                  <div className="mt-3 space-y-2 text-sm">
                    <div>
                      <div className="text-gray-500">Name</div>
                      <div className="font-medium text-gray-900">
                        {selectedProject.project_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Company</div>
                      <div className="text-gray-900">
                        {selectedProject.company_id || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Status</div>
                      <div className="text-gray-900">
                        {String(selectedProject.status || "-")}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Mentor</div>
                      <div className="text-gray-900">
                        {selectedProject.mentor_id || "Not assigned"}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-gray-500 mb-1">
                        Invitation message
                      </div>
                      <textarea
                        className="w-full min-h-[90px] border border-gray-300 rounded-lg p-2"
                        value={invitationMessage}
                        onChange={(e) => setInvitationMessage(e.target.value)}
                        placeholder="Write a short message to the mentor (optional)"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        text={sendingInvite ? "Assigning…" : "Assign Mentor"}
                        className="btn-dark"
                        onClick={() => void sendInvitation()}
                        disabled={sendingInvite}
                        isLoading={sendingInvite}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorsManagement;
