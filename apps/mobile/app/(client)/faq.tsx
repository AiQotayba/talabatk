import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/ui/header';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'كيف أطلب أي حاجة؟',
    answer: 'بس افتح التطبيق واكتب اسم الشيء اللي بدك إياه. ما في قوائم محددة، اكتب أي حاجة وفرقنا برد عليك ويخبرك عن السعر والتوفر.',
  },
  {
    question: 'كم يستغرق التوصيل؟',
    answer: 'متوسط وقت التوصيل 10-15 دقيقة. المندوب بيوصللك بسرعة وبقدر تتواصل معه مباشرة وتعرف وين وصل.',
  },
  {
    question: 'كيف أدفع؟',
    answer: 'تقدر تدفع عند الاستلام أو تستخدم المحفظة الرقمية في التطبيق. الدفع عند الاستلام متاح في معظم الطلبات.',
  },
  {
    question: 'ماذا لو لم أكن راضياً عن الطلب؟',
    answer: 'تواصل مع فريق الدعم مباشرة من خلال المحادثة. بنحل المشكلة بسرعة ونضمن رضاك التام.',
  },
  {
    question: 'هل يمكنني إلغاء الطلب؟',
    answer: 'نعم، تقدر تلغي الطلب قبل ما يبدأ المندوب بالتوصيل. بس تواصل مع فريق الدعم وهم بيعملوا الإلغاء.',
  },
  {
    question: 'كيف أتتبع موقع المندوب؟',
    answer: 'بعد تأكيد الطلب، رح تشوف موقع المندوب على الخريطة في الوقت الحقيقي. المندوب كمان بيكتبلك ويخبرك متى رح يوصل.',
  },
  {
    question: 'هل التطبيق آمن؟',
    answer: 'نعم، التطبيق آمن ومحمي. كل بياناتك مشفرة ومحمية. آلاف الناس بيستخدموه يومياً بثقة تامة.',
  },
  {
    question: 'كيف أتصل بفريق الدعم؟',
    answer: 'من خلال المحادثة في التطبيق. فريق الدعم متاح طول الوقت وبرد عليك بسرعة لحل أي مشكلة.',
  },
];

export default function FAQScreen() {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <ScrollView className="flex-1 my-10 bg-gray-50" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
      <Header title="الأسئلة الشائعة" description="كل الأسئلة اللي ممكن تسألها" />

      <View className="px-6 py-4">
        {faqs.map((faq, index) => (
          <View key={index} className="mb-3">
            <TouchableOpacity
              onPress={() => toggleItem(index)}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-between" style={{ flexDirection: 'row' }}>
                <View className="flex-1 pl-3">
                  <Text className="text-gray-900 font-semibold text-base text-start" style={{ fontFamily: 'System' }}>
                    {faq.question}
                  </Text>
                </View>
                <Ionicons
                  name={expandedItems.has(index) ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#6b7280"
                />
              </View>

              {expandedItems.has(index) && (
                <View className="mt-3 pt-3 border-t border-gray-200">
                  <Text className="text-gray-700 leading-6 text-start" style={{ fontFamily: 'System' }}>
                    {faq.answer}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Contact Section */}
      <View className="px-6 pb-8">
        <View className="bg-primary-50 rounded-lg p-6 border border-primary-100">
          <View className="flex-row items-center mb-3" style={{ flexDirection: 'row' }}>
            <Ionicons name="help-circle" size={24} color="#E02020" />
            <Text className="text-lg font-semibold text-gray-900 ml-2 text-start" style={{ fontFamily: 'System' }}>
              ما لقيت جواب لسؤالك؟
            </Text>
          </View>
          <Text className="text-gray-700 leading-6 mb-4 text-start" style={{ fontFamily: 'System' }}>
            تواصل مع فريق الدعم مباشرة من خلال المحادثة في التطبيق. فريقنا متاح طول الوقت وبرد عليك بسرعة.
          </Text>
          <TouchableOpacity className="bg-primary-600 rounded-lg py-3 px-4 items-center" activeOpacity={0.8}>
            <Text className="text-white font-semibold" style={{ fontFamily: 'System' }}>
              تواصل مع الدعم
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

