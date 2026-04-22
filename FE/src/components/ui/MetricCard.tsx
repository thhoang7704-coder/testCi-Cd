import React from 'react';
// Using text arrows

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    label?: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  className = '',
}) => {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon && (
              <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
                {icon}
              </div>
            )}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {change && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <div className={`flex items-center ${
              change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change.type === 'increase' ? (
                <span className="mr-1">↑</span>
              ) : (
                <span className="mr-1">↓</span>
              )}
              <span className="font-medium">
                {Math.abs(change.value)}%
              </span>
              {change.label && (
                <span className="ml-1 text-gray-500">
                  {change.label}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
