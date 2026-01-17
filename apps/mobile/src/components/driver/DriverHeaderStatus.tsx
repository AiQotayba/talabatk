import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Select from '@/components/ui/Select';

export type DriverStatus = 'offline' | 'available' | 'busy' | 'unavailable';

interface DriverHeaderStatusProps {
  userName?: string;
  currentStatus: DriverStatus;
  onStatusChange: (status: DriverStatus) => void;
  isLoading?: boolean;
}

const statusConfig: Record<DriverStatus, { label: string; icon: string; color: string; bgColor: string }> = {
  offline: { label: 'غير متصل', icon: 'radio-button-off', color: '#6b7280', bgColor: 'bg-gray-100' },
  available: { label: 'متاح', icon: 'checkmark-circle', color: '#16a34a', bgColor: 'bg-green-100' },
  busy: { label: 'مشغول', icon: 'time', color: '#d97706', bgColor: 'bg-orange-100' },
  unavailable: { label: 'غير متاح', icon: 'close-circle', color: '#dc2626', bgColor: 'bg-red-100' },
};

export default function DriverHeaderStatus({
  userName,
  currentStatus,
  onStatusChange,
  isLoading = false
}: DriverHeaderStatusProps) {
  const statuses: DriverStatus[] = ['available', 'busy', 'unavailable'];

  const selectOptions = statuses.map((status) => ({
    label: statusConfig[status].label,
    value: status,
    icon: statusConfig[status].icon,
    color: statusConfig[status].color,
  }));

  return (
    <Animated.View entering={FadeInDown.duration(300)} className="mb-4">
      <View className="bg-white rounded-xl p-4 shadow-sm" style={{ direction: 'rtl' }}>
        <View className="flex-row items-center justify-between mb-3 gap-2">
          <View className={` rounded-lg  `}>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name={statusConfig[currentStatus].icon as any} size={24} color={statusConfig[currentStatus].color} />
              {/* <Text className="text-xs font-semibold" style={{ color: statusConfig[currentStatus].color }}>
                {statusConfig[currentStatus].label}
              </Text> */}
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900 text-start">
              {userName ? `أهلاً، ${userName}` : 'أهلاً بك'}
            </Text>
            <Text className="text-xs text-gray-500 text-start mt-1">جاهز للعمل اليوم؟</Text>
          </View>
        </View>

        <Select
          value={currentStatus}
          options={selectOptions}
          onValueChange={(value) => onStatusChange(value as DriverStatus)}
          placeholder="اختر الحالة"
          disabled={isLoading}
        />
      </View>
    </Animated.View>
  );
}


