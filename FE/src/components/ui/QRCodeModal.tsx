import React from 'react';
import Icon from './Icon';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectId: string;
  amount?: number;
  qrUrl?: string;
  isLoading?: boolean;

  /** Optional: enable a confirm payment action from the modal. */
  onSimulatePaid?: () => void;
  simulatePaidLoading?: boolean;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  projectName,
  projectId,
  amount,
  qrUrl,
  isLoading,
  onSimulatePaid,
  simulatePaidLoading,
}) => {
  if (!isOpen) return null;

  const resolvedQrUrl = qrUrl || "/assets/images/all-img/QR.jpg";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Payment QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon icon="close" className="w-6 h-6" width={undefined} rotate={undefined} hFlip={undefined} vFlip={undefined} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Project Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Project</p>
            <p className="font-semibold text-gray-900">{projectName}</p>
            {amount && (
              <>
                <p className="text-sm text-gray-600 mt-2">Amount</p>
                <p className="font-semibold text-gray-900">${amount.toLocaleString()}</p>
              </>
            )}
          </div>

          {/* QR Code */}
          <div className="flex justify-center bg-gray-50 p-6 rounded-lg">
            {isLoading ? (
              <div className="text-sm text-gray-600">Generating QR...</div>
            ) : (
              <img
                src={resolvedQrUrl}
                alt="Payment QR Code"
                className="w-48 h-48 object-cover rounded"
              />
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Scan the QR code</span> with your mobile banking app to complete the payment.
            </p>
          </div>

          {/* Reference */}
          <div className="text-center text-sm text-gray-600">
            <p>Reference ID: <span className="font-mono font-semibold">{projectId}</span></p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="flex-1 min-w-[120px] px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
          {onSimulatePaid ? (
            <button
              onClick={onSimulatePaid}
              className="flex-1 min-w-[180px] px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-60"
              disabled={Boolean(isLoading) || Boolean(simulatePaidLoading)}
            >
              {simulatePaidLoading ? 'Paying…' : 'Pay'}
            </button>
          ) : null}
          <button
            onClick={() => {
              // Save QR code functionality
              const link = document.createElement('a');
              link.href = resolvedQrUrl;
              link.download = `payment-qr-${projectId}.jpg`;
              link.click();
            }}
            className="flex-1 min-w-[140px] px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            disabled={Boolean(isLoading)}
          >
            Download QR
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
