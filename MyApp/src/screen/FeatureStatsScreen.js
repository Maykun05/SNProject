import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthProvider';
import { fetchFeatureStats } from '../services/apiStats';

const FEATURE_OPTIONS = [
  { key: 'water', label: 'Water', unitLabel: 'ml' },
  { key: 'mood', label: 'Mood', unitLabel: 'score' },
  { key: 'sleep', label: 'Sleep', unitLabel: 'hrs' },
  { key: 'exercise', label: 'Exercise', unitLabel: 'exercise' },
  { key: 'food', label: 'Food', unitLabel: 'kcal' },
];

const RANGE_OPTIONS = [
  { key: '7d', label: '7 วัน' },
  { key: 'month', label: 'เดือนนี้' },
];

const EMPTY_TOTALS = {
  sessions: 0,
  steps: 0,
  durationSec: 0,
  calories: 0,
  distance: 0,
};

const EMPTY_DATA = {
  dateRange: { startDate: null, endDate: null },
  feature: 'water',
  range: '7d',
  unit: 'count',
  summary: {
    total: 0,
    activeDays: 0,
    average: 0,
    peakValue: 0,
    peakDate: null,
    totals: { ...EMPTY_TOTALS },
  },
  series: [],
};

const EXERCISE_METRICS = [
  { key: 'duration', label: 'เวลา', chartUnit: 'นาที/วัน' },
  { key: 'steps', label: 'ก้าว', chartUnit: 'ก้าว/วัน' },
  { key: 'calories', label: 'kcal', chartUnit: 'kcal/วัน' },
  { key: 'distance', label: 'km', chartUnit: 'km/วัน' },
  { key: 'sessions', label: 'เซสชัน', chartUnit: 'ครั้ง/วัน' },
];

const formatThaiDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTickDate = (value, dense = false) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  if (dense) return d.toLocaleDateString('th-TH', { day: 'numeric' });
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
};

const formatDurationTotal = (sec) => {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h <= 0) return `${m} นาที`;
  return m > 0 ? `${h} ชม. ${m} นาที` : `${h} ชม.`;
};

const getExercisePointValue = (item, metricKey) => {
  switch (metricKey) {
    case 'duration':
      return (Number(item.durationSec) || 0) / 60;
    case 'steps':
      return Number(item.steps) || 0;
    case 'calories':
      return Number(item.calories) || 0;
    case 'distance':
      return Number(item.distance) || 0;
    case 'sessions':
      return Number(item.sessions) || 0;
    default:
      return 0;
  }
};

const formatExerciseBarValue = (metricKey, value) => {
  if (metricKey === 'duration') {
    return value < 10 && value % 1 !== 0 ? value.toFixed(1) : String(Math.round(value));
  }
  if (metricKey === 'distance') {
    return value < 10 ? value.toFixed(2) : value.toFixed(1);
  }
  return String(Math.round(value));
};

const formatExercisePeakDisplay = (metricKey, value) => {
  if (metricKey === 'duration') {
    const sec = Math.round(value * 60);
    return formatDurationTotal(sec);
  }
  if (metricKey === 'distance') return `${value.toFixed(2)} km`;
  if (metricKey === 'calories') return `${Math.round(value)} kcal`;
  if (metricKey === 'sessions') return `${Math.round(value)} ครั้ง`;
  return `${Math.round(value).toLocaleString()} ก้าว`;
};

const normalize = (payload = {}, feature = 'water', range = '7d') => ({
  ...EMPTY_DATA,
  ...payload,
  feature,
  range,
  dateRange: { ...EMPTY_DATA.dateRange, ...(payload?.dateRange ?? {}) },
  summary: {
    ...EMPTY_DATA.summary,
    ...(payload?.summary ?? {}),
    totals: { ...EMPTY_TOTALS, ...(payload?.summary?.totals ?? {}) },
  },
  series: Array.isArray(payload?.series) ? payload.series : [],
});

const SummaryCard = ({ label, value, helper }) => (
  <View style={styles.summaryCard}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
    {helper ? <Text style={styles.summaryHelper}>{helper}</Text> : null}
  </View>
);

