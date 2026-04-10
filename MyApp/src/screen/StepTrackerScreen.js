import React, { useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLevel } from '../context/LevelContext';
import { useExerciseTracking } from '../context/ExerciseTrackingContext';
import { ACTIVITY_TEMPLATES, DEFAULT_ACTIVITY_KEY } from '../exercise/activityTemplates';
import {
  isSessionQualified,
  buildGoalSnapshot,
  getOrBranchProgress,
  formatProgressVsTarget,
  getActivityGoalSummary,
} from '../exercise/goalRules';
import { getExercisePlanDateKey } from '../utils/exercisePlan';
import { clearStepTrackerDraft } from '../utils/stepTrackerDraft';

/** ชดเชย tab bar ลอย (BottomTabNavigator: bottom 30 + height 64) */
const TAB_BAR_OVERLAY_PAD = 30 + 64 + 20;

export default function StepTrackerScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { notifyStepSessionSaved } = useLevel();
  const {
    meta,
    isRunning,
    elapsedTime,
    steps,
    distance,
    routeCoords,
    currentLocation,
    laps,
    sets,
    reps,
    calories,
    draftRestored,
    sessionLoading,
    attachOrLoadSession,
    start,
    pause,
    clearEngine,
    finishSnapshot,
    setLaps,
    setSets,
    setReps,
  } = useExerciseTracking();

  const planInstanceId = route?.params?.instanceId ?? null;
  const instanceId = planInstanceId ?? '__local_step__';
  const planDate = route?.params?.planDate ?? getExercisePlanDateKey();
  const activityKey = route?.params?.activityKey ?? DEFAULT_ACTIVITY_KEY;
  const customConfig = route?.params?.customConfig ?? null;
  const activityGoalOverride = route?.params?.activityGoalOverride ?? null;

  const customConfigKey = useMemo(
    () => JSON.stringify(customConfig ?? null),
    [customConfig]
  );
  const activityGoalOverrideKey = useMemo(
    () => JSON.stringify(activityGoalOverride ?? null),
    [activityGoalOverride]
  );

  const baseActivity = ACTIVITY_TEMPLATES[activityKey] ?? ACTIVITY_TEMPLATES[DEFAULT_ACTIVITY_KEY];
  const isCustom = activityKey === 'custom';
  const customMetric = customConfig?.metric ?? 'duration';
  const customMetrics = isCustom
    ? Array.from(new Set(['duration', customMetric, 'calories']))
    : baseActivity.metrics;
  const customTracking = isCustom
    ? {
      useAccelerometer: customMetric === 'steps',
      useGps: customMetric === 'distance',
    }
    : baseActivity.tracking;
  const activity = { ...baseActivity, metrics: customMetrics, tracking: customTracking };
  const { useAccelerometer, useGps } = activity.tracking;

  useFocusEffect(
    useCallback(() => {
      attachOrLoadSession({
        instanceId,
        planDate,
        activityKey,
        customConfig,
        activityGoalOverride,
      });
    }, [
      attachOrLoadSession,
      instanceId,
      planDate,
      activityKey,
      customConfigKey,
      activityGoalOverrideKey,
    ])
  );

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const hasProgress =
    elapsedTime > 0 || steps > 0 || distance > 0 || laps > 0 || sets > 0 || reps > 0;

  const handleStartOrResume = () => {
    start();
  };

  const handlePause = () => {
    pause();
  };

  const handleFinishAndSave = async () => {
    const snap = finishSnapshot();
    if (!snap) return;
    const {
      durationSec,
      stepsSnap,
      distSnap,
      routeSnap,
      lapsSnap,
      setsSnap,
      repsSnap,
      calSnap,
    } = snap;

    const session = {
      mode: activityKey,
      date: new Date().toISOString(),
      steps: useAccelerometer ? stepsSnap : null,
      distance: useGps ? distSnap : null,
      calories: calSnap,
      duration: durationSec,
      route: routeSnap,
      laps: activity.metrics.includes('laps') ? lapsSnap : null,
      sets: activity.metrics.includes('sets') ? setsSnap : null,
      reps: activity.metrics.includes('reps') ? repsSnap : null,
      customGoal: isCustom ? customConfig : null,
    };
    const isQualified = isSessionQualified(session, activityKey, activityGoalOverride);
    session.isQualified = isQualified;

    try {
      const existing = await AsyncStorage.getItem('STEP_SESSIONS');
      const sessions = existing ? JSON.parse(existing) : [];
      sessions.push(session);
      await AsyncStorage.setItem('STEP_SESSIONS', JSON.stringify(sessions));
    } catch (e) {
      console.error('save session error:', e);
    }

    Alert.alert(
      '🎉 บันทึกสำเร็จ!',
      `${activity.label}\n` +
      `เวลา: ${formatTime(durationSec)}\n` +
      `แคลอรี่: ${session.calories} kcal\n` +
      `${useAccelerometer ? `ก้าว: ${stepsSnap}\n` : ''}` +
      `${useGps ? `ระยะทาง: ${distSnap.toFixed(2)} km\n` : ''}` +
      `${activity.metrics.includes('laps') ? `รอบสระ: ${lapsSnap}\n` : ''}` +
      `${activity.metrics.includes('sets') ? `เซต: ${setsSnap}\n` : ''}` +
      `${activity.metrics.includes('reps') ? `ครั้ง: ${repsSnap}\n` : ''}` +
      `สถานะเป้าหมาย: ${isQualified ? 'ผ่าน' : 'ยังไม่ผ่าน'}`,
      [
        {
          text: 'ตกลง',
          onPress: () => {
            notifyStepSessionSaved(session);
            if (planDate) {
              clearStepTrackerDraft(planDate, instanceId).catch(() => {});
            }
            clearEngine().catch(() => {});
            if (navigation?.canGoBack?.()) {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const goalSnapshot = useMemo(
    () => buildGoalSnapshot({
      activityKey,
      useAccelerometer,
      useGps,
      steps,
      distance,
      duration: elapsedTime,
      calories,
      sets,
      reps,
      laps,
      metrics: activity.metrics,
      customConfig: isCustom ? customConfig : null,
    }),
    [
      activityKey,
      useAccelerometer,
      useGps,
      steps,
      distance,
      elapsedTime,
      calories,
      sets,
      reps,
      laps,
      activity.metrics,
      isCustom,
      customConfig,
    ]
  );

  const goalBranches = useMemo(
    () => getOrBranchProgress(
      activityKey,
      isCustom ? customConfig : null,
      goalSnapshot,
      isCustom ? null : activityGoalOverride
    ),
    [activityKey, customConfig, isCustom, goalSnapshot, activityGoalOverride]
  );

  const liveQualified = useMemo(
    () => isSessionQualified(goalSnapshot, activityKey, isCustom ? null : activityGoalOverride),
    [goalSnapshot, activityKey, isCustom, activityGoalOverride]
  );

  const goalSummaryText = useMemo(
    () => getActivityGoalSummary(
      activityKey,
      isCustom ? customConfig : null,
      isCustom ? null : activityGoalOverride
    ),
    [activityKey, isCustom, customConfig, activityGoalOverride]
  );

  const sessionReady = Boolean(
    !sessionLoading &&
    meta &&
    meta.instanceId === instanceId &&
    meta.planDate === planDate
  );
  const mainBtnLabel = !sessionReady
    ? '…'
    : isRunning
      ? '⏸ หยุดชั่วคราว'
      : (hasProgress ? '▶ เริ่มต่อ' : '▶ เริ่ม');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_OVERLAY_PAD }}
      >
        {planInstanceId && draftRestored ? (
          <View style={styles.resumeBanner}>
            <Ionicons name="information-circle-outline" size={18} color="#1565C0" />
            <Text style={styles.resumeBannerText}>
              โหลดความคืบหน้าที่ค้างไว้ — กดเริ่มต่อเพื่อนับต่อจากเดิม
            </Text>
          </View>
        ) : null}

        {useGps ? (
          <View style={styles.mapContainer}>
            {Boolean(currentLocation) && (
              <MapView style={styles.map} region={currentLocation}>
                <Polyline
                  coordinates={routeCoords}
                  strokeColor={activity.accent}
                  strokeWidth={4}
                />
                {Boolean(routeCoords.length > 0) && (
                  <Marker coordinate={routeCoords[0]} title="เริ่มต้น" />
                )}
              </MapView>
            )}
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name={activity.icon} size={34} color={activity.color} />
            <Text style={[styles.mapPlaceholderText, { color: activity.color }]}>
              {activity.label} — บันทึกตามกิจกรรมที่สร้างไว้
            </Text>
          </View>
        )}

        <View style={styles.goalBanner}>
          <Text style={styles.goalBannerTitle}>เป้าหมายวันนี้</Text>
          <Text style={styles.goalBannerSummary}>{goalSummaryText}</Text>
          <Text
            style={[
              styles.goalBannerStatus,
              liveQualified ? styles.goalBannerStatusOk : styles.goalBannerStatusPending,
            ]}
          >
            {liveQualified ? 'ผ่านเกณฑ์แล้ว (กดบันทึกผลเมื่อจบ)' : 'ยังไม่ผ่านเกณฑ์'}
          </Text>
          {goalBranches.length > 0 && (
            <View style={styles.goalBranchList}>
              {goalBranches.map((b) => (
                <View key={b.key} style={styles.goalBranchRow}>
                  <Text style={styles.goalBranchText}>
                    {formatProgressVsTarget(b.metric, b.current, b.target)}
                  </Text>
                  {b.done ? (
                    <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={18} color="#B0BEC5" />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.statsGrid}>
          {[
            activity.metrics.includes('steps')
              ? { label: 'ก้าว', value: (steps ?? 0).toLocaleString(), unit: 'steps' }
              : null,
            activity.metrics.includes('distance')
              ? { label: 'ระยะทาง', value: (distance ?? 0).toFixed(2), unit: 'km' }
              : null,
            activity.metrics.includes('laps')
              ? { label: 'รอบสระ', value: String(laps), unit: 'laps' }
              : null,
            activity.metrics.includes('sets')
              ? { label: 'เซต', value: String(sets), unit: 'sets' }
              : null,
            activity.metrics.includes('reps')
              ? { label: 'ครั้ง', value: String(reps), unit: 'reps' }
              : null,
            { label: 'แคลอรี่', value: String(calories ?? 0), unit: 'kcal' },
            { label: 'เวลา', value: formatTime(elapsedTime ?? 0), unit: '' },
          ].filter(Boolean).map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: activity.color }]}>{item.value}</Text>
              <Text style={styles.statUnit}>{item.unit}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {(activity.metrics.includes('laps') || activity.metrics.includes('sets') || activity.metrics.includes('reps')) && (
          <View style={styles.counterPanel}>
            {activity.metrics.includes('laps') && (
              <CounterRow label="รอบสระ" value={laps} onMinus={() => setLaps((v) => Math.max(0, v - 1))} onPlus={() => setLaps((v) => v + 1)} />
            )}
            {activity.metrics.includes('sets') && (
              <CounterRow label="เซต" value={sets} onMinus={() => setSets((v) => Math.max(0, v - 1))} onPlus={() => setSets((v) => v + 1)} />
            )}
            {activity.metrics.includes('reps') && (
              <CounterRow label="ครั้ง" value={reps} onMinus={() => setReps((v) => Math.max(0, v - 1))} onPlus={() => setReps((v) => v + 1)} />
            )}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.mainBtn,
            isRunning && styles.pauseBtn,
            !sessionReady && styles.mainBtnDisabled,
          ]}
          disabled={!sessionReady}
          onPress={isRunning ? handlePause : handleStartOrResume}
        >
          <Text style={styles.mainBtnText}>{mainBtnLabel}</Text>
        </TouchableOpacity>

        {hasProgress ? (
          <TouchableOpacity style={styles.finishBtn} onPress={handleFinishAndSave}>
            <Text style={styles.finishBtnText}>บันทึกผล (จบเซสชัน)</Text>
          </TouchableOpacity>
        ) : null}

        {useGps && isRunning ? (
          <Text style={styles.bgHint}>
            โหมด GPS: แอปจะพยายามเก็บเส้นทางต่อในพื้นหลังเมื่อสลับแอป (ต้องอนุญาตตำแหน่ง “ตลอดเวลา”)
          </Text>
        ) : null}
        {useAccelerometer && isRunning ? (
          <Text style={styles.bgHint}>
            การนับก้าวจากเซนเซอร์อาจหยุดเมื่อแอปอยู่เบื้องหลัง — กลับมาที่หน้านี้เพื่อนับต่อ
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function CounterRow({ label, value, onMinus, onPlus }) {
  return (
    <View style={styles.counterRow}>
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counterActions}>
        <TouchableOpacity style={styles.counterBtn} onPress={onMinus}>
          <Text style={styles.counterBtnText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.counterValue}>{value}</Text>
        <TouchableOpacity style={styles.counterBtn} onPress={onPlus}>
          <Text style={styles.counterBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBF9' },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  resumeBannerText: { flex: 1, fontSize: 12, fontWeight: '600', color: '#0D47A1', lineHeight: 17 },
  mapContainer: { height: 300, margin: 16, borderRadius: 20, overflow: 'hidden' },
  mapPlaceholder: {
    margin: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    gap: 10,
  },
  mapPlaceholderText: { fontSize: 14, fontWeight: '600' },
  map: { flex: 1 },
  goalBanner: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  goalBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#37474F',
    marginBottom: 4,
  },
  goalBannerSummary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#455A64',
    lineHeight: 20,
  },
  goalBannerStatus: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
  },
  goalBannerStatusOk: { color: '#2E7D32' },
  goalBannerStatusPending: { color: '#C62828' },
  goalBranchList: { marginTop: 10, gap: 6 },
  goalBranchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  goalBranchText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#607D8B',
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    marginHorizontal: 16, gap: 10, marginTop: 8,
  },
  statCard: {
    width: '47%', backgroundColor: '#fff',
    borderRadius: 16, padding: 16, alignItems: 'center',
    elevation: 2,
  },
  statValue: { fontSize: 28, fontWeight: '800', color: '#1B4332' },
  statUnit: { fontSize: 12, color: '#999' },
  statLabel: { fontSize: 13, color: '#666', marginTop: 2 },
  mainBtn: {
    backgroundColor: '#2E7D5B', marginHorizontal: 16, marginTop: 16,
    paddingVertical: 18, borderRadius: 40,
    alignItems: 'center', elevation: 4,
  },
  pauseBtn: { backgroundColor: '#F57C00' },
  mainBtnDisabled: { opacity: 0.5 },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  finishBtn: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2E7D5B',
    backgroundColor: '#fff',
  },
  finishBtnText: { color: '#2E7D5B', fontSize: 16, fontWeight: '800' },
  bgHint: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    fontSize: 11,
    color: '#78909C',
    lineHeight: 16,
    textAlign: 'center',
  },
  counterPanel: {
    marginHorizontal: 16,
    marginBottom: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterLabel: { fontSize: 15, fontWeight: '700', color: '#454545' },
  counterActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E8E8',
  },
  counterBtnText: { fontSize: 20, fontWeight: '800', color: '#333' },
  counterValue: { minWidth: 26, textAlign: 'center', fontSize: 16, fontWeight: '700' },
});
