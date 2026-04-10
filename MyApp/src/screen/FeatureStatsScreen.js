import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthProvider';
import { fetchFeatureStats } from '../services/apiStats';

const FEATURE_OPTIONS = [
  { key: 'water', label: 'Water', unitLabel: 'ml' },
  { key: 'mood', label: 'Mood', unitLabel: 'score' },
  { key: 'sleep', label: 'Sleep', unitLabel: 'hrs' },
  { key: 'steps', label: 'Steps', unitLabel: 'steps' },
  { key: 'food', label: 'Food', unitLabel: 'kcal' },
];

const RANGE_OPTIONS = [
  { key: '7d', label: '7 วัน' },
  { key: 'month', label: 'เดือนนี้' },
];

const EMPTY_DATA = {
  dateRange: { startDate: null, endDate: null },
  feature: 'water',
  range: '7d',
  unit: 'count',
  summary: { total: 0, activeDays: 0, average: 0, peakValue: 0, peakDate: null },
  series: [],
};

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

const normalize = (payload = {}, feature = 'water', range = '7d') => ({
  ...EMPTY_DATA,
  ...payload,
  feature,
  range,
  dateRange: { ...EMPTY_DATA.dateRange, ...(payload?.dateRange ?? {}) },
  summary: { ...EMPTY_DATA.summary, ...(payload?.summary ?? {}) },
  series: Array.isArray(payload?.series) ? payload.series : [],
});

const SummaryCard = ({ label, value, helper }) => (
  <View style={styles.summaryCard}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
    {helper ? <Text style={styles.summaryHelper}>{helper}</Text> : null}
  </View>
);

const BarChart = ({ data, unit }) => {
  const maxValue = Math.max(1, ...data.map((item) => Number(item.value) || 0));
  const isDense = data.length > 10;

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeaderRow}>
        <Text style={styles.sectionTitle}>แนวโน้มรายวัน</Text>
        <Text style={styles.chartUnit}>{unit}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartRow}>
        {data.map((item) => {
          const value = Number(item.value) || 0;
          const barHeight = Math.max(6, Math.round((value / maxValue) * 130));
          return (
            <View key={item.date} style={styles.barItem}>
              <Text style={styles.barValue}>{value}</Text>
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

export default function FeatureStatsScreen() {
  const { userToken } = useContext(AuthContext);
  const [feature, setFeature] = useState('water');
  const [range, setRange] = useState('7d');
  const [stats, setStats] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const featureMeta = useMemo(() => FEATURE_OPTIONS.find((item) => item.key === feature) ?? FEATURE_OPTIONS[0], [feature]);
  const isEmpty = useMemo(() => stats.series.every((item) => (Number(item.value) || 0) === 0), [stats.series]);

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
    if (isEmpty) return 'ยังไม่มีข้อมูลในช่วงเวลานี้ ลองบันทึกกิจกรรมเพิ่มเพื่อเริ่มเห็นแนวโน้ม';
    return `วันที่ทำได้สูงสุด: ${formatThaiDate(stats.summary.peakDate)} (${stats.summary.peakValue} ${featureMeta.unitLabel})`;
  }, [featureMeta.unitLabel, isEmpty, stats.summary.peakDate, stats.summary.peakValue]);

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
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor="#1E4D2B" />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Health Feature Stats</Text>
          <Text style={styles.dateRange}>
            {formatThaiDate(stats.dateRange?.startDate)} - {formatThaiDate(stats.dateRange?.endDate)}
          </Text>
        </View>

        <View style={styles.tabRow}>
          {FEATURE_OPTIONS.map((item) => {
            const active = item.key === feature;
            return (
              <TouchableOpacity key={item.key} style={[styles.pill, active && styles.pillActive]} onPress={() => setFeature(item.key)}>
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.tabRow}>
          {RANGE_OPTIONS.map((item) => {
            const active = item.key === range;
            return (
              <TouchableOpacity key={item.key} style={[styles.pill, active && styles.pillActive]} onPress={() => setRange(item.key)}>
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard label="รวมทั้งหมด" value={`${stats.summary.total}`} helper={featureMeta.unitLabel} />
          <SummaryCard label="วันที่มีข้อมูล" value={`${stats.summary.activeDays}`} helper="วัน" />
          <SummaryCard label="ค่าเฉลี่ย/วัน" value={`${stats.summary.average}`} helper={featureMeta.unitLabel} />
          <SummaryCard label="ค่าสูงสุด/วัน" value={`${stats.summary.peakValue}`} helper={featureMeta.unitLabel} />
        </View>

        <BarChart data={stats.series} unit={featureMeta.unitLabel} />

        <View style={styles.insightCard}>
          <Text style={styles.sectionTitle}>Insight</Text>
          <Text style={styles.insightText}>{insightText}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F5' },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 120 },
  header: { marginBottom: 14 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E4D2B' },
  dateRange: { marginTop: 4, fontSize: 12, color: '#607768' },
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
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginTop: 4 },
  summaryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E1EAE4',
  },
  summaryLabel: { fontSize: 12, color: '#627667' },
  summaryValue: { marginTop: 6, fontSize: 20, fontWeight: '800', color: '#1E4D2B' },
  summaryHelper: { marginTop: 2, fontSize: 11, color: '#7A8D81' },
  chartCard: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1EAE4',
    padding: 12,
  },
  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1E4D2B' },
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
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
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
