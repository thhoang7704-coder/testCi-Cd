import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  mentorInvitationService,
  type BackendMentorInvitationResponse,
} from "@/services/mentorInvitation.service";
import { projectService } from "@/services/project.service";

const MentorInvitations: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const [invitations, setInvitations] = useState<
    BackendMentorInvitationResponse[]
  >([]);
  const [projectDetails, setProjectDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const mentorIdRaw = user?.id ?? user?.user_id ?? user?.mentor_id;
  const mentorId = mentorIdRaw ? String(mentorIdRaw) : "";

  useEffect(() => {
    loadInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentorId]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      // Prefer server-side "my invitations" endpoint which uses SecurityContext to resolve mentor
      // This avoids mismatches between user.id and mentor.id stored in backend.
      let list: BackendMentorInvitationResponse[] = [];
      try {
        list = await mentorInvitationService.listMy();
      } catch (e) {
        // fallback to listing by mentorId if backend doesn't expose /api/v1/mentors/invitations/me
        if (mentorId) {
          list = await mentorInvitationService.listByMentor(mentorId);
        } else {
          throw e;
        }
      }
      setInvitations(list);

      // Load project details for each invitation
      const details: Record<string, any> = {};
      for (const inv of list) {
        if (inv.projectId) {
          try {
            const projectData = await projectService.getProjectById(
              inv.projectId,
            );
            details[inv.projectId] = projectData;
          } catch (error) {
            console.error(`Failed to load project ${inv.projectId}`, error);
          }
        }
      }
      setProjectDetails(details);
    } catch (e: any) {
      console.error("Failed to load mentor invitations", e);
      toast.error(
        e?.message || "Failed to load invitations (check login/token)",
      );
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const accept = async (id: string) => {
    try {
      setUpdatingId(id);
      await mentorInvitationService.accept(id);
      toast.success(
        "Invitation accepted! You are now a mentor on this project.",
      );
      await loadInvitations();
      // Optionally navigate to the mentor dashboard
      setTimeout(() => {
        navigate("/labodc/mentor/dashboard");
      }, 1500);
    } catch (e: any) {
      console.error("Failed to accept invitation", e);
      toast.error(e?.message || "Accept failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const reject = async (id: string) => {
    try {
      setUpdatingId(id);
      await mentorInvitationService.reject(id);
      toast.success("Invitation rejected");
      await loadInvitations();
    } catch (e: any) {
      console.error("Failed to reject invitation", e);
      toast.error(e?.message || "Reject failed");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Project Invitations
        </h1>
      </div>

      <Card>
        {loading ? (
          <div className="p-6 text-gray-600">Loading...</div>
        ) : invitations.length === 0 ? (
          <div className="p-6 text-gray-600">No invitations found.</div>
        ) : (
          <ul className="space-y-3">
            {invitations.map((inv) => {
              const status = String(inv.status || "PENDING").toUpperCase();
              const createdAt = inv.createdAt ? new Date(inv.createdAt) : null;
              const dateText =
                createdAt && !Number.isNaN(createdAt.getTime())
                  ? createdAt.toLocaleDateString()
                  : "—";
              const project = projectDetails[inv.projectId || ""];

              return (
                <li
                  key={inv.id}
                  className="flex items-center justify-between border p-4 rounded hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-lg">
                      {project?.project_name ||
                        `Project ${inv.projectId}` ||
                        "—"}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {project?.description ? (
                        <p className="line-clamp-2">{project.description}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>From: {inv.invitedBy || "—"}</span>
                      <span>•</span>
                      <span>{dateText}</span>
                      {project?.budget && (
                        <>
                          <span>•</span>
                          <span>Budget: ${project.budget}</span>
                        </>
                      )}
                    </div>
                    {inv.invitationMessage && (
                      <div className="text-sm text-gray-600 mt-2 p-2 bg-blue-50 rounded italic border-l-2 border-blue-300">
                        "{inv.invitationMessage}"
                      </div>
                    )}
                    <div className="mt-3">
                      <StatusBadge status={status} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {status === "PENDING" ? (
                      <>
                        <Button
                          text={
                            updatingId === inv.id ? "Accepting..." : "Approve"
                          }
                          className="bg-green-600 text-white hover:bg-green-700"
                          disabled={updatingId !== null}
                          isLoading={updatingId === inv.id}
                          onClick={() => accept(inv.id)}
                        />
                        <Button
                          text="Decline"
                          className="btn-outline-dark"
                          disabled={updatingId !== null}
                          onClick={() => reject(inv.id)}
                        />
                      </>
                    ) : status === "ACCEPTED" ? (
                      <div className="text-center">
                        <div className="text-sm font-medium text-green-600">
                          Accepted
                        </div>
                        <Button
                          text="Go to Project"
                          className="btn-outline-dark mt-2 text-xs"
                          onClick={() =>
                            navigate(`/labodc/mentor/projects/${inv.projectId}`)
                          }
                        />
                      </div>
                    ) : (
                      <div className="text-center text-sm font-medium text-red-600">
                        {status}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default MentorInvitations;
