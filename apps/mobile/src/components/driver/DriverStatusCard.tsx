import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Select from '@/components/ui/Select';

export type DriverStatus = 'offline' | 'available' | 'busy' | 'unavailable';

interface DriverStatusCardProps {
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

export default function DriverStatusCard({ currentStatus, onStatusChange, isLoading = false }: DriverStatusCardProps) {
  const statuses: DriverStatus[] = ['available', 'busy', 'unavailable'];

  const selectOptions = statuses.map((status) => ({
    label: statusConfig[status].label,
    value: status,
    icon: statusConfig[status].icon,
    color: statusConfig[status].color,
  }));

  return (
    <Animated.View entering={FadeInDown.duration(600)} className="mb-6">
      <View className="flex bg-white rounded-2xl p-5 shadow-sm" style={{ direction: 'rtl' }}>
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-gray-900 text-right">حالة السائق</Text>
          {/* <View className={`px-4 py-2 rounded-xl ${statusConfig[currentStatus].bgColor}`}>
            <View className="flex-row items-center gap-2">
              <Ionicons name={statusConfig[currentStatus].icon as any} size={20} color={statusConfig[currentStatus].color} />
              <Text className="font-semibold" style={{ color: statusConfig[currentStatus].color }}>
                {statusConfig[currentStatus].label}
              </Text>
            </View>
          </View> */}
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

