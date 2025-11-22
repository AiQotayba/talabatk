import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/auth.slice';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ROUTES } from '@/utils/constants';

export default function DriverProfileScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { showDialog, DialogComponent } = useConfirmDialog();

    const handleLogout = () => {
        showDialog({
            title: 'تسجيل الخروج',
            message: 'هل أنت متأكد من تسجيل الخروج؟',
            type: 'warning',
            onConfirm: () => {
                dispatch(logout() as any);
                router.push(ROUTES.LOGIN);
                router.replace(ROUTES.LOGIN);
            },
        });
    };

    return (
        <View>
            <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                <TouchableOpacity
                    className="bg-red-50 rounded-xl p-4 mb-6 flex-row items-center gap-4 justify-center"
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={24} color="#dc2626" />
                    <Text className="text-red-600 font-semibold text-base mr-2">تسجيل الخروج</Text>
                </TouchableOpacity>
            </Animated.View>
            <DialogComponent />
        </View>
    );
}

