import React, { useCallback, useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { requireRoleFromToken } from '@/utils/auth';
import { projectService } from '@/services/project.service';
import { companyService } from '@/services/company.service';
import { paymentService } from '@/services/payment.service';

const LabAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    pendingProjects: 0,
    activeProjects: 0,
    totalPayments: 0,
  });

  const parseAmount = useCallback((amount: unknown): number => {
    if (typeof amount === 'number') return Number.isFinite(amount) ? amount : 0;
    if (typeof amount === 'string') {
      const n = Number(amount);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  }, []);

  const load = useCallback(async () => {
    try {
      const auth = requireRoleFromToken('LAB_ADMIN');
      if (!auth.ok) {
        toast.error(auth.reason);
        return;
      }

      const pendingProjectsPromise = projectService.listPendingProjectsForValidation();
      const allProjectsPromise = projectService.listAllProjectsFromBackend();
      const companiesPromise = companyService.listAllCompanies();

      const [pendingProjects, allProjects, companies] = await Promise.all([
        pendingProjectsPromise,
        allProjectsPromise,
        companiesPromise,
      ]);

      const activeProjects = (allProjects || []).filter(
        (p: any) => String(p?.validation_status || '').toUpperCase() === 'APPROVED',
      );

      const approvedCompanyIds = (companies || [])
        .filter((c) => Boolean(c?.id))
        .filter((c) => String(c?.status || '').toUpperCase() === 'APPROVED')
        .map((c) => c.id);

      const settled = await Promise.allSettled(
        approvedCompanyIds.map((companyId) => paymentService.listPaymentsByCompany(companyId)),
      );
      let totalPayments = 0;
      for (const r of settled) {
        if (r.status === 'fulfilled') {
          for (const p of r.value || []) {
            totalPayments += parseAmount((p as any).amount);
          }
        }
      }

      setStats({
        pendingProjects: (pendingProjects || []).length,
        activeProjects: activeProjects.length,
        totalPayments,
      });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load dashboard stats');
    } finally {
    }
  }, [parseAmount]);

  useEffect(() => {
    void load();

    const onPaymentsChanged = () => {
      void load();
    };
    window.addEventListener('payments:changed', onPaymentsChanged);
    return () => {
      window.removeEventListener('payments:changed', onPaymentsChanged);
    };
  }, [load]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Lab Administration
            </h1>
            <p className="text-gray-600 mt-1">
              Manage companies, projects, payments, and allocations
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-outline-dark" onClick={() => void load()}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Pending Projects"
          value={stats.pendingProjects.toString()}
          icon={<span className="text-orange-600">📄</span>}
        />

        <MetricCard
          title="Active Projects"
          value={stats.activeProjects.toString()}
          icon={<span className="text-blue-600">📊</span>}
        />

        <MetricCard
          title="Total Payments"
          value={`$${(stats.totalPayments / 1000).toFixed(0)}k`}
          icon={<span className="text-green-600">💰</span>}
        />
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.pendingProjects > 0 && (
          <Card className="border-l-4 border-yellow-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-800">
                  Validation Required
                </h3>
                <div className="mt-2 text-sm text-gray-700">
                  <p>{stats.pendingProjects} projects awaiting validation.</p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <Link to="/lab-admin/validate-projects" className="ml-3">
                      <span className="inline-flex items-center px-3 py-2 bg-yellow-600 text-white text-xs rounded">
                        Review Projects
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="border-l-4 border-purple-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-purple-500">🏢</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">Company Verification</h3>
              <div className="mt-2 text-sm text-gray-700">
                <p>Review and approve company registration requests.</p>
              </div>
              <div className="mt-4">
                <Link to="/lab-admin/company-approvals">
                  <span className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-xs rounded">
                    Review Companies
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-blue-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400">📊</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">Fund Allocation</h3>
              <div className="mt-2 text-sm text-gray-700">
                <p>Allocate funds using the 7/2/1/10 ratio (Team/Mentor/Lab/Total).</p>
              </div>
              <div className="mt-4">
                <Link to="/lab-admin/fund-allocations">
                  <span className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-xs rounded">
                    Manage Allocations
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link to="/lab-admin/company-approvals" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl text-purple-600 mx-auto mb-2 block">🏢</span>
            <span className="text-sm font-medium text-gray-900">Company Approvals</span>
          </Link>

          <Link to="/lab-admin/approved-companies" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl text-green-600 mx-auto mb-2 block">✅</span>
            <span className="text-sm font-medium text-gray-900">Approved Companies</span>
          </Link>

          <Link to="/lab-admin/validate-projects" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl text-blue-600 mx-auto mb-2 block">📄</span>
            <span className="text-sm font-medium text-gray-900">Validate Projects</span>
          </Link>

          <Link to="/lab-admin/approved-projects" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl text-green-600 mx-auto mb-2 block">✅</span>
            <span className="text-sm font-medium text-gray-900">Approved Projects</span>
          </Link>

          <Link to="/lab-admin/mentors" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl text-indigo-600 mx-auto mb-2 block">🧑‍🏫</span>
            <span className="text-sm font-medium text-gray-900">Mentors</span>
          </Link>

          <Link to="/lab-admin/rejected-projects" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl text-red-600 mx-auto mb-2 block">⛔</span>
            <span className="text-sm font-medium text-gray-900">Rejected Projects</span>
          </Link>

          <Link to="/lab-admin/rejected-companies" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl text-red-600 mx-auto mb-2 block">🏢</span>
            <span className="text-sm font-medium text-gray-900">Rejected Companies</span>
          </Link>

          <Link to="/lab-admin/payments-overview" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl text-green-600 mx-auto mb-2 block">💰</span>
            <span className="text-sm font-medium text-gray-900">Payments</span>
          </Link>

          <Link to="/lab-admin/fund-allocations" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl text-yellow-600 mx-auto mb-2 block">📊</span>
            <span className="text-sm font-medium text-gray-900">Fund Allocations</span>
          </Link>

          <Link to="/lab-admin/lab-fund-advances" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl text-red-600 mx-auto mb-2 block">💸</span>
            <span className="text-sm font-medium text-gray-900">Fund Advances</span>
          </Link>

          <Link to="/lab-admin/transparency-report" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl text-purple-600 mx-auto mb-2 block">👁️</span>
            <span className="text-sm font-medium text-gray-900">Transparency</span>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LabAdminDashboard;
