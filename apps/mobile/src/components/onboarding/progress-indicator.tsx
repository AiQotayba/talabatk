import { View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <View className="flex-row-reverse gap-2 justify-center" >
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === currentStep;
        
        const animatedStyle = useAnimatedStyle(() => {
          return {
            width: withTiming(isActive ? 32 : 8, { duration: 300 }),
            opacity: withTiming(isActive ? 1 : 0.4, { duration: 300 }),
          };
        });

        return (
          <Animated.View
            key={index}
            style={[
              animatedStyle,
              {
                height: 8,
                borderRadius: 4,
                backgroundColor: isActive ? '#E02020' : '#9ca3af',
              },
            ]}
          />
        );
      })}
    </View>
  );
}

