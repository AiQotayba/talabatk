import ToastComponent from 'react-native-toast-message';

export const Toast = {
    success: (title: string, message?: string) => {
        ToastComponent.show({
            type: 'success',
            text1: title,
            text2: message,
            position: 'top',
            visibilityTime: 3000,
        });
    },
    error: (title: string, message?: string) => {
        ToastComponent.show({
            type: 'error',
            text1: title,
            text2: message,
            position: 'top',
            visibilityTime: 4000,
        });
    },
    info: (title: string, message?: string) => {
        ToastComponent.show({
            type: 'info',
            text1: title,
            text2: message,
            position: 'top',
            visibilityTime: 3000,
        });
    },
    warning: (title: string, message?: string) => {
        ToastComponent.show({
            type: 'warning',
            text1: title,
            text2: message,
            position: 'top',
            visibilityTime: 3000,
        });
    },
};

