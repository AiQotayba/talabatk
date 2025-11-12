import { View, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { User } from '@/components/admin/user-card';
import UserGrid from '@/components/admin/UserGrid';
import Header from '@/components/ui/header';

export default function AdminDriversScreen() {
  const { data: drivers, isLoading, refetch } = useQuery({
    queryKey: ['admin-drivers'],
    queryFn: async () => {
      const response = await apiClient.get<User[]>('/admin/users?role=driver');
      return response.data || [];
    },
  });

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
    >
      <Header title="السائقين" description="جميع السائقين المسجلين" />
      <View className="px-6 mt-4" style={{ direction: 'rtl' }}>
        <UserGrid users={drivers || []} isLoading={isLoading} emptyMessage="لا يوجد سائقين" emptyIcon="car-outline" />
      </View>
    </ScrollView>
  );
}


