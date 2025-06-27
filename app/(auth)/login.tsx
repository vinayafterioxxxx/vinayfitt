import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Dumbbell, 
  Apple, 
  Shield, 
  Users 
} from 'lucide-react-native';
import { useColorScheme, getColors } from '@/hooks/useColorScheme';
import { useUserRole, UserRole } from '@/contexts/UserContext';
import { router } from 'expo-router';

const roles = [
  {
    id: 'client' as UserRole,
    title: 'Client',
    description: 'Track workouts, nutrition, and progress',
    icon: User,
    gradient: ['#667EEA', '#764BA2'],
    gradientDark: ['#1E40AF', '#3730A3'],
  },
  {
    id: 'trainer' as UserRole,
    title: 'Trainer',
    description: 'Manage clients and create workout plans',
    icon: Dumbbell,
    gradient: ['#F093FB', '#F5576C'],
    gradientDark: ['#BE185D', '#BE123C'],
  },
  {
    id: 'nutritionist' as UserRole,
    title: 'Nutritionist',
    description: 'Create meal plans and track nutrition',
    icon: Apple,
    gradient: ['#4FACFE', '#00F2FE'],
    gradientDark: ['#0284C7', '#0891B2'],
  },
  {
    id: 'admin' as UserRole,
    title: 'Admin',
    description: 'System administration and oversight',
    icon: Shield,
    gradient: ['#FA709A', '#FEE140'],
    gradientDark: ['#DC2626', '#F59E0B'],
  },
  {
    id: 'hr' as UserRole,
    title: 'HR',
    description: 'Manage staff and human resources',
    icon: Users,
    gradient: ['#A8EDEA', '#FED6E3'],
    gradientDark: ['#059669', '#EC4899'],
  },
];

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const styles = createStyles(colors);
  const { setUserRole, setUserName } = useUserRole();

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    setUserName(`${role.charAt(0).toUpperCase() + role.slice(1)} User`);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to VinayFit</Text>
        <Text style={styles.subtitle}>Select your role to continue</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {roles.map((role) => {
          const IconComponent = role.icon;
          return (
            <TouchableOpacity
              key={role.id}
              style={styles.roleCard}
              onPress={() => handleRoleSelect(role.id)}
            >
              <LinearGradient
                colors={colorScheme === 'dark' ? role.gradientDark : role.gradient}
                style={styles.roleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.roleContent}>
                  <View style={styles.roleIcon}>
                    <IconComponent size={32} color="#FFFFFF" />
                  </View>
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleTitle}>{role.title}</Text>
                    <Text style={styles.roleDescription}>{role.description}</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
        
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
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  roleCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  roleGradient: {
    padding: 24,
  },
  roleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  roleDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
});