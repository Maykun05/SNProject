import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthProvider';
import { fetchFeatureStats } from '../services/apiStats';

const FEATURE_OPTIONS = [
  { key: 'water', label: 'น้ำ', unitLabel: 'มล.' },
  { key: 'mood', label: 'อารมณ์', unitLabel: 'คะแนน' },
  { key: 'sleep', label: 'นอนหลับ', unitLabel: 'ชม.' },
  { key: 'exercise', label: 'ออกกำลังกาย', unitLabel: 'ครั้ง' },
  { key: 'food', label: 'อาหาร', unitLabel: 'กิโลแคลอรี่' },
];

const RANGE_OPTIONS = [
  { key: '7d', label: '7 วัน' },
  { key: 'month', label: 'เดือนนี้' },
  { key: 'custom', label: 'กำหนดเอง', isCustom: true },
];

const MS_PER_DAY = 86400000;
const MAX_CUSTOM_SPAN_DAYS = 366;

const defaultRangeLast7Days = () => {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return { start, end };
};

const toStartOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

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
  { key: 'calories', label: 'กิโลแคลอรี่', chartUnit: 'กิโลแคลอรี่/วัน' },
  { key: 'distance', label: 'ระยะทาง', chartUnit: 'กม./วัน' },
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

/** แปลง YYYY-MM-DD เป็น Date เที่ยงคืนใน local */
const parseLocalDateOnly = (ymd) => {
  if (!ymd || typeof ymd !== 'string') return null;
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const dt = new Date(y, mo, day);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const formatYmd = (d) => {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
};

/** วันที่ 1 … วันสุดท้ายของเดือนเดียวกับ startYmd */
const buildMonthDateKeysInclusive = (startYmd) => {
  const start = parseLocalDateOnly(startYmd);
  if (!start) return [];
  const y = start.getFullYear();
  const mo = start.getMonth();
  const lastDay = new Date(y, mo + 1, 0).getDate();
  const keys = [];
  for (let d = 1; d <= lastDay; d += 1) {
    keys.push(formatYmd(new Date(y, mo, d)));
  }
  return keys;
};

/** โหมดเดือน: แสดงครบทุกวันในเดือน (เติม 0 ถ้าไม่มีแถวจาก API) เพื่อเลื่อนกราฟซ้าย–ขวาได้ */
const padSeriesToFullCalendarMonth = (rangeKey, dateRange, series, exercise) => {
  if (rangeKey !== 'month' || !dateRange?.startDate) return series || [];
  const keys = buildMonthDateKeysInclusive(dateRange.startDate);
  if (keys.length === 0) return series || [];
  const map = new Map((series || []).map((row) => [row.date, row]));
  if (exercise) {
    return keys.map((date) => {
      const row = map.get(date);
      if (row) return row;
      return { date, sessions: 0, steps: 0, durationSec: 0, calories: 0, distance: 0 };
    });
  }
  return keys.map((date) => {
    const row = map.get(date);
    if (row) return { date, value: Number(row.value) || 0 };
    return { date, value: 0 };
  });
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
  if (metricKey === 'distance') return `${value.toFixed(2)} กม.`;
  if (metricKey === 'calories') return `${Math.round(value)} กิโลแคลอรี่`;
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

const BarChart = ({ data, unit, formatBar, monthMode }) => {
  const fmt = formatBar ?? ((v) => String(v));
  const maxValue = Math.max(1, ...data.map((item) => Number(item.value) || 0));
  const isDense = monthMode || data.length > 10;
  const rowStyle = monthMode ? styles.chartRowMonth : styles.chartRowWeek;
  const itemStyle = monthMode ? styles.barItemMonth : styles.barItemWeek;
  const trackStyle = monthMode ? styles.barTrackMonth : styles.barTrackWeek;

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeaderRow}>
        <Text style={styles.chartSectionHeading}>สถิติ</Text>
        <Text style={styles.chartUnit}>{unit}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={monthMode}
        nestedScrollEnabled
        contentContainerStyle={rowStyle}
      >
        {data.map((item) => {
          const value = Number(item.value) || 0;
          const rawH = Math.round((value / maxValue) * 130);
          const barHeight = value > 0 ? Math.max(4, rawH) : 0;
          return (
            <View key={item.date} style={itemStyle}>
              <Text style={styles.barValue}>{fmt(value)}</Text>
              <View style={trackStyle}>
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
  const [customStartYmd, setCustomStartYmd] = useState(() => formatYmd(defaultRangeLast7Days().start));
  const [customEndYmd, setCustomEndYmd] = useState(() => formatYmd(defaultRangeLast7Days().end));
  const [showCustomRangeModal, setShowCustomRangeModal] = useState(false);
  const [draftStart, setDraftStart] = useState(() => defaultRangeLast7Days().start);
  const [draftEnd, setDraftEnd] = useState(() => defaultRangeLast7Days().end);
  const [iosDatePick, setIosDatePick] = useState(null);
  const [androidPick, setAndroidPick] = useState(null);
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

  const seriesForChart = useMemo(
    () => padSeriesToFullCalendarMonth(range, stats.dateRange, stats.series, isExercise),
    [range, stats.dateRange, stats.series, isExercise],
  );

  const chartData = useMemo(() => {
    if (!isExercise) return seriesForChart;
    return seriesForChart.map((item) => ({
      date: item.date,
      value: getExercisePointValue(item, exerciseMetric),
    }));
  }, [exerciseMetric, isExercise, seriesForChart]);

  const isWideChart = range === 'month' || (range === 'custom' && chartData.length > 10);

  const exerciseChartUnit = useMemo(
    () => EXERCISE_METRICS.find((m) => m.key === exerciseMetric)?.chartUnit ?? '',
    [exerciseMetric],
  );

  const openCustomRangeModal = useCallback(() => {
    const s = parseLocalDateOnly(customStartYmd) ?? defaultRangeLast7Days().start;
    const e = parseLocalDateOnly(customEndYmd) ?? defaultRangeLast7Days().end;
    setDraftStart(toStartOfDay(s));
    setDraftEnd(toStartOfDay(e));
    setIosDatePick(null);
    setAndroidPick(null);
    setShowCustomRangeModal(true);
  }, [customStartYmd, customEndYmd]);

  const closeCustomRangeModal = useCallback(() => {
    setShowCustomRangeModal(false);
    setIosDatePick(null);
    setAndroidPick(null);
  }, []);

  const applyCustomRange = useCallback(() => {
    let a = toStartOfDay(draftStart);
    let b = toStartOfDay(draftEnd);
    if (a > b) [a, b] = [b, a];
    const today = toStartOfDay(new Date());
    if (b > today) b = today;
    const spanDays = Math.floor((b.getTime() - a.getTime()) / MS_PER_DAY) + 1;
    if (spanDays > MAX_CUSTOM_SPAN_DAYS) {
      Alert.alert('ช่วงยาวเกินไป', `เลือกได้ไม่เกิน ${MAX_CUSTOM_SPAN_DAYS} วัน`);
      return;
    }
    setCustomStartYmd(formatYmd(a));
    setCustomEndYmd(formatYmd(b));
    setRange('custom');
    setShowCustomRangeModal(false);
    setIosDatePick(null);
    setAndroidPick(null);
  }, [draftEnd, draftStart]);

  const onAndroidDateChange = useCallback((event, date, which) => {
    setAndroidPick(null);
    if (Platform.OS === 'android' && event?.type === 'dismissed') return;
    if (!date) return;
    const t = toStartOfDay(date);
    if (which === 'start') setDraftStart(t);
    else setDraftEnd(t);
  }, []);

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
        const fetchOpts = { token: userToken, feature, range: range === 'custom' ? '7d' : range };
        if (range === 'custom' && customStartYmd && customEndYmd) {
          fetchOpts.startDate = customStartYmd;
          fetchOpts.endDate = customEndYmd;
        }
        const data = await fetchFeatureStats(fetchOpts);
        setStats(normalize(data, feature, range === 'custom' ? 'custom' : range));
      } catch (e) {
        setError('โหลดสถิติไม่สำเร็จ กรุณาลองใหม่');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [customEndYmd, customStartYmd, feature, range, userToken],
  );

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const insightText = useMemo(() => {
    if (isExercise) {
      if (isEmpty) {
        return 'ยังไม่มีเซสชันออกกำลังกายในช่วงนี้ ลองบันทึกเซสชันจากหน้าออกกำลังกายเพื่อดูแนวโน้ม';
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

  const todayCap = toStartOfDay(new Date());
  const startPickerMax = draftEnd.getTime() > todayCap.getTime() ? todayCap : draftEnd;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#1E4D2B" />
          <Text style={styles.stateText}>กำลังโหลดสถิติ…</Text>
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
            <Text style={styles.headerSmall}>สถิติฟีเจอร์สุขภาพ</Text>
            <Text style={styles.headerSubText}>
              {formatThaiDate(stats.dateRange?.startDate)} ถึง {formatThaiDate(stats.dateRange?.endDate)}
            </Text>
          </View>
        </View>

        <View style={[styles.selectorBlock, styles.contentInset, styles.selectorBlockTop]}>
          <Text style={styles.selectorLabel}>หมวดหมู่</Text>
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
        </View>

        <View style={[styles.selectorBlock, styles.selectorBlockRange, styles.contentInset]}>
          <Text style={styles.selectorLabel}>ช่วงเวลา</Text>
          <View style={styles.tabRow}>
            {RANGE_OPTIONS.map((item) => {
              const active = item.key === range;
              const onPressRange = () => {
                if (item.isCustom) openCustomRangeModal();
                else setRange(item.key);
              };
              return (
                <TouchableOpacity key={item.key} style={[styles.pill, active && styles.pillActive]} onPress={onPressRange}>
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {isExercise ? (
          <>
            <View style={[styles.summaryGrid, styles.contentInset]}>
              <SummaryCard label="เซสชันรวม" value={`${exerciseTotals.sessions}`} helper="ครั้ง" />
              <SummaryCard label="เวลารวม" value={formatDurationTotal(exerciseTotals.durationSec)} helper="จากเซสชันทั้งหมด" />
              <SummaryCard label="ก้าวรวม" value={`${exerciseTotals.steps.toLocaleString()}`} helper="ก้าว (เซสชัน)" />
              <SummaryCard label="กิโลแคลอรี่รวม" value={`${exerciseTotals.calories}`} helper="กิโลแคลอรี่" />
              <SummaryCard label="ระยะทางรวม" value={`${(Number(exerciseTotals.distance) || 0).toFixed(2)}`} helper="กม." />
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
              monthMode={isWideChart}
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

            <BarChart data={chartData} unit={featureMeta.unitLabel} monthMode={isWideChart} />
          </>
        )}

        <Text style={styles.pageSectionTitle}>สรุป</Text>
        <View style={[styles.insightCard, styles.contentInset]}>
          <Text style={styles.insightText}>{insightText}</Text>
        </View>
      </ScrollView>

      <Modal
        visible={showCustomRangeModal}
        transparent
        animationType="fade"
        onRequestClose={closeCustomRangeModal}
      >
        <View style={styles.rangeModalRoot}>
          <TouchableOpacity style={styles.rangeModalBackdrop} activeOpacity={1} onPress={closeCustomRangeModal} />
          <View style={styles.rangeModalCard}>
            <Text style={styles.rangeModalTitle}>เลือกช่วงวันที่</Text>
            <Text style={styles.rangeModalSubtitle}>ตั้งแต่วันไหนถึงวันไหน (สูงสุด {MAX_CUSTOM_SPAN_DAYS} วัน)</Text>

            <TouchableOpacity
              style={styles.rangeModalDateRow}
              onPress={() =>
                Platform.OS === 'android' ? setAndroidPick('start') : setIosDatePick((p) => (p === 'start' ? null : 'start'))
              }
            >
              <Text style={styles.rangeModalDateLabel}>ตั้งแต่</Text>
              <Text style={styles.rangeModalDateValue}>{formatThaiDate(formatYmd(draftStart))}</Text>
            </TouchableOpacity>
            {iosDatePick === 'start' && Platform.OS === 'ios' ? (
              <View style={styles.rangeModalPickerWrap}>
                <DateTimePicker
                  value={draftStart}
                  mode="date"
                  display="inline"
                  themeVariant="light"
                  locale="th-TH"
                  maximumDate={startPickerMax}
                  onChange={(_, date) => {
                    if (date) setDraftStart(toStartOfDay(date));
                  }}
                />
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.rangeModalDateRow}
              onPress={() =>
                Platform.OS === 'android' ? setAndroidPick('end') : setIosDatePick((p) => (p === 'end' ? null : 'end'))
              }
            >
              <Text style={styles.rangeModalDateLabel}>ถึง</Text>
              <Text style={styles.rangeModalDateValue}>{formatThaiDate(formatYmd(draftEnd))}</Text>
            </TouchableOpacity>
            {iosDatePick === 'end' && Platform.OS === 'ios' ? (
              <View style={styles.rangeModalPickerWrap}>
                <DateTimePicker
                  value={draftEnd}
                  mode="date"
                  display="inline"
                  themeVariant="light"
                  locale="th-TH"
                  minimumDate={draftStart}
                  maximumDate={todayCap}
                  onChange={(_, date) => {
                    if (date) setDraftEnd(toStartOfDay(date));
                  }}
                />
              </View>
            ) : null}

            {showCustomRangeModal && androidPick === 'start' ? (
              <DateTimePicker
                value={draftStart}
                mode="date"
                display="default"
                themeVariant="light"
                maximumDate={startPickerMax}
                onChange={(e, d) => onAndroidDateChange(e, d, 'start')}
              />
            ) : null}
            {showCustomRangeModal && androidPick === 'end' ? (
              <DateTimePicker
                value={draftEnd}
                mode="date"
                display="default"
                themeVariant="light"
                minimumDate={draftStart}
                maximumDate={todayCap}
                onChange={(e, d) => onAndroidDateChange(e, d, 'end')}
              />
            ) : null}

            <View style={styles.rangeModalActions}>
              <TouchableOpacity style={[styles.rangeModalBtn, styles.rangeModalBtnGhost]} onPress={closeCustomRangeModal}>
                <Text style={styles.rangeModalBtnGhostText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.rangeModalBtn, styles.rangeModalBtnPrimary]} onPress={applyCustomRange}>
                <Text style={styles.rangeModalBtnPrimaryText}>ใช้ช่วงนี้</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBF9' },
  contentInset: { marginHorizontal: 20 },
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
  selectorBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1EAE4',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 12,
  },
  selectorBlockTop: {
    marginTop: 8,
  },
  selectorBlockRange: {
    backgroundColor: '#F2F8F4',
    borderColor: '#C5DDD0',
    marginBottom: 6,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E4D2B',
    letterSpacing: 0.2,
    marginBottom: 10,
  },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 0 },
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
  chartRowWeek: {
    alignItems: 'flex-end',
    gap: 14,
    paddingLeft: 10,
    paddingRight: 14,
    paddingVertical: 4,
  },
  chartRowMonth: {
    alignItems: 'flex-end',
    gap: 12,
    paddingLeft: 12,
    paddingRight: 20,
    paddingVertical: 6,
  },
  barItemWeek: {
    alignItems: 'center',
    minWidth: 30,
    paddingHorizontal: 2,
  },
  barItemMonth: {
    alignItems: 'center',
    minWidth: 36,
    paddingHorizontal: 4,
  },
  barValue: { fontSize: 10, color: '#577062', marginBottom: 6, textAlign: 'center' },
  barTrackWeek: {
    width: 12,
    height: 130,
    borderRadius: 10,
    backgroundColor: '#E9F0EC',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barTrackMonth: {
    width: 16,
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
  rangeModalRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  rangeModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  rangeModalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E1EAE4',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  rangeModalTitle: { fontSize: 18, fontWeight: '800', color: '#1E4D2B' },
  rangeModalSubtitle: { marginTop: 6, fontSize: 12, color: '#688A7A', lineHeight: 17 },
  rangeModalDateRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F4F7F5',
    borderWidth: 1,
    borderColor: '#E1EAE4',
  },
  rangeModalDateLabel: { fontSize: 13, fontWeight: '700', color: '#5C7A6E' },
  rangeModalDateValue: { fontSize: 14, fontWeight: '700', color: '#1E4D2B' },
  rangeModalPickerWrap: { marginTop: 8, maxHeight: 220, overflow: 'hidden' },
  rangeModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  rangeModalBtn: { paddingVertical: 11, paddingHorizontal: 18, borderRadius: 12 },
  rangeModalBtnGhost: { backgroundColor: '#EEF4F1' },
  rangeModalBtnGhostText: { color: '#3D5A4C', fontWeight: '700', fontSize: 15 },
  rangeModalBtnPrimary: { backgroundColor: '#1E4D2B' },
  rangeModalBtnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
