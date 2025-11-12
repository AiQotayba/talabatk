import { useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface UseConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
}

export function useConfirmDialog() {
  const [dialog, setDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void | Promise<void>;
    isLoading: boolean;
  }>({
    visible: false,
    title: '',
    message: '',
    confirmText: 'نعم',
    cancelText: 'لا',
    type: 'info',
    onConfirm: () => {},
    isLoading: false,
  });

  const showDialog = (options: UseConfirmDialogOptions) => {
    setDialog({
      visible: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'نعم',
      cancelText: options.cancelText || 'لا',
      type: options.type || 'info',
      onConfirm: async () => {
        setDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          await options.onConfirm();
        } finally {
          setDialog((prev) => ({ ...prev, visible: false, isLoading: false }));
        }
      },
      isLoading: false,
    });
  };

  const hideDialog = () => {
    setDialog((prev) => ({ ...prev, visible: false, isLoading: false }));
  };

  const DialogComponent = () => (
    <ConfirmDialog
      visible={dialog.visible}
      title={dialog.title}
      message={dialog.message}
      confirmText={dialog.confirmText}
      cancelText={dialog.cancelText}
      type={dialog.type}
      onConfirm={dialog.onConfirm}
      onCancel={hideDialog}
      isLoading={dialog.isLoading}
    />
  );

  return { showDialog, DialogComponent };
}

