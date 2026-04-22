import React from 'react';
// Using text icons
import Button from './Button';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false,
}) => {

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Modal
      activeModal={isOpen}
      onClose={onClose}
      noFade={false}
      disableBackdrop={false}
      className="max-w-md"
      footerContent=""
      centered={true}
      scrollContent={false}
      uncontrol={false}
      labelClass=""
      ref={null}
    >
      <div className="flex items-start">
        <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
          <span className="text-2xl">⚠️</span>
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {title}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Button
          text={confirmText}
          className={`w-full sm:ml-3 sm:w-auto ${getConfirmButtonColor()}`}
          onClick={onConfirm}
          isLoading={loading}
          disabled={loading}
          children=""
          icon=""
          loadingClass=""
          iconPosition="left"
          iconClass=""
          link=""
          div={false}
        />
        <Button
          text={cancelText}
          className="mt-3 w-full sm:mt-0 sm:w-auto bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={onClose}
          disabled={loading}
          isLoading={false}
          children=""
          icon=""
          loadingClass=""
          iconPosition="left"
          iconClass=""
          link=""
          div={false}
        />
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
