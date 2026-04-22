import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import { Link } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import { toast } from 'react-toastify';
import { requireRoleFromToken } from '@/utils/auth';
// Using emoji icons

const SystemAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSettings: 0,
    excelTemplates: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const load = async () => {
      const auth = requireRoleFromToken('SYSTEM_ADMIN');
      if (!auth.ok) {
        toast.error(auth.reason);
        return;
      }

      try {
        setLoadingStats(true);

        const [usersRes, excelRes] = await Promise.all([
          apiClient.get('/api/v1/users/'),
          apiClient.get('/api/excel-templates/active'),
        ]);

        const users: any[] = usersRes?.data?.data || [];
        const totalUsers = Array.isArray(users) ? users.length : 0;
        const activeUsers = Array.isArray(users)
          ? users.filter((u) => Boolean(u?.isActive)).length
          : 0;

        const excelTemplates = Array.isArray(excelRes?.data) ? excelRes.data.length : 0;

        setStats((prev) => ({
          ...prev,
          totalUsers,
          activeUsers,
          excelTemplates,
        }));
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load dashboard stats');
      } finally {
        setLoadingStats(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              System Administration
            </h1>
            <p className="text-gray-600 mt-1">
              Manage users, settings, and system configurations
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={loadingStats ? '…' : stats.totalUsers.toString()}
          icon={<span className="text-primary-600">👥</span>}
        />

        <MetricCard
          title="Active Users"
          value={loadingStats ? '…' : stats.activeUsers.toString()}
          icon={<span className="text-green-600">✅</span>}
        />

        <MetricCard
          title="System Settings"
          value={stats.totalSettings ? stats.totalSettings.toString() : 'N/A'}
          icon={<span className="text-blue-600">⚙️</span>}
        />

        <MetricCard
          title="Excel Templates"
          value={loadingStats ? '…' : stats.excelTemplates.toString()}
          icon={<span className="text-yellow-600">📄</span>}
        />
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/system-admin/users" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl text-primary-600 mx-auto mb-2 block">👥</span>
            <span className="text-sm font-medium text-gray-900">Manage Users</span>
          </Link>

          <Link to="/system-admin/settings" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl text-blue-600 mx-auto mb-2 block">⚙️</span>
            <span className="text-sm font-medium text-gray-900">System Settings</span>
          </Link>

          <Link to="/system-admin/excel-templates" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl text-yellow-600 mx-auto mb-2 block">📄</span>
            <span className="text-sm font-medium text-gray-900">Excel Templates</span>
          </Link>

          <Link to="/system-admin/audit-logs" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl text-green-600 mx-auto mb-2 block">🛡️</span>
            <span className="text-sm font-medium text-gray-900">Audit Logs</span>
          </Link>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card title="Recent System Activity">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">User Registration</p>
              <p className="text-sm text-gray-600">New company registered: TechCorp Inc.</p>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Project Validation</p>
              <p className="text-sm text-gray-600">Project "E-commerce Platform" approved</p>
            </div>
            <span className="text-sm text-gray-500">4 hours ago</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Settings Updated</p>
              <p className="text-sm text-gray-600">Maintenance mode disabled</p>
            </div>
            <span className="text-sm text-gray-500">1 day ago</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SystemAdminDashboard;
