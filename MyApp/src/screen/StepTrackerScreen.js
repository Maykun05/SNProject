import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import MapView, { Polyline, Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import { ACTIVITY_TEMPLATES, DEFAULT_ACTIVITY_KEY } from '../exercise/activityTemplates';
import {
  isSessionQualified,
  buildGoalSnapshot,
  getOrBranchProgress,
  formatProgressVsTarget,
  getActivityGoalSummary,
} from '../exercise/goalRules';

const STEP_THRESHOLD = 1.2;
const STEP_DELAY = 300;

const DURATION_CALORIE_PER_MIN = {
  walk: 4.5,
  run: 8,
  bike: 6,
  gym: 5.5,
  custom: 5,
};

export default function StepTrackerScreen({ route }) {
  const activityKey = route?.params?.activityKey ?? DEFAULT_ACTIVITY_KEY;
  const customConfig = route?.params?.customConfig ?? null;
  const activityGoalOverride = route?.params?.activityGoalOverride ?? null;
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

  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [routeCoords, setRouteCoords] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [laps, setLaps] = useState(0);
  const [sets, setSets] = useState(0);
  const [reps, setReps] = useState(0);

  const lastStepTime = useRef(0);
  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  const timerRef = useRef(null);
  const locationRef = useRef(null);
  const stepsRef = useRef(0);
  const distanceRef = useRef(0);

  // ── ขอ permission ──
  useEffect(() => {
    (async () => {
      if (!useGps) return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ต้องการ permission', 'กรุณาอนุญาตให้เข้าถึง GPS');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, [useGps]);

  // ── Accelerometer สำหรับนับก้าว ──
  useEffect(() => {
    if (!isRunning || !useAccelerometer) return;

    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (
        magnitude > STEP_THRESHOLD &&
        now - lastStepTime.current > STEP_DELAY
      ) {
        lastStepTime.current = now;
        stepsRef.current += 1;
        setSteps(stepsRef.current);
        // คำนวณแคลอรี่ (0.04 kcal ต่อก้าว)
        setCalories(Math.round(stepsRef.current * 0.04));
      }
      lastAccel.current = { x, y, z };
    });

    return () => sub.remove();
  }, [isRunning, useAccelerometer]);

  // ── GPS tracking ──
  useEffect(() => {
    if (!isRunning || !useGps) return;

    let lastCoord = null;
    locationRef.current = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000,
        distanceInterval: 2,
      },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        const newCoord = { latitude, longitude };

        setRouteCoords(prev => [...prev, newCoord]);
        setCurrentLocation({
          latitude, longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        if (lastCoord) {
          const d = getDistance(lastCoord, newCoord);
          distanceRef.current += d;
          setDistance(parseFloat(distanceRef.current.toFixed(3)));
        }
        lastCoord = newCoord;
      }
    );

    return () => {
      locationRef.current?.then(sub => sub.remove());
    };
  }, [isRunning, useGps]);

  // ── Timer ──
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // ── คำนวณระยะทาง (Haversine) ──
  const getDistance = (coord1, coord2) => {
    const R = 6371;
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    if (useAccelerometer) return;
    const perMin = DURATION_CALORIE_PER_MIN[activityKey] ?? 5;
    const byDuration = (elapsedTime / 60) * perMin;
    setCalories(Math.round(byDuration));
  }, [elapsedTime, useAccelerometer, activityKey]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = async () => {
    setIsRunning(false);

    const session = {
      mode: activityKey,
      date: new Date().toISOString(),
      steps: useAccelerometer ? stepsRef.current : null,
      distance: useGps ? distanceRef.current : null,
      calories: useAccelerometer ? Math.round(stepsRef.current * 0.04) : calories,
      duration: elapsedTime,
      route: useGps ? routeCoords : [],
      laps: activity.metrics.includes('laps') ? laps : null,
      sets: activity.metrics.includes('sets') ? sets : null,
      reps: activity.metrics.includes('reps') ? reps : null,
      customGoal: isCustom ? customConfig : null,
    };
    const isQualified = isSessionQualified(session, activityKey, activityGoalOverride);
    session.isQualified = isQualified;

    // ── บันทึกลง AsyncStorage ก่อน ──
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
      `เวลา: ${formatTime(elapsedTime)}\n` +
      `แคลอรี่: ${session.calories} kcal\n` +
      `${useAccelerometer ? `ก้าว: ${stepsRef.current}\n` : ''}` +
      `${useGps ? `ระยะทาง: ${distanceRef.current.toFixed(2)} km\n` : ''}` +
      `${activity.metrics.includes('laps') ? `รอบสระ: ${laps}\n` : ''}` +
      `${activity.metrics.includes('sets') ? `เซต: ${sets}\n` : ''}` +
      `${activity.metrics.includes('reps') ? `ครั้ง: ${reps}\n` : ''}` +
      `สถานะเป้าหมาย: ${isQualified ? 'ผ่าน' : 'ยังไม่ผ่าน'}`,
      [
        {
          text: 'ตกลง',
          onPress: () => {
            route?.params?.onSessionSaved?.(session);
            resetSession();
          },
        },
        { text: 'Sync ขึ้น Server', onPress: () => syncToBackend(session) },
      ]
    );
  };

  const syncToBackend = async (session) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/steps`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(session),
      });
      if (res.ok) Alert.alert('✅ Sync สำเร็จ');
      else Alert.alert('❌ Sync ไม่สำเร็จ');
    } catch (e) {
      Alert.alert('❌ ไม่สามารถเชื่อมต่อ server');
    }
    route?.params?.onSessionSaved?.(session);
    resetSession();
  };

  const resetSession = () => {
    setSteps(0);
    setDistance(0);
    setCalories(0);
    setElapsedTime(0);
    setRouteCoords([]);
    setLaps(0);
    setSets(0);
    setReps(0);
    stepsRef.current = 0;
    distanceRef.current = 0;
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* ── Map ── */}
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
              {activity.label} ใช้การบันทึกตาม template ที่เลือก
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
            {liveQualified ? 'ผ่านเกณฑ์แล้ว (กดหยุดเพื่อบันทึก)' : 'ยังไม่ผ่านเกณฑ์'}
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

        {/* ── Stats ── */}
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

        {/* ── Start/Stop Button ── */}
        <TouchableOpacity
          style={[styles.mainBtn, isRunning && styles.stopBtn]}
          onPress={isRunning ? handleStop : handleStart}
        >
          <Text style={styles.mainBtnText}>
            {isRunning ? '⏹ หยุด' : '▶ เริ่ม'}
          </Text>
        </TouchableOpacity>
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
    backgroundColor: '#2E7D5B', margin: 16,
    paddingVertical: 18, borderRadius: 40,
    alignItems: 'center', elevation: 4,
  },
  stopBtn: { backgroundColor: '#FF6347' },
  mainBtnText: { color: '#fff', fontSize: 20, fontWeight: '800' },
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