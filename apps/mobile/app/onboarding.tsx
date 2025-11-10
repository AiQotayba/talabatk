import { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, ScrollView, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressIndicator } from '@/components/onboarding/progress-indicator';
import { WelcomeScreen } from '@/components/onboarding/welcome-screen';
import { FeaturesScreen } from '@/components/onboarding/features-screen';
import { TrustScreen } from '@/components/onboarding/trust-screen';
import { STORAGE_KEYS, ROUTES } from '@/utils/constants';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 3;

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(2);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = (a: number) => {
    if (a == 3) {
      AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      router.replace('/(auth)/signup');
      return;
    } else {
      setCurrentStep(a);
      scrollViewRef.current?.scrollTo({ x: a * width, animated: true });
    }
  }

  const handleSkip = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    router.replace(ROUTES.LOGIN);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const step = Math.round(offsetX / width);
    if (step !== currentStep && step >= 0 && step < TOTAL_STEPS) {
      setCurrentStep(step);
    }
  };


  return (
    <View className="flex-1 bg-white">
      {/* Header with Skip button */}
      <View className="pt-12 px-6 pb-4 flex-row justify-between items-center">
        <View style={{ width: 60 }} />
        <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        <TouchableOpacity
          onPress={handleSkip}
          className="px-4 py-2"
        >
          <Text className="text-primary-600 font-medium text-base">تخطي</Text>
        </TouchableOpacity>
      </View>

      {/* ScrollView with snap */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="center"
        style={{ direction: 'rtl', flexDirection: 'row', height: '100%' }}
      >
        <View style={{ width }}>
          <WelcomeScreen onNext={() => handleNext(1)} />
        </View>
        <View style={{ width }}>
          <FeaturesScreen onNext={() => handleNext(0)} />
        </View>
        <View style={{ width }}>
          <TrustScreen onNext={() => handleNext(3)} />
        </View>
      </ScrollView>

    </View>
  );
}

