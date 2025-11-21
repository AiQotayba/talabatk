import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TimeHistoryProps {
    createdAt: string | Date;
    showIcon?: boolean;
    iconColor?: string;
    textClassName?: string;
    textStyle?: { color?: string };
    iconSize?: number;
}

export default function TimeHistory({
    createdAt,
    showIcon = true,
    iconColor = '#9ca3af',
    textClassName = 'text-gray-500 text-xs',
    textStyle,
    iconSize = 14,
}: TimeHistoryProps) {
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [isMoreThanDay, setIsMoreThanDay] = useState(false);

    useEffect(() => {
        const calculateTimeElapsed = () => {
            const now = new Date().getTime();
            const created = new Date(createdAt).getTime();
            const totalSeconds = Math.floor((now - created) / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            
            // Check if more than 24 hours
            if (hours >= 24) {
                setIsMoreThanDay(true);
                // No need to update for dates
                return;
            }
            
            setIsMoreThanDay(false);
            const minutes = Math.floor(totalSeconds / 60);
            setTimeElapsed(minutes);
            setSecondsElapsed(totalSeconds);
        };

        // Calculate once initially
        const now = new Date().getTime();
        const created = new Date(createdAt).getTime();
        const totalSeconds = Math.floor((now - created) / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        
        if (hours >= 24) {
            setIsMoreThanDay(true);
            calculateTimeElapsed(); // Set initial state
            return; // No interval needed for dates
        }
        
        // Set up interval only for digital clock (less than 24 hours)
        calculateTimeElapsed();
        const interval = setInterval(calculateTimeElapsed, 1000);
        return () => clearInterval(interval);
    }, [createdAt]);

    const formatTime = () => {
        // If more than 24 hours, show date
        if (isMoreThanDay) {
            return new Date(createdAt).toLocaleDateString('ar-SA', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        }
        
        // Format as H:MM:SS (digital clock format)
        const hours = Math.floor(secondsElapsed / 3600);
        const minutes = Math.floor((secondsElapsed % 3600) / 60);
        const seconds = secondsElapsed % 60;
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // For dates (more than 24 hours), always use gray color, ignore textStyle color
    const finalTextStyle = isMoreThanDay 
        ? { ...textStyle, color: '#6b7280' } // gray-500
        : textStyle;

    return (
        <View className="flex-row items-center gap-2">
            {showIcon && (
                <Ionicons 
                    name="time-outline" 
                    size={iconSize} 
                    color={isMoreThanDay ? '#9ca3af' : iconColor} 
                />
            )}
            <Text className={textClassName} style={finalTextStyle}>
                {formatTime()}
            </Text>
        </View>
    );
}

