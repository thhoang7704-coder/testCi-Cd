import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Card from "@/components/ui/Card";
import MetricCard from "@/components/ui/MetricCard";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { Link } from "react-router-dom";
import { projectService } from "@/services/project.service";
import { paymentService } from "@/services/payment.service";
import { companyService } from "@/services/company.service";
import { Project } from "@/types";
import type { BackendPaymentResponse } from "@/services/payment.service";
// Using emoji icons

const EnterpriseDashboard: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalPayments: 0,
    pendingValidations: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentPayments, setRecentPayments] = useState<BackendPaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentsAccessible, setPaymentsAccessible] = useState(true);

  useEffect(() => {
    loadDashboardData();

    const onPaymentsChanged = () => {
      loadDashboardData();
    };
    const onProjectsChanged = () => {
      loadDashboardData();
    };
    window.addEventListener('payments:changed', onPaymentsChanged);
    window.addEventListener('projects:changed', onProjectsChanged);
    return () => {
      window.removeEventListener('payments:changed', onPaymentsChanged);
      window.removeEventListener('projects:changed', onProjectsChanged);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setPaymentsAccessible(true);

      // Load company id
      const myCompany = await companyService.getMyCompany();
      const companyId = String(myCompany?.id || "");

      // Load company projects (BE: /api/projects)
      const allProjects = await projectService.listAllProjectsFromBackend();
      const filteredProjects = companyId
        ? allProjects.filter((p) => String(p.company_id) === companyId)
        : allProjects;

      // Load payments (BE: /api/v1/payments/company/{companyId})
      // NOTE: Company role may receive 403 due to BE security using hasAnyAuthority.
      let filteredPayments: BackendPaymentResponse[] = [];
      if (companyId) {
        try {
          filteredPayments = await paymentService.listPaymentsByCompany(companyId);
        } catch (e: any) {
          setPaymentsAccessible(false);
          filteredPayments = [];
        }
      }

      // Calculate stats
      const totalProjects = filteredProjects.length;
      const activeProjects = filteredProjects.filter(
        (p: Project) => p.status === "IN_PROGRESS"
      ).length;
      const completedProjects = filteredProjects.filter(
        (p: Project) => p.status === "COMPLETED"
      ).length;
      const totalPayments = filteredPayments.reduce((sum: number, payment: BackendPaymentResponse) => {
        const n = typeof payment.amount === "number" ? payment.amount : Number(String(payment.amount || 0));
        return sum + (Number.isFinite(n) ? n : 0);
      }, 0);
      const pendingValidations = filteredProjects.filter(
        (p: Project) => p.validation_status === "PENDING"
      ).length;

      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        totalPayments,
        pendingValidations,
      });

      const sortedProjects = [...filteredProjects].sort((a, b) => {
        const at = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bt = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return bt - at;
      });
      const sortedPayments = [...filteredPayments].sort((a, b) => {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bt - at;
      });

      setRecentProjects(sortedProjects.slice(0, 3));
      setRecentPayments(sortedPayments.slice(0, 3));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="animate-pulse"
              title=""
              subtitle=""
              headerslot=""
              noborder={false}
            >
              <div className="h-20 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-gray-600">
              Manage your projects and track payments
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/enterprise/projects/create">
              <Button
                text="Create Project"
                className="bg-primary-500 text-white w-full sm:w-auto"
              />
            </Link>
            <Link to="/enterprise/profile">
              <Button
                text="Profile"
                className="bg-white border border-gray-300 text-gray-700 w-full sm:w-auto"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <MetricCard
          title="Total Projects"
          value={stats.totalProjects.toString()}
          icon={<span className="text-primary-600">📁</span>}
        />

        <MetricCard
          title="Active Projects"
          value={stats.activeProjects.toString()}
          icon={<span className="text-blue-600">⏰</span>}
        />

        <MetricCard
          title="Completed Projects"
          value={stats.completedProjects.toString()}
          icon={<span className="text-green-600">✅</span>}
        />

        <MetricCard
          title="Total Payments"
          value={paymentsAccessible ? `$${stats.totalPayments.toLocaleString()}` : ''}
          icon={<span className="text-yellow-600">💰</span>}
        />
      </div>

      {/* Alerts */}
      {stats.pendingValidations > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {stats.pendingValidations} project
                {stats.pendingValidations > 1 ? "s" : ""} pending validation
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your projects are being reviewed by LabOdc administrators.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Projects & Payments */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card
          title="Recent Projects"
          subtitle=""
          headerslot={""}
          noborder={false}
        >
          <div className="space-y-4">
            {recentProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No projects yet. Create your first project to get started!
              </div>
            ) : (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {project.project_name}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {project.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <StatusBadge status={project.status} />
                      <StatusBadge status={project.validation_status} />
                    </div>
                  </div>

											<Link to={`/enterprise/projects/${project.id}`}>
												<Button text="View" className="btn-outline-dark btn-sm" />
											</Link>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Payments */}
        {paymentsAccessible && (
          <Card
            title="Recent Payments"
            subtitle=""
				headerslot={
					<Link to="/enterprise/payments">
						<Button text="View All" className="btn-outline-dark btn-sm" />
					</Link>
				}
            noborder={false}
          >
            <div className="space-y-4">
              {recentPayments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No payments yet.</div>
              ) : (
                recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {(payment.paymentType || "Payment")} {payment.projectName ? `- ${payment.projectName}` : ""}
                      </h4>
                      <p className="text-sm text-gray-600">
                        ${(
                          typeof payment.amount === "number" ? payment.amount : Number(String(payment.amount || 0))
                        ).toLocaleString()}
                      </p>
                      <div className="flex items-center mt-2">
                        <StatusBadge status={String(payment.status || "")} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" subtitle="" headerslot="" noborder={false}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            to="/enterprise/projects/create"
            className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl text-primary-600 mx-auto mb-2 block">
              📝
            </span>
            <span className="text-sm font-medium text-gray-900">
              Create Project
            </span>
          </Link>

          <Link
            to="/enterprise/projects"
            className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl text-blue-600 mx-auto mb-2 block">
              📋
            </span>
            <span className="text-sm font-medium text-gray-900">
              Manage Projects
            </span>
          </Link>

          <Link
            to="/enterprise/payments"
            className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl text-green-600 mx-auto mb-2 block">
              💰
            </span>
            <span className="text-sm font-medium text-gray-900">
              View Payments
            </span>
          </Link>

          <Link
            to="/enterprise/change-requests"
            className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl text-yellow-600 mx-auto mb-2 block">
              🔄
            </span>
            <span className="text-sm font-medium text-gray-900">
              Change Requests
            </span>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default EnterpriseDashboard;
