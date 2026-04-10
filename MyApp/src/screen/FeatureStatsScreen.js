import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthProvider';
import { fetchFeatureStats7d } from '../services/apiStats';

const EMPTY_DATA = {
  dateRange: { startDate: null, endDate: null },
  totalLogs7d: 0,
  activeDays7d: 0,
  currentStreak: 0,
  topFeature: null,
  dailyTotals: [],
  featureBreakdown: [],
};

const formatThaiDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDayLabel = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('th-TH', { weekday: 'short' });
};

const normalizeData = (payload = {}) => ({
  ...EMPTY_DATA,
  ...payload,
  dateRange: { ...EMPTY_DATA.dateRange, ...(payload?.dateRange ?? {}) },
  dailyTotals: Array.isArray(payload?.dailyTotals) ? payload.dailyTotals : [],
  featureBreakdown: Array.isArray(payload?.featureBreakdown) ? payload.featureBreakdown : [],
});

const SummaryCard = ({ label, value, subValue }) => (
  <View style={styles.summaryCard}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
    {subValue ? <Text style={styles.summarySubValue}>{subValue}</Text> : null}
  </View>
);

const TrendBars = ({ data }) => {
  const maxCount = Math.max(1, ...data.map((item) => item.count || 0));

  return (
    <View style={styles.trendCard}>
      <Text style={styles.sectionTitle}>แนวโน้มรายวัน</Text>
      <View style={styles.barsRow}>
        {data.map((item) => {
          const height = Math.max(6, Math.round(((item.count || 0) / maxCount) * 64));
          return (
            <View key={item.date} style={styles.barItem}>
              <Text style={styles.barCount}>{item.count || 0}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height }]} />
              </View>
              <Text style={styles.barLabel}>{formatDayLabel(item.date)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const MiniStrip = ({ dailyCounts }) => {
  const maxCount = Math.max(1, ...dailyCounts.map((d) => d.count || 0));
  return (
    <View style={styles.miniStripRow}>
      {dailyCounts.map((item) => (
        <View key={item.date} style={styles.miniStripTrack}>
          <View
            style={[
              styles.miniStripFill,
              { height: Math.max(2, Math.round(((item.count || 0) / maxCount) * 16)) },
            ]}
          />
        </View>
      ))}
    </View>
  );
};

const FeatureCard = ({ item }) => (
  <View style={styles.featureCard}>
    <View style={styles.featureCardHeader}>
      <Text style={styles.featureName}>{item.name || 'ไม่ระบุชื่อฟีเจอร์'}</Text>
      <Text style={styles.featureCount}>{item.totalCount7d || 0} ครั้ง</Text>
    </View>
    <Text style={styles.featureLastUsed}>ล่าสุด: {formatThaiDate(item.lastUsedAt)}</Text>
    <MiniStrip dailyCounts={Array.isArray(item.dailyCounts) ? item.dailyCounts : []} />
  </View>
);

export default function FeatureStatsScreen() {
  const { userToken } = useContext(AuthContext);
  const [stats, setStats] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const isEmpty = useMemo(
    () => stats.totalLogs7d === 0 && stats.featureBreakdown.length === 0,
    [stats],
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
        const data = await fetchFeatureStats7d(userToken);
        setStats(normalizeData(data));
      } catch (err) {
        setError('โหลดสถิติไม่สำเร็จ กรุณาลองใหม่');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userToken],
  );

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#1E4D2B" />
          <Text style={styles.stateText}>กำลังโหลดสถิติฟีเจอร์...</Text>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor="#1E4D2B" />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>สถิติฟีเจอร์ที่สนใจ</Text>
          <Text style={styles.subtitle}>7 วันที่ผ่านมา</Text>
          <Text style={styles.dateRange}>
            {formatThaiDate(stats.dateRange?.startDate)} - {formatThaiDate(stats.dateRange?.endDate)}
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard label="การใช้งานรวม" value={stats.totalLogs7d || 0} subValue="ครั้ง" />
          <SummaryCard label="วันที่แอคทีฟ" value={stats.activeDays7d || 0} subValue="วัน" />
          <SummaryCard label="สตรีคปัจจุบัน" value={stats.currentStreak || 0} subValue="วันติดกัน" />
          <SummaryCard
            label="ฟีเจอร์เด่น"
            value={stats.topFeature?.name || '-'}
            subValue={stats.topFeature ? `${stats.topFeature.count} ครั้ง` : 'ยังไม่มีข้อมูล'}
          />
        </View>

        <TrendBars data={stats.dailyTotals} />

        <View style={styles.featureSection}>
          <Text style={styles.sectionTitle}>รายละเอียดรายฟีเจอร์</Text>
          {isEmpty ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>ยังไม่มีการใช้งานในช่วง 7 วันนี้</Text>
              <Text style={styles.emptySubtitle}>ลองใช้งานฟีเจอร์สุขภาพที่สนใจ แล้วกลับมาดูสถิติได้ที่หน้านี้</Text>
            </View>
          ) : (
            stats.featureBreakdown.map((item) => <FeatureCard key={String(item.featureId)} item={item} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  header: { marginTop: 8, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E4D2B' },
  subtitle: { marginTop: 4, fontSize: 14, color: '#4F6B58', fontWeight: '600' },
  dateRange: { marginTop: 4, fontSize: 12, color: '#7B8D80' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  summaryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E7ECE8',
  },
  summaryLabel: { fontSize: 12, color: '#6A7D70' },
  summaryValue: { marginTop: 6, fontSize: 20, fontWeight: '800', color: '#1E4D2B' },
  summarySubValue: { marginTop: 2, fontSize: 11, color: '#7D8C82' },
  trendCard: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E7ECE8',
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1E4D2B', marginBottom: 10 },
  barsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barItem: { width: '13%', alignItems: 'center' },
  barCount: { fontSize: 10, color: '#5A6E60', marginBottom: 4 },
  barTrack: {
    width: 18,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#EAF0EC',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', backgroundColor: '#2C8D55', borderRadius: 10 },
  barLabel: { marginTop: 6, fontSize: 10, color: '#6F8174' },
  featureSection: { marginTop: 14 },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E7ECE8',
  },
  featureCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  featureName: { fontSize: 15, fontWeight: '700', color: '#1E4D2B', flex: 1, paddingRight: 8 },
  featureCount: { fontSize: 13, fontWeight: '700', color: '#2C8D55' },
  featureLastUsed: { marginTop: 6, fontSize: 12, color: '#6F8174' },
  miniStripRow: { marginTop: 10, flexDirection: 'row', gap: 4 },
  miniStripTrack: {
    flex: 1,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#EAF0EC',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  miniStripFill: { width: '100%', backgroundColor: '#2C8D55', borderRadius: 6 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  stateText: { marginTop: 10, fontSize: 14, color: '#5F7466' },
  errorText: { fontSize: 14, color: '#B72F2F', textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: '#1E4D2B', borderRadius: 22, paddingHorizontal: 18, paddingVertical: 10 },
  retryBtnText: { color: '#FFF', fontWeight: '700' },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7ECE8',
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#2B4B38', textAlign: 'center' },
  emptySubtitle: { marginTop: 8, fontSize: 13, color: '#6D8073', textAlign: 'center', lineHeight: 18 },
});
