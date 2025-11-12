import { createContext, useContext, useState, ReactNode } from 'react';
import Snackbar, { SnackbarType } from '@/components/ui/Snackbar';

interface ToastContextType {
    showToast: (message: string, type?: SnackbarType, duration?: number) => void;
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showInfo: (message: string) => void;
    showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<{
        visible: boolean;
        message: string;
        type: SnackbarType;
        duration: number;
    }>({
        visible: false,
        message: '',
        type: 'info',
        duration: 3000,
    });

    const showToast = (message: string, type: SnackbarType = 'info', duration: number = 3000) => {
        setToast({ visible: true, message, type, duration });
    };

    const showSuccess = (message: string) => showToast(message, 'success');
    const showError = (message: string) => showToast(message, 'error');
    const showInfo = (message: string) => showToast(message, 'info');
    const showWarning = (message: string) => showToast(message, 'warning');

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
            {children}
            <Snackbar
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
            />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

