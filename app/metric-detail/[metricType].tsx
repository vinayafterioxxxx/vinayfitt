import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, ChevronDown } from 'lucide-react-native';
import { useColorScheme, getColors } from '@/hooks/useColorScheme';
import { router, useLocalSearchParams } from 'expo-router';
import { Metric, MetricEntry, TimeRange } from '@/types/metrics';
import { getMetric } from '@/utils/metricsStorage';

const { width } = Dimensions.get('window');

export default function MetricDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const styles = createStyles(colors);
  const { metricType } = useLocalSearchParams();

  const [metric, setMetric] = useState<Metric | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const [loading, setLoading] = useState(true);

  const timeRanges: TimeRange[] = ['1W', '1M', '2M', '1Y'];

  useEffect(() => {
    loadMetric();
  }, []);

  const loadMetric = async () => {
    try {
      const loadedMetric = await getMetric(metricType as any);
      setMetric(loadedMetric);
    } catch (error) {
      console.error('Error loading metric:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEntries = (): MetricEntry[] => {
    if (!metric) return [];
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedRange) {
      case '1W':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '2M':
        cutoffDate.setMonth(now.getMonth() - 2);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return metric.entries.filter(entry => new Date(entry.date) >= cutoffDate);
  };

  const getDateRange = (): string => {
    const entries = getFilteredEntries();
    if (entries.length === 0) return '';
    
    const dates = entries.map(e => new Date(e.date)).sort((a, b) => a.getTime() - b.getTime());
    const start = dates[0];
    const end = dates[dates.length - 1];
    
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const renderChart = () => {
    const entries = getFilteredEntries();
    if (entries.length === 0) return null;

    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const values = sortedEntries.map(e => e.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    const chartWidth = width - 80;
    const chartHeight = 120;

    return (
      <View style={styles.chartContainer}>
        <View style={[styles.chartArea, { width: chartWidth, height: chartHeight }]}>
          {sortedEntries.map((entry, index) => {
            const x = (index / (sortedEntries.length - 1)) * chartWidth;
            const y = chartHeight - ((entry.value - minValue) / range) * chartHeight;
            
            return (
              <View
                key={entry.id}
                style={[
                  styles.chartPoint,
                  {
                    left: x - 3,
                    top: y - 3,
                    backgroundColor: metric?.color || colors.primary,
                  }
                ]}
              />
            );
          })}
          
          {/* Chart line */}
          <View style={styles.chartLine} />
        </View>
        
        <View style={styles.chartLabels}>
          {sortedEntries.map((entry, index) => (
            <Text key={entry.id} style={styles.chartLabel}>
              {new Date(entry.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderHistoryList = () => {
    const entries = getFilteredEntries();
    const groupedEntries = groupEntriesByPeriod(entries);

    return (
      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <View style={styles.historyTitle}>
            <Text style={styles.historyTitleText}>{metric?.name}</Text>
            <TouchableOpacity onPress={() => router.push(`/add-metric/${metricType}`)}>
              <Plus size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.periodSelector}>
            <Text style={styles.periodText}>By Week</Text>
            <ChevronDown size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {Object.entries(groupedEntries).map(([period, periodEntries]) => (
          <TouchableOpacity key={period} style={styles.historyItem}>
            <Text style={styles.historyPeriod}>{period}</Text>
            <View style={styles.historyValue}>
              <Text style={styles.historyValueText}>
                {periodEntries[0]?.value} {metric?.unit}
              </Text>
              <ChevronDown size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const groupEntriesByPeriod = (entries: MetricEntry[]) => {
    const grouped: { [key: string]: MetricEntry[] } = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1); // Monday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Sunday
      
      const periodKey = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      
      if (!grouped[periodKey]) {
        grouped[periodKey] = [];
      }
      grouped[periodKey].push(entry);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading metric...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!metric) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Metric not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{metric.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Range Selector */}
        <View style={styles.rangeSelector}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.rangeButton,
                selectedRange === range && styles.activeRangeButton
              ]}
              onPress={() => setSelectedRange(range)}
            >
              <Text style={[
                styles.rangeButtonText,
                selectedRange === range && styles.activeRangeButtonText
              ]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Value */}
        <View style={styles.currentSection}>
          <Text style={styles.currentLabel}>CURRENT</Text>
          <Text style={styles.currentValue}>
            {metric.currentValue || 0} {metric.unit}
          </Text>
          <Text style={styles.dateRange}>{getDateRange()}</Text>
        </View>

        {/* Chart */}
        {renderChart()}

        {/* History List */}
        {renderHistoryList()}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push(`/add-metric/${metricType}`)}
      >
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.error,
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
  },
  content: {
    flex: 1,
  },
  rangeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  rangeButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeRangeButton: {
    backgroundColor: colors.textSecondary,
    borderColor: colors.textSecondary,
  },
  rangeButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  activeRangeButtonText: {
    color: '#FFFFFF',
  },
  currentSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  currentLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  currentValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    color: colors.text,
    marginBottom: 8,
  },
  dateRange: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  chartContainer: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  chartArea: {
    position: 'relative',
    marginBottom: 16,
  },
  chartPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chartLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: colors.textTertiary,
  },
  historySection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTitleText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: colors.text,
    marginRight: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 4,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  historyPeriod: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.text,
  },
  historyValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyValueText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.text,
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
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