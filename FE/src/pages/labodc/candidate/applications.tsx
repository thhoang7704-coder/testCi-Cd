import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import DataTable from "@/components/ui/DataTable";
import { projectService } from "@/services/project.service";
import type { Project, ProjectApplication } from "@/types";

const CandidateApplications: React.FC = () => {
  const [applications, setApplications] = useState<
    Array<ProjectApplication & { project?: Project }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const apps = await projectService.getMyApplications();
      const projects = await projectService.listAllProjectsFromBackend();
      const projectById = new Map(projects.map((p) => [p.id, p] as const));

      setApplications(
        apps.map((a) => ({
          ...a,
          project: projectById.get(a.project_id),
        })),
      );
    } catch (error) {
      console.error("Error loading applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id: string) => {
    try {
      setWithdrawingId(id);
      await projectService.withdrawApplication(id);
      await loadApplications();
    } catch (error) {
      console.error("Error withdrawing application:", error);
    } finally {
      setWithdrawingId(null);
    }
  };

  const columns = [
    {
      key: "project_name",
      header: "Project",
      render: (_value: string, item: any) => (
        <div>
          <div className="font-medium text-gray-900">
            {item.project?.project_name || item.project_id}
          </div>
          <div className="text-sm text-gray-500">
            Company: {item.project?.company_id || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: "applied_at",
      header: "Applied Date",
      render: (_value: any, item: any) => {
        const dt = item?.applied_at ? new Date(item.applied_at) : null;
        return dt && !Number.isNaN(dt.getTime())
          ? dt.toLocaleDateString()
          : "—";
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (value: any, item: any) => (
        <div className="flex space-x-2">
          <Link to={`/candidate/project/${item.project_id}`}>
            <Button text="View Details" className="btn-outline-dark btn-sm" />
          </Link>
          {item.status === "PENDING" && (
            <Button
              text="Withdraw"
              className="btn-outline-danger btn-sm"
              disabled={withdrawingId === item.id}
              isLoading={withdrawingId === item.id}
              onClick={() => handleWithdraw(item.id)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">Track your project applications</p>
        </div>
      </div>

      {/* Applications Table */}
      <Card>
        <DataTable
          data={applications}
          columns={columns}
          loading={loading}
          emptyMessage="You haven't applied for any projects yet."
        />
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {applications.length}
          </div>
          <div className="text-gray-600">Total Applications</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {applications.filter((app: any) => app.status === "PENDING").length}
          </div>
          <div className="text-gray-600">Pending Review</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {
              applications.filter((app: any) => app.status === "APPROVED")
                .length
            }
          </div>
          <div className="text-gray-600">Approved</div>
        </Card>
      </div>
    </div>
  );
};

export default CandidateApplications;
