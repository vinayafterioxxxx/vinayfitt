import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Apple, 
  Users, 
  Calendar, 
  TrendingUp,
  Clock,
  MessageSquare,
  Plus,
  ChefHat,
  Search,
  Filter
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, getColors } from '../../hooks/useColorScheme';

const clients = [
  {
    id: 1,
    name: 'Maria Garcia',
    lastMeal: 'Today',
    compliance: 88,
    status: 'active',
    avatar: '👩‍🍳',
  },
  {
    id: 2,
    name: 'David Lee',
    lastMeal: '2 days ago',
    compliance: 65,
    status: 'needs-attention',
    avatar: '👨‍💼',
  },
  {
    id: 3,
    name: 'Anna Smith',
    lastMeal: 'Yesterday',
    compliance: 92,
    status: 'active',
    avatar: '👩‍🎨',
  },
];

const upcomingConsultations = [
  { id: 1, client: 'Maria Garcia', time: '11:00 AM', type: 'Meal Plan Review' },
  { id: 2, client: 'David Lee', time: '1:30 PM', type: 'Initial Consultation' },
  { id: 3, client: 'Anna Smith', time: '3:00 PM', type: 'Progress Check' },
];

export default function CoachingNutritionistView() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const styles = createStyles(colors);

  const [selectedTab, setSelectedTab] = useState('clients');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nutrition Coaching</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Search size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Filter size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'clients' && styles.activeTab]}
          onPress={() => setSelectedTab('clients')}
        >
          <Text style={[styles.tabText, selectedTab === 'clients' && styles.activeTabText]}>
            Clients
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'consultations' && styles.activeTab]}
          onPress={() => setSelectedTab('consultations')}
        >
          <Text style={[styles.tabText, selectedTab === 'consultations' && styles.activeTabText]}>
            Consultations
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {selectedTab === 'clients' ? (
          <>
            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${colors.primary}15` }]}>
                  <Users size={20} color={colors.primary} />
                </View>
                <Text style={styles.statNumber}>18</Text>
                <Text style={styles.statLabel}>Active Clients</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${colors.success}15` }]}>
                  <TrendingUp size={20} color={colors.success} />
                </View>
                <Text style={styles.statNumber}>87%</Text>
                <Text style={styles.statLabel}>Avg Compliance</Text>
              </View>
            </View>

            {/* Client List */}
            <Text style={styles.sectionTitle}>Your Clients</Text>
            
            {clients.map((client) => (
              <TouchableOpacity key={client.id} style={styles.clientCard}>
                <View style={styles.clientAvatar}>
                  <Text style={styles.clientAvatarText}>{client.avatar}</Text>
                </View>
                
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.clientLastMeal}>Last meal logged: {client.lastMeal}</Text>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBackground}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${client.compliance}%`,
                            backgroundColor: client.status === 'active' ? colors.success : colors.warning
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{client.compliance}%</Text>
                  </View>
                </View>
                
                <View style={styles.clientActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <MessageSquare size={16} color={colors.primary} />
                  </TouchableOpacity>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: client.status === 'active' ? colors.success : colors.warning }
                  ]}>
                    <Text style={styles.statusText}>
                      {client.status === 'active' ? 'On Track' : 'Needs Help'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            {/* Today's Consultations Overview */}
            <LinearGradient
              colors={colorScheme === 'dark' ? ['#0284C7', '#0891B2'] : ['#4FACFE', '#00F2FE']}
              style={styles.overviewCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.overviewContent}>
                <Text style={styles.overviewLabel}>TODAY'S CONSULTATIONS</Text>
                <Text style={styles.overviewNumber}>3/6</Text>
                <Text style={styles.overviewMessage}>3 consultations remaining</Text>
              </View>
            </LinearGradient>

            {/* Upcoming Consultations */}
            <Text style={styles.sectionTitle}>Upcoming Consultations</Text>
            
            {upcomingConsultations.map((consultation) => (
              <TouchableOpacity key={consultation.id} style={styles.consultationCard}>
                <View style={styles.consultationTime}>
                  <Clock size={16} color={colors.textSecondary} />
                  <Text style={styles.consultationTimeText}>{consultation.time}</Text>
                </View>
                <View style={styles.consultationInfo}>
                  <Text style={styles.consultationClient}>{consultation.client}</Text>
                  <Text style={styles.consultationType}>{consultation.type}</Text>
                </View>
                <TouchableOpacity style={styles.consultationAction}>
                  <MessageSquare size={20} color={colors.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Plus size={24} color="#FFFFFF" />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: colors.text,
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  clientCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  clientAvatarText: {
    fontSize: 20,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  clientLastMeal: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: colors.textSecondary,
    minWidth: 30,
  },
  clientActions: {
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  overviewCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 24,
  },
  overviewContent: {
    alignItems: 'flex-start',
  },
  overviewLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  overviewNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  overviewMessage: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  consultationCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  consultationTime: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  consultationTimeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  consultationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  consultationClient: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  consultationType: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  consultationAction: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
});