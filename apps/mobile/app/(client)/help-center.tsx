import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function HelpCenterScreen() {
  return (
    <ScrollView className="flex-1 my-10 bg-gray-50" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-900 text-start" style={{ fontFamily: 'System' }}>
          مركز المساعدة
        </Text>
        <Text className="text-gray-600 mt-2 text-start" style={{ fontFamily: 'System' }}>
          كل المساعدة اللي بدك إياها
        </Text>
      </View>

      <View className="px-6 py-4">
        <Link href="/(client)/faq" asChild>
          <TouchableOpacity className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200 flex-row items-center" activeOpacity={0.7} style={{ flexDirection: 'row' }}>
            <View className="bg-primary-100 rounded-full p-3">
              <Ionicons name="help-circle" size={24} color="#E02020" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="font-semibold text-gray-900 text-lg text-start" style={{ fontFamily: 'System' }}>
                الأسئلة الشائعة
              </Text>
              <Text className="text-gray-600 text-sm mt-1 text-start" style={{ fontFamily: 'System' }}>
                كل الأسئلة الشائعة وأجوبتها
              </Text>
            </View>
            <Ionicons name="chevron-back" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Link>

        <TouchableOpacity className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200 flex-row items-center" activeOpacity={0.7} style={{ flexDirection: 'row' }}>
          <View className="bg-green-100 rounded-full p-3">
            <Ionicons name="chatbubble" size={24} color="#16a34a" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="font-semibold text-gray-900 text-lg text-start" style={{ fontFamily: 'System' }}>
              تواصل مع الدعم
            </Text>
            <Text className="text-gray-600 text-sm mt-1 text-start" style={{ fontFamily: 'System' }}>
              تواصل مباشر مع فريق الدعم
            </Text>
          </View>
          <Ionicons name="chevron-back" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <Link href="/(client)/faq" asChild>
          <TouchableOpacity className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200 flex-row items-center" activeOpacity={0.7} style={{ flexDirection: 'row' }}>
            <View className="bg-purple-100 rounded-full p-3">
              <Ionicons name="information-circle" size={24} color="#9333ea" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="font-semibold text-gray-900 text-lg text-start" style={{ fontFamily: 'System' }}>
                عن التطبيق
              </Text>
              <Text className="text-gray-600 text-sm mt-1 text-start" style={{ fontFamily: 'System' }}>
                تعرف أكثر على تطبيقنا وخدماتنا
              </Text>
            </View>
            <Ionicons name="chevron-back" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Link>

        <Link href="/(client)/policy" asChild>
          <TouchableOpacity className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200 flex-row items-center" activeOpacity={0.7} style={{ flexDirection: 'row' }}>
            <View className="bg-orange-100 rounded-full p-3">
              <Ionicons name="shield-checkmark" size={24} color="#ea580c" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="font-semibold text-gray-900 text-lg text-start" style={{ fontFamily: 'System' }}>
                سياسة الخصوصية
              </Text>
              <Text className="text-gray-600 text-sm mt-1 text-start" style={{ fontFamily: 'System' }}>
                كيف نحمي بياناتك وخصوصيتك
              </Text>
            </View>
            <Ionicons name="chevron-back" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Quick Help */}
      <View className="px-6 pb-8">
        <View className="bg-primary-600 rounded-lg p-6">
          <View className="flex-row items-center mb-3" style={{ flexDirection: 'row' }}>
            <Ionicons name="call" size={24} color="#ffffff" />
            <Text className="text-white text-lg font-semibold ml-2 text-start" style={{ fontFamily: 'System' }}>
              تحتاج مساعدة عاجلة؟
            </Text>
          </View>
          <Text className="text-primary-50 leading-6 mb-4 text-start" style={{ fontFamily: 'System' }}>
            تواصل معنا مباشرة من خلال المحادثة في التطبيق. فريق الدعم متاح 24/7 لمساعدتك.
          </Text>
          <TouchableOpacity className="bg-white rounded-lg py-3 px-4 items-center" activeOpacity={0.8}>
            <Text className="text-primary-600 font-semibold" style={{ fontFamily: 'System' }}>
              افتح المحادثة
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}


