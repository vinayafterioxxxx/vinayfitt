import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useColorScheme, getColors } from '@/hooks/useColorScheme';
import { router, useLocalSearchParams } from 'expo-router';
import { Metric, MetricEntry, TimeRange } from '@/types/metrics';
import { getMetric } from '@/utils/metricsStorage';

const { width } = Dimensions.get('window');

interface ChartPoint {
  x: number;
  y: number;
  value: number;
  date: string;
}

interface GroupedEntry {
  period: string;
  entries: MetricEntry[];
  averageValue: number;
  latestValue: number;
  startDate: string;
  endDate: string;
}

export default function MetricTrackingScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const styles = createStyles(colors);
  const { metricType } = useLocalSearchParams();

  const [metric, setMetric] = useState<Metric | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const [selectedPeriod, setSelectedPeriod] = useState('By Week');
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [currentRangeIndex, setCurrentRangeIndex] = useState(0);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MetricEntry[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);

  const timeRanges: TimeRange[] = ['1W', '1M', '2M', '1Y'];
  const periodOptions = ['By Week', 'By Month', 'By Year'];

  useEffect(() => {
    loadMetric();
  }, [metricType]);

  useEffect(() => {
    if (metric) {
      updateFilteredData();
    }
  }, [metric, selectedRange, currentRangeIndex]);

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

  const getDateRangeForIndex = (range: TimeRange, index: number): { start: Date; end: Date } => {
    const now = new Date();
    const end = new Date(now);
    const start = new Date(now);

    // Calculate the range duration
    let rangeDays = 0;
    switch (range) {
      case '1W':
        rangeDays = 7;
        break;
      case '1M':
        rangeDays = 30;
        break;
      case '2M':
        rangeDays = 60;
        break;
      case '1Y':
        rangeDays = 365;
        break;
    }

    // Move the range back by index periods
    const totalDaysBack = rangeDays * (index + 1);
    end.setDate(now.getDate() - (rangeDays * index));
    start.setDate(now.getDate() - totalDaysBack);

    return { start, end };
  };

  const updateFilteredData = () => {
    if (!metric || !metric.entries) return;

    const { start, end } = getDateRangeForIndex(selectedRange, currentRangeIndex);
    
    const filtered = metric.entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });

    // Sort by date (oldest first for chart)
    const sortedEntries = [...filtered].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setFilteredEntries(sortedEntries);
    updateChartData(sortedEntries);
  };

  const updateChartData = (entries: MetricEntry[]) => {
    if (entries.length === 0) {
      setChartData([]);
      return;
    }

    const values = entries.map(e => e.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    const chartWidth = width - 120;
    const chartHeight = 200;

    const points: ChartPoint[] = entries.map((entry, index) => {
      const x = (index / Math.max(entries.length - 1, 1)) * chartWidth;
      const y = chartHeight - ((entry.value - minValue) / range) * (chartHeight - 40) - 20;
      
      return {
        x,
        y,
        value: entry.value,
        date: entry.date
      };
    });

    setChartData(points);
  };

  const getCurrentDateRange = (): string => {
    if (filteredEntries.length === 0) return '';

    const dates = filteredEntries.map(e => new Date(e.date)).sort((a, b) => a.getTime() - b.getTime());
    const start = dates[0];
    const end = dates[dates.length - 1];
    
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined
    });
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const navigateRange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentRangeIndex(prev => prev + 1);
    } else if (direction === 'next' && currentRangeIndex > 0) {
      setCurrentRangeIndex(prev => prev - 1);
    }
  };

  const groupEntriesByPeriod = (): GroupedEntry[] => {
    if (!filteredEntries.length) return [];

    const grouped: { [key: string]: MetricEntry[] } = {};
    
    filteredEntries.forEach(entry => {
      const date = new Date(entry.date);
      let periodKey = '';
      let startDate = '';
      let endDate = '';
      
      switch (selectedPeriod) {
        case 'By Week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay() + 1); // Monday
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6); // Sunday
          
          startDate = weekStart.toISOString().split('T')[0];
          endDate = weekEnd.toISOString().split('T')[0];
          periodKey = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
          break;
          
        case 'By Month':
          startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
          endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
          periodKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          break;
          
        case 'By Year':
          startDate = new Date(date.getFullYear(), 0, 1).toISOString().split('T')[0];
          endDate = new Date(date.getFullYear(), 11, 31).toISOString().split('T')[0];
          periodKey = date.getFullYear().toString();
          break;
      }
      
      if (!grouped[periodKey]) {
        grouped[periodKey] = [];
      }
      grouped[periodKey].push(entry);
    });
    
    // Convert to GroupedEntry array and sort by date (newest first)
    return Object.entries(grouped)
      .map(([period, entries]) => {
        const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const values = entries.map(e => e.value);
        const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
        const latestValue = sortedEntries[0].value;
        
        // Get date range for this period
        const dates = entries.map(e => new Date(e.date)).sort((a, b) => a.getTime() - b.getTime());
        const startDate = dates[0].toISOString().split('T')[0];
        const endDate = dates[dates.length - 1].toISOString().split('T')[0];
        
        return {
          period,
          entries: sortedEntries,
          averageValue,
          latestValue,
          startDate,
          endDate
        };
      })
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.startDate).getTime());
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyChartText}>No data available for this period</Text>
        </View>
      );
    }

    const chartWidth = width - 120;
    const chartHeight = 200;

    // Calculate Y-axis labels based on data
    const values = chartData.map(p => p.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;
    
    const yLabels = [
      Math.round(maxValue),
      Math.round(maxValue - range * 0.5),
      Math.round(minValue)
    ];

    return (
      <View style={styles.chartContainer}>
        <View style={[styles.chartArea, { width: chartWidth, height: chartHeight }]}>
          {/* Y-axis labels */}
          <View style={styles.yAxisLabels}>
            {yLabels.map((label, index) => (
              <Text key={index} style={styles.yAxisLabel}>{label}</Text>
            ))}
          </View>
          
          {/* Chart line */}
          <View style={styles.chartLine}>
            {chartData.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = chartData[index - 1];
              
              const lineWidth = Math.sqrt(
                Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
              );
              const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * 180 / Math.PI;
              
              return (
                <View
                  key={`line-${index}`}
                  style={[
                    styles.chartSegment,
                    {
                      left: prevPoint.x,
                      top: prevPoint.y,
                      width: lineWidth,
                      transform: [{ rotate: `${angle}deg` }],
                    }
                  ]}
                />
              );
            })}
          </View>
          
          {/* Chart points */}
          {chartData.map((point, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.chartPoint,
                {
                  left: point.x - 6,
                  top: point.y - 6,
                }
              ]}
              onPress={() => setHoveredPoint(hoveredPoint?.date === point.date ? null : point)}
            />
          ))}
          
          {/* Hover tooltip */}
          {hoveredPoint && (
            <View
              style={[
                styles.tooltip,
                {
                  left: Math.min(Math.max(hoveredPoint.x - 40, 0), chartWidth - 80),
                  top: Math.max(hoveredPoint.y - 70, 10),
                }
              ]}
            >
              <Text style={styles.tooltipDate}>
                {new Date(hoveredPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text style={styles.tooltipValue}>
                {hoveredPoint.value} {metric?.unit}
              </Text>
            </View>
          )}
        </View>
        
        {/* X-axis labels */}
        <View style={styles.chartLabels}>
          {chartData.map((point, index) => {
            if (chartData.length <= 5 || index % Math.ceil(chartData.length / 5) === 0) {
              return (
                <Text key={index} style={[styles.chartLabel, { left: point.x - 15 }]}>
                  {new Date(point.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                </Text>
              );
            }
            return null;
          })}
        </View>
      </View>
    );
  };

  const renderHistoryList = () => {
    const groupedEntries = groupEntriesByPeriod();

    return (
      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <View style={styles.historyTitle}>
            <Text style={styles.historyTitleText}>{metric?.name}</Text>
            <TouchableOpacity onPress={() => router.push(`/add-metric/${metricType}`)}>
              <Plus size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.periodSelector}
            onPress={() => setShowPeriodPicker(true)}
          >
            <Text style={styles.periodText}>{selectedPeriod}</Text>
            <ChevronDown size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {groupedEntries.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyHistoryText}>No data available for this period</Text>
          </View>
        ) : (
          groupedEntries.map((group) => (
            <View key={group.period}>
              <TouchableOpacity 
                style={styles.historyItem}
                onPress={() => setExpandedPeriod(expandedPeriod === group.period ? null : group.period)}
              >
                <View style={styles.historyItemContent}>
                  <Text style={styles.historyPeriod}>{group.period}</Text>
                  <Text style={styles.historySubtext}>
                    {group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'}
                  </Text>
                </View>
                <View style={styles.historyValue}>
                  <Text style={styles.historyValueText}>
                    {group.latestValue} {metric?.unit}
                  </Text>
                  <ChevronDown 
                    size={16} 
                    color={colors.textTertiary}
                    style={[
                      styles.expandIcon,
                      expandedPeriod === group.period && styles.expandIconRotated
                    ]}
                  />
                </View>
              </TouchableOpacity>
              
              {expandedPeriod === group.period && (
                <View style={styles.expandedContent}>
                  {group.entries.map((entry, index) => (
                    <View key={entry.id} style={styles.entryItem}>
                      <View style={styles.entryInfo}>
                        <Text style={styles.entryDate}>
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                        <Text style={styles.entryTime}>{entry.time}</Text>
                      </View>
                      <Text style={styles.entryValue}>
                        {entry.value} {entry.unit}
                      </Text>
                    </View>
                  ))}
                  
                  {group.entries.length > 1 && (
                    <View style={styles.periodSummary}>
                      <Text style={styles.summaryText}>
                        Average: {group.averageValue.toFixed(1)} {metric?.unit}
                      </Text>
                      <Text style={styles.summaryText}>
                        Range: {Math.min(...group.entries.map(e => e.value)).toFixed(1)} - {Math.max(...group.entries.map(e => e.value)).toFixed(1)} {metric?.unit}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
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

  const currentValue = filteredEntries.length > 0 
    ? filteredEntries[0].value 
    : metric.currentValue || 0;

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
              onPress={() => {
                setSelectedRange(range);
                setCurrentRangeIndex(0); // Reset to current period
              }}
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

        {/* Current Value Section */}
        <View style={styles.currentSection}>
          <Text style={styles.currentLabel}>CURRENT</Text>
          <Text style={styles.currentValue}>
            {currentValue} {metric.unit}
          </Text>
          <View style={styles.dateNavigation}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateRange('prev')}
            >
              <ChevronLeft size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.dateRange}>{getCurrentDateRange()}</Text>
            <TouchableOpacity 
              style={[
                styles.navButton,
                currentRangeIndex === 0 && styles.navButtonDisabled
              ]}
              onPress={() => navigateRange('next')}
              disabled={currentRangeIndex === 0}
            >
              <ChevronRight size={20} color={currentRangeIndex === 0 ? colors.borderLight : colors.textSecondary} />
            </TouchableOpacity>
          </View>
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

      {/* Period Picker Modal */}
      <Modal
        visible={showPeriodPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPeriodPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Select Period</Text>
          
          <View style={styles.periodOptions}>
            {periodOptions.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodOption,
                  selectedPeriod === period && styles.selectedPeriodOption
                ]}
                onPress={() => {
                  setSelectedPeriod(period);
                  setExpandedPeriod(null); // Reset expanded state
                  setShowPeriodPicker(false);
                }}
              >
                <Text style={[
                  styles.periodOptionText,
                  selectedPeriod === period && styles.selectedPeriodOptionText
                ]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
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
    paddingVertical: 20,
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
    paddingVertical: 20,
    paddingHorizontal: 20,
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
    marginBottom: 16,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navButton: {
    padding: 4,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  dateRange: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.textSecondary,
    minWidth: 120,
    textAlign: 'center',
  },
  chartContainer: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    marginBottom: 20,
  },
  chartArea: {
    position: 'relative',
    marginBottom: 20,
  },
  yAxisLabels: {
    position: 'absolute',
    left: -30,
    top: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  yAxisLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textTertiary,
  },
  chartLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  chartSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: colors.text,
  },
  chartPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.text,
    borderWidth: 3,
    borderColor: colors.background,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: colors.text,
    borderRadius: 8,
    padding: 8,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  tooltipDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: colors.background,
    marginBottom: 2,
  },
  tooltipValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: colors.background,
  },
  chartLabels: {
    position: 'relative',
    height: 20,
  },
  chartLabel: {
    position: 'absolute',
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: colors.textTertiary,
    width: 30,
    textAlign: 'center',
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 40,
  },
  emptyChartText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  historyItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyPeriod: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.text,
  },
  historySubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
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
  expandIcon: {
    transform: [{ rotate: '0deg' }],
  },
  expandIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    marginBottom: 6,
  },
  entryInfo: {
    flex: 1,
  },
  entryDate: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  entryTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  entryValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: colors.primary,
  },
  periodSummary: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
  },
  summaryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHistoryText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textTertiary,
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  periodOptions: {
    gap: 12,
  },
  periodOption: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  selectedPeriodOption: {
    backgroundColor: colors.primary,
  },
  periodOptionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.text,
  },
  selectedPeriodOptionText: {
    color: '#FFFFFF',
  },
});