import { View, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { User } from '@/components/admin/user-card';
import UserGrid from '@/components/admin/UserGrid';
import Header from '@/components/ui/header';

export default function AdminClientsScreen() {
  const { data: clients, isLoading, refetch } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: async () => {
      const response = await apiClient.get<User[]>('/admin/users?role=client');
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
      <Header title="العملاء" description="جميع العملاء المسجلين" />

      <View className="px-6 mt-4" style={{ direction: 'rtl' }}>
        <UserGrid users={clients || []} isLoading={isLoading} emptyMessage="لا يوجد عملاء" emptyIcon="people-outline" />
      </View>
    </ScrollView>
  );
}


