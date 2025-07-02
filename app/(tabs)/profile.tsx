import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Settings, User, ChartBar as BarChart3, TrendingUp, Plus } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme, getColors } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { getMetrics } from '@/utils/metricsStorage';
import { MetricData } from '@/types/metrics';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const styles = createStyles(colors);

  const [metrics, setMetrics] = useState<MetricData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const loadedMetrics = await getMetrics();
      setMetrics(loadedMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const renderMetricsOverview = () => {
    const metricsWithData = Object.values(metrics).filter(metric => 
      metric.entries && metric.entries.length > 0
    );

    if (metricsWithData.length === 0) {
      return (
        <View style={styles.metricsCard}>
          <View style={styles.metricsHeader}>
            <Text style={styles.metricsTitle}>Your Metrics</Text>
            <BarChart3 size={24} color={colors.primary} />
          </View>
          <Text style={styles.metricsEmptyText}>
            Start tracking your progress by adding your first metric
          </Text>
          <TouchableOpacity 
            style={styles.addMetricsButton}
            onPress={() => router.push('/client-metrics')}
          >
            <Plus size={16} color={colors.primary} />
            <Text style={styles.addMetricsText}>Add Metrics</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.metricsCard}>
        <View style={styles.metricsHeader}>
          <Text style={styles.metricsTitle}>Your Metrics</Text>
          <TouchableOpacity onPress={() => router.push('/client-metrics')}>
            <BarChart3 size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.metricsScroll}
        >
          {metricsWithData.slice(0, 4).map((metric) => (
            <TouchableOpacity
              key={metric.id}
              style={styles.metricItem}
              onPress={() => router.push(`/metric-tracking/${metric.id}`)}
            >
              <Text style={styles.metricIcon}>{metric.icon}</Text>
              <Text style={styles.metricName}>{metric.name}</Text>
              <Text style={styles.metricValue}>
                {metric.currentValue || metric.entries[0]?.value || 0} {metric.unit}
              </Text>
              {metric.entries.length > 1 && (
                <View style={styles.metricTrend}>
                  <TrendingUp size={12} color={colors.success} />
                  <Text style={styles.metricTrendText}>
                    {metric.entries.length} entries
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={styles.viewAllMetricsButton}
          onPress={() => router.push('/client-metrics')}
        >
          <Text style={styles.viewAllMetricsText}>View All Metrics</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
          <Settings size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <User size={32} color={colors.primary} />
          </View>
          <Text style={styles.profileName}>{profile.full_name || 'User'}</Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{profile.role.toUpperCase()}</Text>
          </View>
        </View>

        {/* Metrics Overview */}
        {renderMetricsOverview()}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile-settings')}>
            <User size={20} color={colors.textSecondary} />
            <Text style={styles.menuText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/client-metrics')}>
            <BarChart3 size={20} color={colors.textSecondary} />
            <Text style={styles.menuText}>Metrics Tracking</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
            <Settings size={20} color={colors.textSecondary} />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <LogOut size={20} color={colors.error} />
            <Text style={[styles.menuText, { color: colors.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: colors.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  roleBadge: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  roleText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  metricsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: colors.text,
  },
  metricsEmptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  addMetricsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addMetricsText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
  },
  metricsScroll: {
    marginBottom: 16,
  },
  metricItem: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: colors.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricTrendText: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: colors.success,
    marginLeft: 4,
  },
  viewAllMetricsButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllMetricsText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.text,
    marginLeft: 16,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
});