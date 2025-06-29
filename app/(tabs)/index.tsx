import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme, getColors } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { useEffect } from 'react';

// Import all role-specific views
import TodayClientView from '@/components/today/TodayClientView';
import TodayTrainerView from '@/components/today/TodayTrainerView';
import TodayNutritionistView from '@/components/today/TodayNutritionistView';
import TodayAdminView from '@/components/today/TodayAdminView';
import TodayHRView from '@/components/today/TodayHRView';

export default function TodayScreen() {
  const { profile, loading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);

  useEffect(() => {
    if (!loading && !profile) {
      router.replace('/(auth)/login');
    }
  }, [profile, loading]);

  if (loading || !profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  // Render appropriate view based on user role
  switch (profile.role) {
    case 'client':
      return <TodayClientView />;
    case 'trainer':
      return <TodayTrainerView />;
    case 'nutritionist':
      return <TodayNutritionistView />;
    case 'admin':
      return <TodayAdminView />;
    case 'hr':
      return <TodayHRView />;
    default:
      return <TodayClientView />;
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