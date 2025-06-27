import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUserRole } from '@/contexts/UserContext';
import { useColorScheme, getColors } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { useEffect } from 'react';

// Import role-specific views
import CoachingClientView from '@/components/coaching/CoachingClientView';

export default function CoachingScreen() {
  const { userRole } = useUserRole();
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);

  useEffect(() => {
    if (!userRole) {
      router.replace('/(auth)/login');
    }
  }, [userRole]);

  if (!userRole) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  // For now, all roles see the client view - you can create role-specific views later
  switch (userRole) {
    case 'client':
      return <CoachingClientView />;
    case 'trainer':
      return <CoachingClientView />; // TODO: Create TrainerCoachingView
    case 'nutritionist':
      return <CoachingClientView />; // TODO: Create NutritionistCoachingView
    case 'admin':
      return <CoachingClientView />; // TODO: Create AdminCoachingView
    case 'hr':
      return <CoachingClientView />; // TODO: Create HRCoachingView
    default:
      return <CoachingClientView />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
});