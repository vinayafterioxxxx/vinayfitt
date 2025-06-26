import React, { useState } from 'react';
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
  TrendingUp
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, getColors } from '@/hooks/useColorScheme';

const { width } = Dimensions.get('window');

const workouts = [
  {
    id: 1,
    name: 'Full Body Strength',
    duration: '45 min',
    calories: '380 cal',
    difficulty: 'Intermediate',
    completed: false,
    color: ['#667EEA', '#764BA2'],
    colorDark: ['#1E40AF', '#3730A3'],
  },
  {
    id: 2,
    name: 'HIIT Cardio Blast',
    duration: '30 min',
    calories: '420 cal',
    difficulty: 'Advanced',
    completed: false,
    color: ['#F093FB', '#F5576C'],
    colorDark: ['#BE185D', '#BE123C'],
  },
  {
    id: 3,
    name: 'Yoga Flow',
    duration: '60 min',
    calories: '200 cal',
    difficulty: 'Beginner',
    completed: true,
    color: ['#4FACFE', '#00F2FE'],
    colorDark: ['#0284C7', '#0891B2'],
  },
];

const achievements = [
  { name: '7-Day Streak', icon: '🔥', completed: false, progress: 3 },
  { name: 'First Workout', icon: '💪', completed: true, progress: 1 },
  { name: '100 Workouts', icon: '🏆', completed: false, progress: 23 },
];

export default function CoachingScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const styles = createStyles(colors);

  const [selectedTab, setSelectedTab] = useState('workouts');

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
            {/* Weekly Progress */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>This Week</Text>
                <TrendingUp size={24} color={colors.primary} />
              </View>
              
              <View style={styles.progressGrid}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressNumber}>3</Text>
                  <Text style={styles.progressLabel}>Workouts</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressNumber}>184</Text>
                  <Text style={styles.progressLabel}>Minutes</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressNumber}>1,240</Text>
                  <Text style={styles.progressLabel}>Calories</Text>
                </View>
              </View>
            </View>

            {/* Recommended Workouts */}
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            
            {workouts.map((workout) => (
              <TouchableOpacity key={workout.id} style={styles.workoutCard}>
                <LinearGradient
                  colors={colorScheme === 'dark' ? workout.colorDark : workout.color}
                  style={styles.workoutGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.workoutContent}>
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutName}>{workout.name}</Text>
                      <View style={styles.workoutMeta}>
                        <View style={styles.metaItem}>
                          <Clock size={14} color="rgba(255, 255, 255, 0.8)" />
                          <Text style={styles.metaText}>{workout.duration}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Flame size={14} color="rgba(255, 255, 255, 0.8)" />
                          <Text style={styles.metaText}>{workout.calories}</Text>
                        </View>
                      </View>
                      <Text style={styles.difficultyText}>{workout.difficulty}</Text>
                    </View>
                    
                    <View style={styles.playButton}>
                      {workout.completed ? (
                        <Trophy size={24} color="#FFFFFF" />
                      ) : (
                        <Play size={24} color="#FFFFFF" />
                      )}
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
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
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.surface,
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: colors.text,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: colors.text,
  },
  progressLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: colors.text,
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  workoutCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  workoutGradient: {
    padding: 20,
  },
  workoutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  workoutMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  difficultyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementSummary: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  achievementProgressBar: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  achievementProgress: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: 4,
  },
  achievementCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.text,
  },
  achievementProgress: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  completedBadge: {
    width: 24,
    height: 24,
    backgroundColor: colors.success,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
});