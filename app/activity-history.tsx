import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  ChevronDown,
  Clock,
  Dumbbell,
  Star,
  ArrowUp
} from 'lucide-react-native';
import { useColorScheme, getColors } from '@/hooks/useColorScheme';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface CalendarDay {
  date: number;
  dayOfWeek: string;
  hasActivity: boolean;
  isToday: boolean;
  isSelected: boolean;
}

interface ActivityEntry {
  id: string;
  date: string;
  name: string;
  duration: string;
  timeRange: string;
  exerciseCount?: number;
  rating?: {
    text: string;
    emoji: string;
  };
  type: 'workout' | 'activity';
}

export default function ActivityHistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const styles = createStyles(colors);

  const [selectedDate, setSelectedDate] = useState(10);
  const [currentWeek, setCurrentWeek] = useState(0);

  // Generate calendar days for the current week
  const generateCalendarDays = (): CalendarDay[] => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const dates = [9, 10, 11, 12, 13, 14, 15];
    const activeDates = [10]; // Days with activities
    
    return dates.map((date, index) => ({
      date,
      dayOfWeek: days[index],
      hasActivity: activeDates.includes(date),
      isToday: date === 10,
      isSelected: date === selectedDate,
    }));
  };

  // Sample activity data
  const activityHistory: ActivityEntry[] = [
    {
      id: '1',
      date: 'JUN 10',
      name: 'Legs',
      duration: '4 mins',
      timeRange: '3:46 PM - 3:50 PM',
      exerciseCount: 9,
      rating: {
        text: 'Too Difficult',
        emoji: '😵'
      },
      type: 'workout'
    }
  ];

  const calendarDays = generateCalendarDays();

  const handleDateSelect = (date: number) => {
    setSelectedDate(date);
  };

  const renderCalendarDay = (day: CalendarDay) => (
    <TouchableOpacity
      key={day.date}
      style={[
        styles.calendarDay,
        day.isSelected && styles.selectedDay,
        day.isToday && !day.isSelected && styles.todayDay
      ]}
      onPress={() => handleDateSelect(day.date)}
    >
      <Text style={[
        styles.dayOfWeek,
        day.isSelected && styles.selectedDayText
      ]}>
        {day.dayOfWeek}
      </Text>
      <Text style={[
        styles.dayDate,
        day.isSelected && styles.selectedDayText,
        day.isToday && !day.isSelected && styles.todayText
      ]}>
        {day.date}
      </Text>
      {day.hasActivity && !day.isSelected && (
        <View style={styles.activityDot} />
      )}
    </TouchableOpacity>
  );

  const renderActivityEntry = (activity: ActivityEntry) => (
    <View key={activity.id} style={styles.activityEntry}>
      <View style={styles.activityHeader}>
        <View style={styles.activityDot} />
        <Text style={styles.activityDate}>{activity.date}</Text>
      </View>
      
      <View style={styles.activityCard}>
        <Text style={styles.activityName}>{activity.name}</Text>
        
        <View style={styles.activityDetails}>
          <View style={styles.activityDetail}>
            <Clock size={16} color={colors.textSecondary} />
            <Text style={styles.activityDetailText}>
              {activity.duration} • {activity.timeRange}
            </Text>
          </View>
          
          {activity.exerciseCount && (
            <View style={styles.activityDetail}>
              <Dumbbell size={16} color={colors.textSecondary} />
              <Text style={styles.activityDetailText}>
                {activity.exerciseCount} exercises tracked
              </Text>
            </View>
          )}
          
          {activity.rating && (
            <View style={styles.activityDetail}>
              <Star size={16} color={colors.textSecondary} />
              <Text style={styles.activityDetailText}>
                Rating: {activity.rating.text} {activity.rating.emoji}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderEmptyDay = (date: string) => (
    <View key={date} style={styles.emptyDay}>
      <View style={styles.emptyDayHeader}>
        <View style={styles.emptyActivityDot} />
        <Text style={styles.emptyActivityDate}>{date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
        <TouchableOpacity style={styles.filterButton}>
          <ChevronDown size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Week View */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarWeek}>
            {calendarDays.map(renderCalendarDay)}
          </View>
        </View>

        {/* Activity Timeline */}
        <View style={styles.timeline}>
          {/* Activities for selected date */}
          {activityHistory
            .filter(activity => activity.date === 'JUN 10' && selectedDate === 10)
            .map(renderActivityEntry)}
          
          {/* Empty days */}
          {renderEmptyDay('JUN 13')}
          {renderEmptyDay('JUN 12')}
          {renderEmptyDay('JUN 11')}
          {renderEmptyDay('JUN 9')}
          {renderEmptyDay('JUN 8')}
          {renderEmptyDay('JUN 7')}
          {renderEmptyDay('JUN 6')}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <ArrowUp size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  filterButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  calendarWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarDay: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    minWidth: 40,
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  todayDay: {
    backgroundColor: colors.surfaceSecondary,
  },
  dayOfWeek: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dayDate: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.text,
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  todayText: {
    color: colors.primary,
  },
  activityDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  timeline: {
    paddingHorizontal: 20,
  },
  activityEntry: {
    marginBottom: 32,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityDate: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginLeft: 16,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  activityName: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  activityDetails: {
    gap: 12,
  },
  activityDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityDetailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  emptyDay: {
    marginBottom: 32,
  },
  emptyDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyActivityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
  },
  emptyActivityDate: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: colors.textTertiary,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: colors.textSecondary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
});