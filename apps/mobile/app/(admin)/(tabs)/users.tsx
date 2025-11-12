import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import UserGrid from '@/components/admin/UserGrid';
import Header from '@/components/ui/header';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'driver' | 'admin';
  profile_photo_url?: string;
}

export default function AdminUsersScreen() {
  const router = useRouter();

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await apiClient.get<User[]>('/admin/users');
      return response.data || [];
    },
  });

  // const clients = users?.filter((u) => u.role === 'client') || [];
  // const drivers = users?.filter((u) => u.role === 'driver') || [];

  return (
    <ScrollView
      className="flex-1 bg-gray-50 mt-8"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
    >
      <Header title="إدارة المستخدمين" description="العملاء والسائقين" />

      <View className="px-6 mt-4" style={{ direction: 'rtl' }}>
        {/* Clients Section */}
        <View className="mb-6">
          {/* <Tabs */}

          <UserGrid users={users || []} isLoading={isLoading} emptyMessage="لا يوجد عملاء" emptyIcon="people-outline" />

        </View>

      </View>

    </ScrollView>
  );
}