const BarChart = ({ data, unit, formatBar }) => {
  const fmt = formatBar ?? ((v) => String(v));
  const maxValue = Math.max(1, ...data.map((item) => Number(item.value) || 0));
  const isDense = data.length > 10;

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeaderRow}>
        <Text style={styles.chartSectionHeading}>แนวโน้มรายวัน</Text>
        <Text style={styles.chartUnit}>{unit}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartRow}>
        {data.map((item) => {
          const value = Number(item.value) || 0;
          const barHeight = Math.max(6, Math.round((value / maxValue) * 130));
          return (
            <View key={item.date} style={styles.barItem}>
              <Text style={styles.barValue}>{fmt(value)}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: barHeight }]} />
              </View>
              <Text style={styles.barLabel}>{formatTickDate(item.date, isDense)}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const GREEN = '#1E4D2B';

export default function FeatureStatsScreen() {
  const insets = useSafeAreaInsets();
  const { userToken } = useContext(AuthContext);
  const [feature, setFeature] = useState('water');
  const [range, setRange] = useState('7d');
  const [stats, setStats] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [exerciseMetric, setExerciseMetric] = useState('duration');

  const featureMeta = useMemo(() => FEATURE_OPTIONS.find((item) => item.key === feature) ?? FEATURE_OPTIONS[0], [feature]);

  const isExercise = feature === 'exercise';

  const isEmpty = useMemo(() => {
    if (isExercise) {
      return stats.series.every((item) => (Number(item.sessions) || 0) === 0);
    }
    return stats.series.every((item) => (Number(item.value) || 0) === 0);
  }, [isExercise, stats.series]);

  const chartData = useMemo(() => {
    if (!isExercise) return stats.series;
    return stats.series.map((item) => ({
      date: item.date,
      value: getExercisePointValue(item, exerciseMetric),
    }));
  }, [exerciseMetric, isExercise, stats.series]);

  const exerciseChartUnit = useMemo(
    () => EXERCISE_METRICS.find((m) => m.key === exerciseMetric)?.chartUnit ?? '',
    [exerciseMetric],
  );

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!userToken) {
        setError('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
        setStats(EMPTY_DATA);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        setError(null);
        const data = await fetchFeatureStats({ token: userToken, feature, range });
        setStats(normalize(data, feature, range));
      } catch (e) {
        setError('โหลดสถิติไม่สำเร็จ กรุณาลองใหม่');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [feature, range, userToken],
  );

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const insightText = useMemo(() => {
    if (isExercise) {
      if (isEmpty) {
        return 'ยังไม่มีเซสชันออกกำลังกายในช่วงนี้ ลองบันทึกเซสชันจากหน้า Exercise เพื่อดูแนวโน้ม';
      }
      let best = { date: null, value: -1 };
      for (const item of stats.series) {
        const v = getExercisePointValue(item, exerciseMetric);
        if (v > best.value) best = { date: item.date, value: v };
      }
      if (best.value <= 0 || !best.date) {
        return 'ยังไม่มีข้อมูลตามมิติที่เลือกในช่วงนี้';
      }
      const label = EXERCISE_METRICS.find((m) => m.key === exerciseMetric)?.label ?? '';
      return `วันที่ ${label} สูงสุด: ${formatThaiDate(best.date)} — ${formatExercisePeakDisplay(exerciseMetric, best.value)}`;
    }
    if (isEmpty) return 'ยังไม่มีข้อมูลในช่วงเวลานี้ ลองบันทึกกิจกรรมเพิ่มเพื่อเริ่มเห็นแนวโน้ม';
    return `วันที่ทำได้สูงสุด: ${formatThaiDate(stats.summary.peakDate)} (${stats.summary.peakValue} ${featureMeta.unitLabel})`;
  }, [
    exerciseMetric,
    featureMeta.unitLabel,
    isEmpty,
    isExercise,
    stats.series,
    stats.summary.peakDate,
    stats.summary.peakValue,
  ]);

  const exerciseTotals = stats.summary.totals ?? EMPTY_TOTALS;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#1E4D2B" />
          <Text style={styles.stateText}>กำลังโหลดสถิติ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadData(false)}>
            <Text style={styles.retryBtnText}>ลองใหม่</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 56 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} colors={['#2E7D5B']} />}
      >
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerSmall}>Health Feature Stats</Text>
            <Text style={styles.headerSubText}>
              {formatThaiDate(stats.dateRange?.startDate)} - {formatThaiDate(stats.dateRange?.endDate)}
            </Text>
          </View>
        </View>

        <View style={[styles.tabRow, styles.contentInset, styles.tabsTop]}>
          {FEATURE_OPTIONS.map((item) => {
            const active = item.key === feature;
            return (
              <TouchableOpacity key={item.key} style={[styles.pill, active && styles.pillActive]} onPress={() => setFeature(item.key)}>
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.tabRow, styles.contentInset]}>
          {RANGE_OPTIONS.map((item) => {
            const active = item.key === range;
            return (
              <TouchableOpacity key={item.key} style={[styles.pill, active && styles.pillActive]} onPress={() => setRange(item.key)}>
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isExercise ? (
          <>
            <View style={[styles.summaryGrid, styles.contentInset]}>
              <SummaryCard label="เซสชันรวม" value={`${exerciseTotals.sessions}`} helper="ครั้ง" />
              <SummaryCard label="เวลารวม" value={formatDurationTotal(exerciseTotals.durationSec)} helper="จากเซสชันทั้งหมด" />
              <SummaryCard label="ก้าวรวม" value={`${exerciseTotals.steps.toLocaleString()}`} helper="ก้าว (เซสชัน)" />
              <SummaryCard label="แคลอรี่รวม" value={`${exerciseTotals.calories}`} helper="kcal" />
              <SummaryCard label="ระยะทางรวม" value={`${(Number(exerciseTotals.distance) || 0).toFixed(2)}`} helper="km" />
              <SummaryCard label="วันมีเซสชัน" value={`${stats.summary.activeDays}`} helper="วัน" />
            </View>

            <View style={[styles.metricPillRow, styles.contentInset]}>
              {EXERCISE_METRICS.map((m) => {
                const active = m.key === exerciseMetric;
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.metricPill, active && styles.pillActive]}
                    onPress={() => setExerciseMetric(m.key)}
                  >
                    <Text style={[styles.metricPillText, active && styles.pillTextActive]}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <BarChart
              data={chartData}
              unit={exerciseChartUnit}
              formatBar={(v) => formatExerciseBarValue(exerciseMetric, v)}
            />
          </>
        ) : (
          <>
            <View style={[styles.summaryGrid, styles.contentInset]}>
              <SummaryCard label="รวมทั้งหมด" value={`${stats.summary.total}`} helper={featureMeta.unitLabel} />
              <SummaryCard label="วันที่มีข้อมูล" value={`${stats.summary.activeDays}`} helper="วัน" />
              <SummaryCard label="ค่าเฉลี่ย/วัน" value={`${stats.summary.average}`} helper={featureMeta.unitLabel} />
              <SummaryCard label="ค่าสูงสุด/วัน" value={`${stats.summary.peakValue}`} helper={featureMeta.unitLabel} />
            </View>

            <BarChart data={stats.series} unit={featureMeta.unitLabel} />
          </>
        )}

        <Text style={styles.pageSectionTitle}>Insight</Text>
        <View style={[styles.insightCard, styles.contentInset]}>
          <Text style={styles.insightText}>{insightText}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBF9' },
  contentInset: { marginHorizontal: 20 },
  tabsTop: { marginTop: 8 },
  header: {
    justifyContent: 'center',
    marginTop: 18,
    paddingTop: 18,
    paddingHorizontal: 24,
    paddingBottom: 10,
    position: 'relative',
    minHeight: 84,
  },
  headerTitleWrap: { alignItems: 'center' },
  headerSmall: {
    fontSize: 30,
    fontWeight: '800',
    color: GREEN,
    opacity: 0.9,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  headerSubText: {
    marginTop: 2,
    fontSize: 12,
    color: '#5C7A6E',
    fontWeight: '500',
    textAlign: 'center',
  },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#E8EFEB',
  },
  pillActive: { backgroundColor: '#1E4D2B' },
  pillText: { color: '#2F4A3A', fontWeight: '600', fontSize: 12 },
  pillTextActive: { color: '#FFFFFF' },
  metricPillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  metricPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#E8EFEB',
  },
  metricPillText: { color: '#2F4A3A', fontWeight: '600', fontSize: 11 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginTop: 4 },
  summaryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E1EAE4',
  },
  summaryLabel: { fontSize: 12, color: '#627667' },
  summaryValue: { marginTop: 6, fontSize: 20, fontWeight: '800', color: '#1E4D2B' },
  summaryHelper: { marginTop: 2, fontSize: 11, color: '#7A8D81' },
  chartCard: {
    marginTop: 14,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E1EAE4',
    padding: 12,
  },
  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  chartSectionHeading: { fontSize: 14, fontWeight: '700', color: '#1E4D2B' },
  pageSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 24,
    marginBottom: 12,
    marginTop: 8,
    color: '#1B4332',
  },
  chartUnit: { fontSize: 12, color: '#6A7E70' },
  chartRow: { alignItems: 'flex-end', gap: 8, paddingRight: 8 },
  barItem: { alignItems: 'center' },
  barValue: { fontSize: 10, color: '#577062', marginBottom: 4 },
  barTrack: {
    width: 14,
    height: 130,
    borderRadius: 10,
    backgroundColor: '#E9F0EC',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', backgroundColor: '#2F8D58', borderRadius: 10 },
  barLabel: { marginTop: 6, fontSize: 10, color: '#667E6F' },
  insightCard: {
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E1EAE4',
    padding: 14,
  },
  insightText: { marginTop: 6, color: '#4A6153', fontSize: 13, lineHeight: 18 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  stateText: { marginTop: 10, fontSize: 14, color: '#5F7466' },
  errorText: { fontSize: 14, color: '#B72F2F', textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: '#1E4D2B', borderRadius: 22, paddingHorizontal: 18, paddingVertical: 10 },
  retryBtnText: { color: '#FFF', fontWeight: '700' },
});
