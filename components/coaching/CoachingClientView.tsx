import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Dumbbell, 
  Clock, 
  Flame,
  Trophy,
  Play,
  Calendar,
  TrendingUp,
  ChevronRight,
  RotateCcw
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, getColors } from '../../hooks/useColorScheme';
import { router } from 'expo-router';
import { WorkoutPlan, WorkoutTemplate } from '@/types/workout';
import { getClientPlans, getTemplate } from '@/utils/storage';
import { getDayOfWeek, getWeekDates } from '@/utils/workoutUtils';

const { width } = Dimensions.get('window');

interface WeeklyWorkout {
  date: string;
  dayName: string;
  dayNumber: number;
  template: WorkoutTemplate | null;
  completed: boolean;
  missed: boolean;
}

const achievements = [
  { name: '7-Day Streak', icon: '🔥', completed: false, progress: 3 },
  { name: 'First Workout', icon: '💪', completed: true, progress: 1 },
  { name: '100 Workouts', icon: '🏆', completed: false, progress: 23 },
];

export default function CoachingClientView() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const styles = createStyles(colors);

  const [selectedTab, setSelectedTab] = useState('workouts');
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<WeeklyWorkout[]>([]);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklySchedule();
  }, []);

  const loadWeeklySchedule = async () => {
    try {
      const clientId = 'client-1'; // TODO: Get from user context
      const plans = await getClientPlans(clientId);
      
      // Find active plan for this week
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const activePlan = plans.find(plan => 
        plan.startDate <= todayString && plan.endDate >= todayString
      );

      if (activePlan) {
        setCurrentPlan(activePlan);
        
        // Generate this week's schedule
        const weekDates = getWeekDates(today);
        const weeklySchedule: WeeklyWorkout[] = [];
        
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const shortDayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        
        for (let i = 0; i < 7; i++) {
          const dayName = dayNames[i];
          const date = weekDates[dayName];
          const dayNumber = new Date(date).getDate();
          const templateId = activePlan.schedule[dayName];
          
          let template = null;
          if (templateId) {
            template = await getTemplate(templateId);
          }
          
          // Check if workout was completed or missed
          const isToday = date === todayString;
          const isPast = new Date(date) < new Date(todayString);
          const completed = false; // TODO: Check from workout sessions
          const missed = isPast && templateId && !completed;
          
          weeklySchedule.push({
            date,
            dayName: shortDayNames[i],
            dayNumber,
            template,
            completed,
            missed
          });
        }
        
        setWeeklyWorkouts(weeklySchedule);
      }
    } catch (error) {
      console.error('Error loading weekly schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayPress = (workout: WeeklyWorkout) => {
    if (workout.template) {
      router.push(`/training-day/${workout.date}?templateId=${workout.template.id}`);
    }
  };

  const handleTrainingPress = () => {
    router.push('/training-schedule');
  };

  const getWorkoutCount = () => {
    return weeklyWorkouts.filter(w => w.template !== null).length;
  };

  const renderWeeklyCalendar = () => (
    <View style={styles.calendarSection}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={handleTrainingPress} style={styles.trainingHeader}>
          <Text style={styles.calendarTitle}>Training (this week)</Text>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.weekContainer}>
        {weeklyWorkouts.map((workout, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              workout.template && styles.activeDayButton,
              workout.completed && styles.completedDayButton,
              workout.missed && styles.missedDayButton
            ]}
            onPress={() => handleDayPress(workout)}
            disabled={!workout.template}
          >
            <Text style={[
              styles.dayName,
              workout.template && styles.activeDayName,
              workout.completed && styles.completedDayName,
              workout.missed && styles.missedDayName
            ]}>
              {workout.dayName}
            </Text>
            <Text style={[
              styles.dayNumber,
              workout.template && styles.activeDayNumber,
              workout.completed && styles.completedDayNumber,
              workout.missed && styles.missedDayNumber
            ]}>
              {workout.dayNumber.toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.weekSummary}>
        You have {getWorkoutCount()} workouts this week!
      </Text>
    </View>
  );

  const renderTaskSection = () => (
    <View style={styles.taskSection}>
      <Text style={styles.taskTitle}>Task (last 7 days)</Text>
      <Text style={styles.taskMessage}>There are no tasks</Text>
    </View>
  );

  const renderMacrosSection = () => (
    <View style={styles.macrosSection}>
      <Text style={styles.macrosTitle}>Macros</Text>
      <View style={styles.macrosContent}>
        <View style={styles.macrosText}>
          <Text style={styles.macrosDescription}>
            Start by setting your daily goal
          </Text>
          <TouchableOpacity style={styles.macrosButton} onPress={() => router.push('/set-macros-goal')}>
            <Text style={styles.macrosButtonText}>Set daily goal</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.macrosEmoji}>🥗🍎🥕</Text>
      </View>
    </View>
  );

  const renderResourcesSection = () => (
    <View style={styles.resourcesSection}>
      <Text style={styles.resourcesTitle}>Resources</Text>
      <View style={styles.resourcesGrid}>
        <TouchableOpacity style={styles.resourceCard}>
          <Text style={styles.resourceTitle}>Welcome Kit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resourceCard}>
          <Text style={styles.resourceTitle}>Nutrition Resources</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resourceCard}>
          <Text style={styles.resourceTitle}>Other Resources</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your training schedule...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Coaching</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'workouts' && styles.activeTab]}
            onPress={() => setSelectedTab('workouts')}
          >
            <Text style={[styles.tabText, selectedTab === 'workouts' && styles.activeTabText]}>
              Workouts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'achievements' && styles.activeTab]}
            onPress={() => setSelectedTab('achievements')}
          >
            <Text style={[styles.tabText, selectedTab === 'achievements' && styles.activeTabText]}>
              Achievements
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {selectedTab === 'workouts' ? (
          <>
            {/* Weekly Training Calendar */}
            {renderWeeklyCalendar()}

            {/* Task Section */}
            {renderTaskSection()}

            {/* Macros Section */}
            {renderMacrosSection()}

            {/* Resources Section */}
            {renderResourcesSection()}
          </>
        ) : (
          <>
            {/* Achievement Progress */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Your Progress</Text>
                <Trophy size={24} color={colors.warning} />
              </View>
              
              <Text style={styles.achievementSummary}>
                You've unlocked 1 out of 3 achievements. Keep going!
              </Text>
              
              <View style={styles.achievementProgressBar}>
                <View style={[styles.achievementProgress, { width: '33.33%' }]} />
              </View>
            </View>

            {/* Achievement List */}
            <Text style={styles.sectionTitle}>Achievements</Text>
            
            {achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                </View>
                
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementProgress}>
                    {achievement.completed 
                      ? 'Completed!' 
                      : `${achievement.progress}/${achievement.name === '7-Day Streak' ? 7 : achievement.name === '100 Workouts' ? 100 : 1}`
                    }
                  </Text>
                </View>
                
                {achievement.completed && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓</Text>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: colors.text,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors