import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Chrome as Home, Dumbbell, MessageSquare, Play, User, Users, Apple, Shield, Briefcase } from 'lucide-react-native';
import { useColorScheme, getColors } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !profile) {
      router.replace('/(auth)/login');
    }
  }, [profile, loading]);

  if (loading || !profile) {
    return null;
  }

  // Define role-specific tab configurations
  const getTabsForRole = () => {
    const baseTabs = [
      {
        name: 'index',
        title: 'Today',
        icon: Home,
      },
    ];

    const roleTabs = {
      client: [
        ...baseTabs,
        {
          name: 'coaching',
          title: 'Coaching',
          icon: Dumbbell,
        },
        {
          name: 'on-demand',
          title: 'On-demand',
          icon: Play,
        },
        {
          name: 'inbox',
          title: 'Inbox',
          icon: MessageSquare,
        },
        {
          name: 'profile',
          title: 'You',
          icon: User,
        },
      ],
      trainer: [
        ...baseTabs,
        {
          name: 'coaching',
          title: 'Clients',
          icon: Users,
        },
        {
          name: 'on-demand',
          title: 'Programs',
          icon: Play,
        },
        {
          name: 'inbox',
          title: 'Messages',
          icon: MessageSquare,
        },
        {
          name: 'profile',
          title: 'Profile',
          icon: User,
        },
      ],
      nutritionist: [
        ...baseTabs,
        {
          name: 'coaching',
          title: 'Clients',
          icon: Users,
        },
        {
          name: 'on-demand',
          title: 'Meal Plans',
          icon: Apple,
        },
        {
          name: 'inbox',
          title: 'Messages',
          icon: MessageSquare,
        },
        {
          name: 'profile',
          title: 'Profile',
          icon: User,
        },
      ],
      admin: [
        ...baseTabs,
        {
          name: 'coaching',
          title: 'Management',
          icon: Shield,
        },
        {
          name: 'on-demand',
          title: 'System',
          icon: Play,
        },
        {
          name: 'inbox',
          title: 'Alerts',
          icon: MessageSquare,
        },
        {
          name: 'profile',
          title: 'Admin',
          icon: User,
        },
      ],
      hr: [
        ...baseTabs,
        {
          name: 'coaching',
          title: 'Staff',
          icon: Briefcase,
        },
        {
          name: 'on-demand',
          title: 'Resources',
          icon: Play,
        },
        {
          name: 'inbox',
          title: 'Messages',
          icon: MessageSquare,
        },
        {
          name: 'profile',
          title: 'Profile',
          icon: User,
        },
      ],
    };

    return roleTabs[profile.role] || roleTabs.client;
  };

  const tabs = getTabsForRole();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { 
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        }],
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ size, color }) => (
                <IconComponent size={size} color={color} />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: 4,
  },
});