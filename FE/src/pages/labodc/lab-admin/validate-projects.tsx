import React, { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Icon from '@/components/ui/Icon';
import { projectService } from '@/services/project.service';
import { Project } from '@/types';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

interface ProjectWithCompany extends Project {
  companyName?: string;
}

const decodeJwtPayload = (token: string): any => {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '==='.slice((base64.length + 3) % 4);
  try {
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const getAuthToken = (): string | null => {
  return localStorage.getItem('token') || localStorage.getItem('access_token');
};

const normalizeRole = (r: string) => r.replace(/^ROLE_/, '').toUpperCase();

const getRolesFromToken = (token: string): string[] => {
  const payload = decodeJwtPayload(token);
  const raw = payload?.roles || payload?.authorities || payload?.role;
  const roles = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return roles.map(String).map(normalizeRole);
};

const getLabAdminIdForRequest = (user: any): string => {
  if (user?.id) return String(user.id);
  if (user?.userId) return String(user.userId);
  if (user?.username) return String(user.username);
  if (user?.email) return String(user.email);

  const token = getAuthToken();
  const payload = token ? decodeJwtPayload(token) : null;
  return String(payload?.sub || payload?.subject || 'lab-admin');
};

const ValidateProjects: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [projects, setProjects] = useState<ProjectWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectWithCompany | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const labAdminId = useMemo(() => getLabAdminIdForRequest(user), [user]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        toast.error('You must be logged in to view projects.');
        setProjects([]);
        return;
      }
      const roles = getRolesFromToken(token);
      if (!roles.includes('LAB_ADMIN')) {
        toast.error('Your account does not have the LAB_ADMIN role.');
        setProjects([]);
        return;
      }

      const list = await projectService.listPendingProjectsForValidation();
      setProjects(list);
    } catch (error: any) {
      console.error('Error loading projects:', error);
      toast.error(error?.message || 'Failed to load pending projects');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (project: ProjectWithCompany) => {
    try {
      setActionLoading(true);
      await projectService.approvePendingProject(project.id, labAdminId);
      toast.success('Project approved');
      await loadProjects();
    } catch (error: any) {
      console.error('Error approving project:', error);
      toast.error(error?.message || 'Approve failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (project: ProjectWithCompany) => {
    setSelectedProject(project);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!selectedProject || !rejectionReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      await projectService.rejectPendingProject(selectedProject.id, rejectionReason.trim(), labAdminId);
      toast.success('Project rejected');
      await loadProjects();
      setShowRejectModal(false);
      setSelectedProject(null);
    } catch (error: any) {
      console.error('Error rejecting project:', error);
      toast.error(error?.message || 'Reject failed');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'project_name',
      header: 'Project Name',
      render: (value: string, item: ProjectWithCompany) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{item.description?.substring(0, 50)}...</div>
        </div>
      ),
    },
    {
      key: 'company_id',
      header: 'Company ID',
      render: (value: string) => <span className="font-medium text-gray-900">{value || '-'}</span>,
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (value: number) => <span className="font-semibold text-blue-600">${value.toLocaleString()}</span>,
    },
    {
      key: 'duration_months',
      header: 'Duration',
      render: (value: number) => `${value} months`,
    },
    {
      key: 'max_team_size',
      header: 'Team Size',
      render: (value: number) => `${value} members`,
    },
    {
      key: 'validation_status',
      header: 'Validation',
      render: (value: string) => (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-50 text-yellow-800">
          {value}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_value: any, item: ProjectWithCompany) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleApprove(item)}
            disabled={actionLoading}
            className="inline-flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            <Icon icon="check" className="w-4 h-4" />
            <span className="text-sm font-medium">Approve</span>
          </button>
          <button
            onClick={() => handleRejectClick(item)}
            disabled={actionLoading}
            className="inline-flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Icon icon="close" className="w-4 h-4" />
            <span className="text-sm font-medium">Reject</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Projects</h1>
          <p className="text-gray-600 mt-1">Approve or reject projects submitted by companies</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-200 rounded-full">
              <Icon icon="clock" className="w-6 h-6 text-yellow-700" />
            </div>
            <div>
              <div className="text-sm text-yellow-700">Pending Review</div>
              <div className="text-2xl font-bold text-yellow-900">{projects.length}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <DataTable
          data={projects}
          columns={columns}
          loading={loading}
          emptyMessage="No projects pending review"
        />
      </Card>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Reject Project</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Project</p>
                <p className="text-gray-600">{selectedProject?.project_name}</p>
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-900 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  id="reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why you are rejecting this project..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={4}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex space-x-3 rounded-b-lg">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidateProjects;
