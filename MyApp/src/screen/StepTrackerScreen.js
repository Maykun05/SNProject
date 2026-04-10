import React, { useMemo, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLevel } from '../context/LevelContext';
import { useProfile } from '../context/ProfileContext';
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
import { postActivitySession } from '../services/activitySessionsApi';
import {
  shouldShowExerciseSessionSavedNotification,
  showExerciseSessionSavedNotification,
} from '../notifications/exerciseSessionNotification';

/** ชดเชย tab bar ลอย (BottomTabNavigator: bottom 30 + height 64) */
const TAB_BAR_OVERLAY_PAD = 30 + 64 + 20;

export default function StepTrackerScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { notifyStepSessionSaved } = useLevel();
  const { profile } = useProfile();
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
  const customDisplayName =
    isCustom && customConfig?.name?.trim() ? customConfig.name.trim().slice(0, 40) : '';
  const activity = {
    ...baseActivity,
    label: customDisplayName || baseActivity.label,
    metrics: customMetrics,
    tracking: customTracking,
  };
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
      planDate,
      instanceId,
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

    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await postActivitySession(token, session);
      }
    } catch (e) {
      console.warn('sync activity session to server:', e);
    }

    if (shouldShowExerciseSessionSavedNotification(profile?.settings)) {
      const notiBody =
        `${activity.label} · ${formatTime(durationSec)} · ` +
        `${isQualified ? 'ผ่านเป้าหมายแล้ว' : 'บันทึกแล้ว (ยังไม่ครบเป้า)'}`;
      await showExerciseSessionSavedNotification({
        title: 'บันทึกเซสชันสำเร็จ',
        body: notiBody,
      });
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

  useLayoutEffect(() => {
    navigation.setOptions({
      title: activity.label,
      headerTitleStyle: { fontSize: 17, fontWeight: '700' },
    });
  }, [navigation, activity.label]);

  const sessionReady = Boolean(
    !sessionLoading &&
    meta &&
    meta.instanceId === instanceId &&
    meta.planDate === planDate
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_OVERLAY_PAD }}
        showsVerticalScrollIndicator={false}
      >
        {draftRestored ? (
          <View style={styles.resumeBanner}>
            <View style={styles.resumeBannerIconWrap}>
              <Ionicons name="cloud-done-outline" size={20} color="#1565C0" />
            </View>
            <View style={styles.resumeBannerBody}>
              <Text style={styles.resumeBannerTitle}>มีข้อมูลจากรอบก่อน</Text>
              <Text style={styles.resumeBannerText}>
                กดเริ่มเพื่อนับต่อ หรือจบเซสชันใหม่เมื่อออกกำลังครบแล้ว
              </Text>
            </View>
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
          <Text style={styles.goalBannerTitle}>เป้าหมายรอบนี้</Text>
          <Text style={styles.goalBannerSummary}>{goalSummaryText}</Text>
          <Text
            style={[
              styles.goalBannerStatus,
              liveQualified ? styles.goalBannerStatusOk : styles.goalBannerStatusPending,
            ]}
          >
            {liveQualified ? 'ครบเกณฑ์แล้ว — จบเซสชันเพื่อบันทึก' : 'ยังไม่ครบเกณฑ์'}
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

        <View style={[styles.heroTimeCard, { borderColor: `${activity.color}33` }]}>
          <Text style={styles.heroTimeLabel}>เวลา</Text>
          <Text style={[styles.heroTimeValue, { color: activity.color }]}>
            {formatTime(elapsedTime ?? 0)}
          </Text>
          <Text style={styles.heroTimeHint}>
            {isRunning ? 'กำลังจับเวลา' : hasProgress ? 'หยุดชั่วคราว' : 'กดเริ่มด้านล่าง'}
          </Text>
        </View>

        <Text style={styles.statsSectionTitle}>สถิติรอบนี้</Text>
        <View style={styles.statsGrid}>
          {[
            activity.metrics.includes('steps')
              ? { label: 'ก้าว', value: (steps ?? 0).toLocaleString(), unit: 'ก้าว' }
              : null,
            activity.metrics.includes('distance')
              ? { label: 'ระยะทาง', value: (distance ?? 0).toFixed(2), unit: 'km' }
              : null,
            activity.metrics.includes('laps')
              ? { label: 'รอบสระ', value: String(laps), unit: 'รอบ' }
              : null,
            activity.metrics.includes('sets')
              ? { label: 'เซต', value: String(sets), unit: 'เซต' }
              : null,
            activity.metrics.includes('reps')
              ? { label: 'ครั้ง', value: String(reps), unit: 'ครั้ง' }
              : null,
            { label: 'แคลอรี่', value: String(calories ?? 0), unit: 'kcal' },
          ].filter(Boolean).map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: activity.color }]}>{item.value}</Text>
              <Text style={styles.statUnit}>{item.unit}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {(activity.metrics.includes('laps') || activity.metrics.includes('sets') || activity.metrics.includes('reps')) && (
          <View style={[styles.counterPanel, { borderLeftColor: activity.color }]}>
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

        <View style={styles.actionCard}>
          <Text style={styles.actionCardTitle}>การทำงาน</Text>
          <Text style={styles.actionCardHint}>
            หยุดชั่วคราว = พักก่อน · จบเซสชัน = บันทึกผลและกลับไปหน้าแผน
          </Text>

          <TouchableOpacity
            style={[
              styles.mainBtn,
              { backgroundColor: isRunning ? '#E65100' : activity.color },
              !sessionReady && styles.mainBtnDisabled,
            ]}
            disabled={!sessionReady}
            onPress={isRunning ? handlePause : handleStartOrResume}
            activeOpacity={0.88}
          >
            {!sessionReady ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={isRunning ? 'pause' : 'play'}
                  size={22}
                  color="#fff"
                  style={styles.mainBtnIcon}
                />
                <Text style={styles.mainBtnText}>
                  {isRunning ? 'หยุดชั่วคราว' : hasProgress ? 'เริ่มต่อ' : 'เริ่ม'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {hasProgress ? (
            <TouchableOpacity
              style={[styles.finishBtn, { borderColor: activity.color }]}
              onPress={handleFinishAndSave}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-done" size={20} color={activity.color} style={styles.finishBtnIcon} />
              <View style={styles.finishBtnTextCol}>
                <Text style={[styles.finishBtnTitle, { color: activity.color }]}>จบและบันทึกผล</Text>
                <Text style={styles.finishBtnSubtitle}>เก็บประวัติ · อัปเดตเป้าหมายวันนี้</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>

        {(useGps && isRunning) || (useAccelerometer && isRunning) ? (
          <View style={styles.tipCard}>
            {useGps && isRunning ? (
              <Text style={styles.tipLine}>
                <Text style={styles.tipBold}>GPS </Text>
                สลับแอปได้ — อนุญาตตำแหน่ง &quot;ตลอดเวลา&quot; เพื่อเก็บเส้นทางต่อ
              </Text>
            ) : null}
            {useAccelerometer && isRunning ? (
              <Text style={[styles.tipLine, useGps && isRunning ? styles.tipLineSpaced : null]}>
                <Text style={styles.tipBold}>ก้าว </Text>
                บางเครื่องหยุดนับเมื่อแอปอยู่เบื้องหลัง
              </Text>
            ) : null}
          </View>
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
        <TouchableOpacity style={styles.counterBtn} onPress={onMinus} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="remove" size={22} color="#424242" />
        </TouchableOpacity>
        <Text style={styles.counterValue}>{value}</Text>
        <TouchableOpacity style={styles.counterBtn} onPress={onPlus} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="add" size={22} color="#424242" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F2' },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#E8EEF9',
    borderWidth: 1,
    borderColor: '#C5CAE9',
  },
  resumeBannerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeBannerBody: { flex: 1 },
  resumeBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A237E',
    marginBottom: 4,
  },
  resumeBannerText: { fontSize: 12, fontWeight: '500', color: '#3949AB', lineHeight: 18 },
  mapContainer: { height: 220, marginHorizontal: 16, marginTop: 8, borderRadius: 20, overflow: 'hidden' },
  mapPlaceholder: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 10,
  },
  mapPlaceholderText: { fontSize: 14, fontWeight: '600', textAlign: 'center', paddingHorizontal: 24 },
  map: { flex: 1 },
  goalBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8ECEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
  heroTimeCard: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  heroTimeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78909C',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroTimeValue: {
    fontSize: 56,
    fontWeight: '200',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  heroTimeHint: {
    marginTop: 8,
    fontSize: 13,
    color: '#90A4AE',
    fontWeight: '500',
  },
  statsSectionTitle: {
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '800',
    color: '#546E7A',
    letterSpacing: 0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    gap: 10,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  statValue: { fontSize: 24, fontWeight: '800', color: '#1B4332' },
  statUnit: { fontSize: 11, color: '#90A4AE', fontWeight: '600', marginTop: 2 },
  statLabel: { fontSize: 12, color: '#78909C', marginTop: 4, fontWeight: '600' },
  actionCard: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8ECEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#263238',
    marginBottom: 6,
  },
  actionCardHint: {
    fontSize: 12,
    color: '#78909C',
    lineHeight: 18,
    marginBottom: 16,
  },
  mainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    minHeight: 56,
  },
  mainBtnDisabled: { opacity: 0.45 },
  mainBtnIcon: { marginTop: 1 },
  mainBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  finishBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#FAFCFB',
    gap: 12,
  },
  finishBtnIcon: { marginTop: 2 },
  finishBtnTextCol: { flex: 1 },
  finishBtnTitle: { fontSize: 16, fontWeight: '800' },
  finishBtnSubtitle: { fontSize: 11, color: '#78909C', marginTop: 3, fontWeight: '500' },
  tipCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#ECEFF1',
  },
  tipLine: { fontSize: 12, color: '#546E7A', lineHeight: 18 },
  tipLineSpaced: { marginTop: 8 },
  tipBold: { fontWeight: '800', color: '#37474F' },
  counterPanel: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D5B',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    borderRightColor: '#ECEFF1',
    borderTopColor: '#ECEFF1',
    borderBottomColor: '#ECEFF1',
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterLabel: { fontSize: 15, fontWeight: '700', color: '#454545' },
  counterActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECEFF1',
  },
  counterValue: { minWidth: 32, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#263238' },
});
