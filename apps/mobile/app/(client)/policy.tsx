import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PolicyScreen() {
  return (
    <ScrollView className="flex-1 my-10 bg-white" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
      <View className="px-6 py-8">
        {/* Header */}
        <View className="mb-6">
          <View className="flex-row items-center mb-2" style={{ flexDirection: 'row' }}>
            <Ionicons name="shield-checkmark" size={28} color="#E02020" />
            <Text className="text-3xl font-bold text-gray-900 ml-2 text-start" style={{ fontFamily: 'System' }}>
              سياسة الخصوصية
            </Text>
          </View>
          <Text className="text-gray-600 text-sm text-start" style={{ fontFamily: 'System' }}>
            آخر تحديث: ديسمبر 2024
          </Text>
        </View>

        {/* مقدمة */}
        <View className="mb-6">
          <Text className="text-gray-700 leading-6 text-start" style={{ fontFamily: 'System' }}>
            نحن في تطبيق التوصيل السوري نلتزم بحماية خصوصيتك وبياناتك الشخصية. هذه السياسة توضح كيف نجمع ونستخدم ونحمي معلوماتك.
          </Text>
        </View>

        {/* البيانات التي نجمعها */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-3 text-start" style={{ fontFamily: 'System' }}>
            البيانات التي نجمعها
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-start" style={{ flexDirection: 'row' }}>
              <View className="ml-2 mt-1">
                <Ionicons name="checkmark-circle" size={20} color="#E02020" />
              </View>
              <Text className="flex-1 text-gray-700 leading-6 text-start" style={{ fontFamily: 'System' }}>
                الاسم ورقم الهاتف والبريد الإلكتروني
              </Text>
            </View>
            <View className="flex-row items-start" style={{ flexDirection: 'row' }}>
              <View className="ml-2 mt-1">
                <Ionicons name="checkmark-circle" size={20} color="#E02020" />
              </View>
              <Text className="flex-1 text-gray-700 leading-6 text-start" style={{ fontFamily: 'System' }}>
                عنوان التوصيل والموقع الجغرافي
              </Text>
            </View>
            <View className="flex-row items-start" style={{ flexDirection: 'row' }}>
              <View className="ml-2 mt-1">
                <Ionicons name="checkmark-circle" size={20} color="#E02020" />
              </View>
              <Text className="flex-1 text-gray-700 leading-6 text-start" style={{ fontFamily: 'System' }}>
                معلومات الطلبات والتواصل
              </Text>
            </View>
          </View>
        </View>

        {/* كيف نستخدم البيانات */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-3 text-start" style={{ fontFamily: 'System' }}>
            كيف نستخدم بياناتك
          </Text>
          <View className="space-y-3">
            <Text className="text-gray-700 leading-6 text-start" style={{ fontFamily: 'System' }}>
              • معالجة وتنفيذ طلباتك
            </Text>
            <Text className="text-gray-700 leading-6 text-start" style={{ fontFamily: 'System' }}>
              • التواصل معك حول طلباتك
            </Text>
            <Text className="text-gray-700 leading-6 text-start" style={{ fontFamily: 'System' }}>
              • تحسين خدماتنا وتجربتك
            </Text>
            <Text className="text-gray-700 leading-6 text-start" style={{ fontFamily: 'System' }}>
              • إرسال تحديثات مهمة حول التطبيق
            </Text>
          </View>
        </View>

        {/* حماية البيانات */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-3 text-start" style={{ fontFamily: 'System' }}>
            حماية بياناتك
          </Text>
          <Text className="text-gray-700 leading-6 mb-3 text-start" style={{ fontFamily: 'System' }}>
            نستخدم تقنيات حماية متقدمة لتأمين بياناتك:
          </Text>
          <View className="bg-primary-50 rounded-lg p-4 border border-primary-100">
            <Text className="text-gray-700 leading-6 text-start" style={{ fontFamily: 'System' }}>
              ✓ تشفير البيانات أثناء النقل والتخزين{'\n'}
              ✓ حماية من الوصول غير المصرح به{'\n'}
              ✓ نسخ احتياطية آمنة{'\n'}
              ✓ مراجعة دورية لأنظمة الأمان
            </Text>
          </View>
        </View>

        {/* مشاركة البيانات */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-3 text-start" style={{ fontFamily: 'System' }}>
            مشاركة البيانات
          </Text>
          <Text className="text-gray-700 leading-6 text-start" style={{ fontFamily: 'System' }}>
            نحن لا نبيع بياناتك لأي طرف ثالث. نشارك المعلومات فقط مع المندوبين وفريق الدعم لتنفيذ طلباتك.
          </Text>
        </View>

        {/* حقوقك */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-3 text-start" style={{ fontFamily: 'System' }}>
            حقوقك
          </Text>
          <View className="space-y-2">
              <Text className="text-gray-700 leading-6 text-start" style={{ fontFamily: 'System' }}>
              • حق الوصول إلى بياناتك
            </Text>
            <Text className="text-gray-700 leading-6 text-start" style={{ fontFamily: 'System' }}>
              • حق تصحيح البيانات
            </Text>
            <Text className="text-gray-700 leading-6 text-start" style={{ fontFamily: 'System' }}>
              • حق حذف حسابك وبياناتك
            </Text>
          </View>
        </View>

        {/* التواصل */}
        <View className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-2 text-start" style={{ fontFamily: 'System' }}>
            أسئلة أو استفسارات؟
          </Text>
          <Text className="text-gray-700 leading-6 text-start" style={{ fontFamily: 'System' }}>
            إذا كان لديك أي أسئلة حول سياسة الخصوصية، يمكنك التواصل معنا من خلال مركز المساعدة في التطبيق.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}



