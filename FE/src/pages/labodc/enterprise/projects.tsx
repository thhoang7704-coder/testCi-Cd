import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTable from '@/components/ui/DataTable';
import QRCodeModal from '@/components/ui/QRCodeModal';
import Icon from '@/components/ui/Icon';
import { projectService } from '@/services/project.service';
import { paymentService } from '@/services/payment.service';
import { getQrDisplayUrlFromPayment } from '@/services/payment.service';
import { companyService } from '@/services/company.service';
import { Project } from '@/types';

const EnterpriseProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [payLoading, setPayLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string>('');
  const [currentPaymentId, setCurrentPaymentId] = useState<string>('');
  const [confirmPayLoading, setConfirmPayLoading] = useState(false);

  useEffect(() => {
    loadProjects();

    const onPaymentsChanged = () => {
      loadProjects();
    };
    const onProjectsChanged = () => {
      loadProjects();
    };
    window.addEventListener('payments:changed', onPaymentsChanged);
    window.addEventListener('projects:changed', onProjectsChanged);
    return () => {
      window.removeEventListener('payments:changed', onPaymentsChanged);
      window.removeEventListener('projects:changed', onProjectsChanged);
    };
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const myCompany = await companyService.getMyCompany();
      const cid = String(myCompany.id || '');
      setCompanyId(cid);

      const list = await projectService.listAllProjectsFromBackend();
      const companyProjects = cid ? list.filter((p) => String(p.company_id) === cid) : list;

      // Best-effort paid detection from payments list (some BE responses may not populate project.payment_status)
      try {
        if (cid) {
          const payments = await paymentService.listPaymentsByCompany(cid);
          const paidStatuses = new Set(['PAID', 'SUCCESS', 'COMPLETED', 'SETTLED']);
          const normalizeKey = (v: unknown): string => String(v || '').trim().toLowerCase();
          const paidProjectKeys = new Set(
            payments
              .filter((p) => paidStatuses.has(String(p.status || '').toUpperCase()))
              .flatMap((p) => [normalizeKey(p.projectCode), normalizeKey(p.projectName)].filter(Boolean)),
          );

          const withPaid = companyProjects.map((p) => {
            const isPaidByPayment =
              paidProjectKeys.has(String(p.project_code || '').trim().toLowerCase()) ||
              paidProjectKeys.has(String(p.project_name || '').trim().toLowerCase());
            if (!isPaidByPayment) return p;
            return { ...p, payment_status: 'PAID' as const };
          });
          setProjects(withPaid);
          return;
        }
      } catch {
        // ignore paid enrichment failures; fall back to raw projects
      }

      setProjects(companyProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const isProjectPaid = (project: Project): boolean => {
    const status = String(project.payment_status || '').toUpperCase();
    return status === 'PAID' || status === 'SUCCESS' || status === 'COMPLETED' || status === 'SETTLED';
  };

  // If the user pays via QR (PayOS), backend status may update asynchronously (webhook).
  // While the QR modal is open, poll payment status and auto-hide Pay once paid.
  useEffect(() => {
    if (!showQRModal) return;
    if (!companyId) return;
    if (!currentPaymentId) return;
    if (!selectedProject?.id) return;

    let cancelled = false;
    const paidStatuses = new Set(['PAID', 'SUCCESS', 'COMPLETED', 'SETTLED']);

    const check = async () => {
      try {
        const payments = await paymentService.listPaymentsByCompany(companyId);
        const match = payments.find((p) => String(p.id) === String(currentPaymentId));
        const status = String(match?.status || '').toUpperCase();
        if (!paidStatuses.has(status)) return;
        if (cancelled) return;

        const paidProjectId = String(selectedProject.id);
        setProjects((prev) =>
          prev.map((p) => (String(p.id) === paidProjectId ? { ...p, payment_status: 'PAID' } : p)),
        );
        setSelectedProject((prev) =>
          prev && String(prev.id) === paidProjectId ? { ...prev, payment_status: 'PAID' } : prev,
        );

        try {
          window.dispatchEvent(new Event('payments:changed'));
        } catch {
          // ignore
        }

        setShowQRModal(false);
        setSelectedProject(null);
        setQrUrl('');
        setCurrentPaymentId('');
      } catch {
        // ignore polling failures
      }
    };

    // initial quick check
    void check();
    const id = window.setInterval(() => {
      void check();
    }, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [showQRModal, companyId, currentPaymentId, selectedProject?.id]);

  const handlePaymentClick = async (project: Project) => {
    if (isProjectPaid(project)) return;
    if (payLoading) return;

    try {
      setPayLoading(true);
      setQrUrl('');

      const payment = await paymentService.createPaymentForProject({
        projectId: project.id,
        companyId: companyId || project.company_id,
        amount: project.budget,
        usePayOS: true,
      });

      setCurrentPaymentId(String(payment?.id || ''));

      // Prefer QR path from `payment.notes` (avoids 403 from /api/v1/payments/{id}/qr in current BE security)
      let url = getQrDisplayUrlFromPayment(payment) || '';
      if (!url) {
        url = await paymentService.getPaymentQrUrl(payment.id);
      }
      setSelectedProject(project);
      setQrUrl(url);
      setShowQRModal(true);
    } catch (error: any) {
      console.error('Error creating payment/qr:', error);
      // keep it simple: browser alert/toast isn't imported here
      window.alert(error?.message || 'Unable to create payment QR');
    } finally {
      setPayLoading(false);
    }
  };

  const handleSimulatePaid = async () => {
    if (!currentPaymentId) {
      window.alert('Missing payment id to confirm payment');
      return;
    }
    if (confirmPayLoading) return;

    try {
      setConfirmPayLoading(true);
      await paymentService.confirmPayment(currentPaymentId);

      const paidProjectId = String(selectedProject?.id || '');
      if (paidProjectId) {
        setProjects((prev) =>
          prev.map((p) => (String(p.id) === paidProjectId ? { ...p, payment_status: 'PAID' } : p)),
        );
        setSelectedProject((prev) => (prev && String(prev.id) === paidProjectId ? { ...prev, payment_status: 'PAID' } : prev));
      }

      window.dispatchEvent(new Event('payments:changed'));
      window.alert('Payment confirmed');
      setShowQRModal(false);
      setSelectedProject(null);
      setQrUrl('');
      setCurrentPaymentId('');
    } catch (e: any) {
      console.error('Confirm payment error:', e);
      window.alert(e?.message || 'Payment confirmation failed');
    } finally {
      setConfirmPayLoading(false);
    }
  };

  const getValidationStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const columns = [
    {
      key: 'project_name',
      header: 'Project Name',
      render: (value: string, item: Project) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500 line-clamp-1">{item.description}</div>
        </div>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (value: number) => <span className="font-semibold text-blue-600">${value.toLocaleString()}</span>,
    },
    {
      key: 'validation_status',
      header: 'Validation Status',
      render: (value: string) => (
        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full border ${getValidationStatusColor(value)}`}>
          <Icon
            icon={value === 'APPROVED' ? 'check' : value === 'REJECTED' ? 'close' : 'clock'}
            className="w-4 h-4"
            width={undefined}
            rotate={undefined}
            hFlip={undefined}
            vFlip={undefined}
          />
          <span className="text-sm font-medium capitalize">{value.toLowerCase()}</span>
        </div>
      ),
    },
    {
      key: 'duration_months',
      header: 'Duration',
      render: (value: number) => `${value} months`,
    },
    {
      key: 'status',
      header: 'Project Status',
      render: (value: string, item: Project) => {
        const paid = isProjectPaid(item);
        return <StatusBadge status={paid ? 'PAID' : value} />;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, item: Project) => (
        <div className="flex flex-wrap gap-2">
          <Link to={`/enterprise/projects/${item.id}`}>
            <Button text="View" className="btn-outline-dark btn-sm" />
          </Link>

          {!isProjectPaid(item) && (
            <button
              onClick={() => handlePaymentClick(item)}
              disabled={payLoading}
              className="inline-flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <Icon icon="payment" className="w-4 h-4" width={undefined} rotate={undefined} hFlip={undefined} vFlip={undefined} />
              <span>{payLoading ? 'Loading...' : 'Pay'}</span>
            </button>
          )}

          {item.validation_status === 'REJECTED' && (
            <div className="flex items-center space-x-2 text-red-600">
              <Icon icon="alert" className="w-4 h-4" width={undefined} rotate={undefined} hFlip={undefined} vFlip={undefined} />
              <span className="text-xs">Rejected</span>
            </div>
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
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-1">Manage your submitted projects</p>
        </div>
        <Link to="/enterprise/projects/create">
          <Button text="Create New Project" className="bg-primary-500 text-white" />
        </Link>
      </div>

      {/* Projects Table */}
      <Card>
        <DataTable
          data={projects}
          columns={columns}
          loading={loading}
          emptyMessage="You haven't created any projects yet."
        />
      </Card>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
          <div className="text-gray-600">Total Projects</div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="text-2xl font-bold text-yellow-600">
            {projects.filter(p => p.validation_status === 'PENDING').length}
          </div>
          <div className="text-gray-600">Waiting for Review</div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-2xl font-bold text-green-600">
            {projects.filter(p => p.validation_status === 'APPROVED').length}
          </div>
          <div className="text-gray-600">Approved</div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-2xl font-bold text-red-600">
            {projects.filter(p => p.validation_status === 'REJECTED').length}
          </div>
          <div className="text-gray-600">Rejected</div>
        </Card>
      </div>

      {/* QR Code Modal */}
      {selectedProject && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedProject(null);
            setQrUrl('');
            setCurrentPaymentId('');
          }}
          projectName={selectedProject.project_name}
          projectId={selectedProject.id}
          amount={selectedProject.budget}
          qrUrl={qrUrl}
          isLoading={payLoading && !qrUrl}
          onSimulatePaid={handleSimulatePaid}
          simulatePaidLoading={confirmPayLoading}
        />
      )}
    </div>
  );
};

export default EnterpriseProjects;
