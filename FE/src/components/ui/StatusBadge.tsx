import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig = {
  // Project statuses
  DRAFT: { color: 'gray', label: 'Draft' },
  PENDING: { color: 'yellow', label: 'Pending' },
  APPROVED: { color: 'green', label: 'Approved' },
  REJECTED: { color: 'red', label: 'Rejected' },
  IN_PROGRESS: { color: 'blue', label: 'In Progress' },
  COMPLETED: { color: 'green', label: 'Completed' },
  CANCELLED: { color: 'red', label: 'Cancelled' },
  ON_HOLD: { color: 'orange', label: 'On Hold' },

  // Payment statuses
  FAILED: { color: 'red', label: 'Failed' },
  REFUNDED: { color: 'orange', label: 'Refunded' },

  // Application statuses
  WITHDRAWN: { color: 'gray', label: 'Withdrawn' },

  // Task statuses
  TODO: { color: 'gray', label: 'To Do' },
  REVIEW: { color: 'yellow', label: 'Review' },

  // Report statuses
  SUBMITTED: { color: 'blue', label: 'Submitted' },
  REVIEWED: { color: 'purple', label: 'Reviewed' },

  // Distribution statuses
  PAID: { color: 'green', label: 'Paid' },

  // Fund advance statuses
  ADVANCED: { color: 'blue', label: 'Advanced' },
  SETTLED: { color: 'green', label: 'Settled' },

  // Company statuses
  SUSPENDED: { color: 'red', label: 'Suspended' },

  // User statuses
  ACTIVE: { color: 'green', label: 'Active' },
  INACTIVE: { color: 'red', label: 'Inactive' },
  GRADUATED: { color: 'blue', label: 'Graduated' },
  BUSY: { color: 'orange', label: 'Busy' },
};

const getStatusConfig = (status: string) => {
  return statusConfig[status as keyof typeof statusConfig] || { color: 'gray', label: status };
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = getStatusConfig(status);

  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[config.color as keyof typeof colorClasses]} ${className}`}
    >
      <span className="w-2 h-2 rounded-full bg-current mr-1.5 opacity-60"></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
