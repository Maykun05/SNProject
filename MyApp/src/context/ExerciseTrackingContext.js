import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, Alert } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { ACTIVITY_TEMPLATES, DEFAULT_ACTIVITY_KEY } from '../exercise/activityTemplates';
import {
  drainExerciseBackgroundCoords,
  EXERCISE_BG_LOCATION_TASK,
} from '../exercise/backgroundLocationTask';
import {
  DURATION_CALORIE_PER_MIN,
  STEP_DELAY_MS,
  STEP_THRESHOLD,
  haversineKm,
} from '../exercise/trackingMath';
import { loadStepTrackerDraft, saveStepTrackerDraft } from '../utils/stepTrackerDraft';

const Ctx = createContext(null);

function sameCustomConfig(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function buildActivityFromParams(activityKey, customConfig) {
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
  return {
    ...baseActivity,
    metrics: customMetrics,
    tracking: customTracking,
  };
}

const DRAFT_MS = 5000;

export function ExerciseTrackingProvider({ children }) {
  const [meta, setMeta] = useState(null);
  const metaRef = useRef(null);
  metaRef.current = meta;

  const [isRunning, setIsRunning] = useState(false);
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [segmentStartMs, setSegmentStartMs] = useState(null);

  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [routeCoords, setRouteCoords] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [laps, setLaps] = useState(0);
  const [sets, setSets] = useState(0);
  const [reps, setReps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [draftRestored, setDraftRestored] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [tick, setTick] = useState(0);

  const accumulatedMsRef = useRef(0);
  const segmentStartMsRef = useRef(null);

  const stepsRef = useRef(0);
  const distanceRef = useRef(0);
  const lastStepTimeRef = useRef(0);
  const lastGpsCoordRef = useRef(null);
  const locationSubRef = useRef(null);
  const routeCoordsRef = useRef([]);

  const getElapsedSeconds = useCallback(() => {
    const acc = accumulatedMsRef.current;
    const seg = segmentStartMsRef.current;
    const extra = seg != null ? Date.now() - seg : 0;
    return Math.floor((acc + extra) / 1000);
  }, []);

  const elapsedTime = useMemo(() => getElapsedSeconds(), [getElapsedSeconds, tick]);

  const mergeClockSync = useCallback(() => {
    const start = segmentStartMsRef.current;
    if (start == null) return;
    accumulatedMsRef.current += Date.now() - start;
    segmentStartMsRef.current = null;
    setAccumulatedMs(accumulatedMsRef.current);
    setSegmentStartMs(null);
  }, []);

  const startClock = useCallback(() => {
    const now = Date.now();
    segmentStartMsRef.current = now;
    setSegmentStartMs(now);
  }, []);

  const mergeBackgroundCoords = useCallback(() => {
    const pending = drainExerciseBackgroundCoords();
    if (pending.length === 0) {
      return routeCoordsRef.current;
    }
    const prev = routeCoordsRef.current;
    let last = lastGpsCoordRef.current ?? (prev.length ? prev[prev.length - 1] : null);
    let dist = distanceRef.current;
    const next = [...prev];
    for (const c of pending) {
      next.push(c);
      if (last) {
        dist += haversineKm(last, c);
      }
      last = c;
    }
    lastGpsCoordRef.current = last;
    distanceRef.current = dist;
    routeCoordsRef.current = next;
    setRouteCoords(next);
    setDistance(parseFloat(dist.toFixed(3)));
    if (last) {
      setCurrentLocation({
        latitude: last.latitude,
        longitude: last.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
    return next;
  }, []);

  const stopForegroundWatch = useCallback(() => {
    const p = locationSubRef.current;
    if (p) {
      p.then((sub) => sub?.remove()).catch(() => {});
      locationSubRef.current = null;
    }
  }, []);

  const stopBackgroundLocation = useCallback(async () => {
    try {
      const has = await Location.hasStartedLocationUpdatesAsync(EXERCISE_BG_LOCATION_TASK);
      if (has) {
        await Location.stopLocationUpdatesAsync(EXERCISE_BG_LOCATION_TASK);
      }
    } catch (_) {
      /* noop */
    }
  }, []);

  const startBackgroundLocation = useCallback(async () => {
    try {
      const fg = await Location.getForegroundPermissionsAsync();
      if (fg.status !== 'granted') return;
      const bg = await Location.requestBackgroundPermissionsAsync();
      if (bg.status !== 'granted') {
        return;
      }
      const started = await Location.hasStartedLocationUpdatesAsync(EXERCISE_BG_LOCATION_TASK);
      if (started) return;
      await Location.startLocationUpdatesAsync(EXERCISE_BG_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 2000,
        distanceInterval: 2,
        foregroundService: {
          notificationTitle: 'กำลังบันทึกการออกกำลังกาย',
          notificationBody: 'แอปกำลังติดตามตำแหน่งในพื้นหลัง',
        },
        pausesUpdatesAutomatically: false,
      });
    } catch (e) {
      console.warn('startBackgroundLocation:', e);
    }
  }, []);

  const persistDraftNow = useCallback(async () => {
    const m = metaRef.current;
    if (!m?.instanceId || !m.planDate) return;
    const et = getElapsedSeconds();
    const st = stepsRef.current;
    const dist = distanceRef.current;
    const has =
      et > 0 || st > 0 || dist > 0 || laps > 0 || sets > 0 || reps > 0;
    if (!has) return;
    await saveStepTrackerDraft(m.planDate, m.instanceId, {
      activityKey: m.activityKey,
      customConfig: m.customConfig,
      elapsedTime: et,
      steps: st,
      distance: dist,
      calories,
      routeCoords,
      laps,
      sets,
      reps,
    });
  }, [calories, getElapsedSeconds, laps, reps, routeCoords, sets]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, [isRunning]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        mergeBackgroundCoords();
        setTick((x) => x + 1);
      }
      if (next === 'background' || next === 'inactive') {
        persistDraftNow();
      }
    });
    return () => sub.remove();
  }, [mergeBackgroundCoords, persistDraftNow]);

  useEffect(() => {
    const m = meta;
    if (!m?.instanceId) return undefined;
    const id = setInterval(() => {
      persistDraftNow();
    }, DRAFT_MS);
    return () => clearInterval(id);
  }, [meta?.instanceId, persistDraftNow]);

  const clearEngine = useCallback(async () => {
    setIsRunning(false);
    await stopBackgroundLocation();
    stopForegroundWatch();
    setMeta(null);
    accumulatedMsRef.current = 0;
    segmentStartMsRef.current = null;
    setAccumulatedMs(0);
    setSegmentStartMs(null);
    stepsRef.current = 0;
    distanceRef.current = 0;
    setSteps(0);
    setDistance(0);
    setCalories(0);
    setLaps(0);
    setSets(0);
    setReps(0);
    routeCoordsRef.current = [];
    setRouteCoords([]);
    lastGpsCoordRef.current = null;
    setCurrentLocation(null);
    setDraftRestored(false);
  }, [stopBackgroundLocation, stopForegroundWatch]);

  const attachOrLoadSession = useCallback(
    async (params) => {
      const {
        instanceId,
        planDate,
        activityKey = DEFAULT_ACTIVITY_KEY,
        customConfig = null,
        activityGoalOverride = null,
      } = params || {};
      if (!instanceId || !planDate) {
        await clearEngine();
        return;
      }
      const cur = metaRef.current;
      if (
        cur &&
        cur.instanceId === instanceId &&
        cur.planDate === planDate
      ) {
        mergeBackgroundCoords();
        setTick((x) => x + 1);
        return;
      }

      setSessionLoading(true);
      try {
        setIsRunning(false);
        mergeClockSync();
        await stopBackgroundLocation();
        stopForegroundWatch();

        if (cur?.instanceId && cur?.planDate) {
          await persistDraftNow();
        }

        const activity = buildActivityFromParams(activityKey, customConfig);
        const nextMeta = {
          instanceId,
          planDate,
          activityKey,
          customConfig,
          activityGoalOverride,
          useGps: activity.tracking.useGps,
          useAccelerometer: activity.tracking.useAccelerometer,
          isCustom: activityKey === 'custom',
          metrics: activity.metrics,
          activity,
        };
        setMeta(nextMeta);

        const d = await loadStepTrackerDraft(planDate, instanceId);
        if (
          d &&
          d.activityKey === activityKey &&
          sameCustomConfig(d.customConfig, customConfig)
        ) {
          const et = Math.max(0, Math.round(Number(d.elapsedTime) || 0));
          const st = Math.max(0, Math.round(Number(d.steps) || 0));
          const dist = Math.max(0, Number(d.distance) || 0);
          accumulatedMsRef.current = et * 1000;
          segmentStartMsRef.current = null;
          setAccumulatedMs(et * 1000);
          setSegmentStartMs(null);
          stepsRef.current = st;
          distanceRef.current = dist;
          setSteps(st);
          setDistance(dist);
          setCalories(Math.max(0, Math.round(Number(d.calories) || 0)));
          const nl = Math.max(0, Math.round(Number(d.laps) || 0));
          const ns = Math.max(0, Math.round(Number(d.sets) || 0));
          const nr = Math.max(0, Math.round(Number(d.reps) || 0));
          setLaps(nl);
          setSets(ns);
          setReps(nr);
          const coords = Array.isArray(d.routeCoords) ? d.routeCoords : [];
          routeCoordsRef.current = coords;
          setRouteCoords(coords);
          lastGpsCoordRef.current = coords.length ? coords[coords.length - 1] : null;
          if (coords.length > 0) {
            const last = coords[coords.length - 1];
            setCurrentLocation({
              latitude: last.latitude,
              longitude: last.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
          setDraftRestored(et > 0 || st > 0 || dist > 0 || nl > 0 || ns > 0 || nr > 0);
        } else {
          accumulatedMsRef.current = 0;
          segmentStartMsRef.current = null;
          setAccumulatedMs(0);
          setSegmentStartMs(null);
          stepsRef.current = 0;
          distanceRef.current = 0;
          setSteps(0);
          setDistance(0);
          setCalories(0);
          setLaps(0);
          setSets(0);
          setReps(0);
          routeCoordsRef.current = [];
          setRouteCoords([]);
          lastGpsCoordRef.current = null;
          setDraftRestored(false);
        }
        setTick((x) => x + 1);
      } finally {
        setSessionLoading(false);
      }
    },
    [
      clearEngine,
      mergeBackgroundCoords,
      mergeClockSync,
      persistDraftNow,
      stopBackgroundLocation,
      stopForegroundWatch,
    ]
  );

  const start = useCallback(() => {
    const m = metaRef.current;
    if (!m) return;
    setIsRunning(true);
    startClock();
    if (m.useGps) {
      startBackgroundLocation();
    }
  }, [startBackgroundLocation, startClock]);

  const pause = useCallback(() => {
    setIsRunning(false);
    mergeClockSync();
    stopForegroundWatch();
    stopBackgroundLocation();
    mergeBackgroundCoords();
    persistDraftNow();
  }, [
    mergeBackgroundCoords,
    mergeClockSync,
    persistDraftNow,
    stopBackgroundLocation,
    stopForegroundWatch,
  ]);

  useEffect(() => {
    const m = meta;
    if (!m || !isRunning || !m.useAccelerometer) return undefined;
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (magnitude > STEP_THRESHOLD && now - lastStepTimeRef.current > STEP_DELAY_MS) {
        lastStepTimeRef.current = now;
        stepsRef.current += 1;
        setSteps(stepsRef.current);
        setCalories(Math.round(stepsRef.current * 0.04));
      }
    });
    return () => sub.remove();
  }, [meta, isRunning, meta?.useAccelerometer]);

  useEffect(() => {
    const m = meta;
    if (!m || !isRunning || !m.useGps) {
      stopForegroundWatch();
      return undefined;
    }
    let lastCoord = lastGpsCoordRef.current;
    const subP = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000,
        distanceInterval: 2,
      },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        const newCoord = { latitude, longitude };
        setRouteCoords((prev) => {
          const next = [...prev, newCoord];
          routeCoordsRef.current = next;
          return next;
        });
        setCurrentLocation({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        if (lastCoord) {
          const d = haversineKm(lastCoord, newCoord);
          distanceRef.current += d;
          setDistance(parseFloat(distanceRef.current.toFixed(3)));
        }
        lastCoord = newCoord;
        lastGpsCoordRef.current = newCoord;
      }
    );
    locationSubRef.current = subP;
    return () => {
      subP.then((s) => s.remove()).catch(() => {});
      if (locationSubRef.current === subP) locationSubRef.current = null;
    };
  }, [meta, isRunning, meta?.useGps, stopForegroundWatch]);

  useEffect(() => {
    const m = meta;
    if (!m || m.useAccelerometer) return undefined;
    const perMin = DURATION_CALORIE_PER_MIN[m.activityKey] ?? 5;
    const byDuration = (elapsedTime / 60) * perMin;
    setCalories(Math.round(byDuration));
  }, [elapsedTime, meta, meta?.activityKey, meta?.useAccelerometer]);

  useEffect(() => {
    (async () => {
      const m = meta;
      if (!m?.useGps) return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ต้องการ permission', 'กรุณาอนุญาตให้เข้าถึง GPS');
        return;
      }
      if (routeCoords.length > 0) return;
      const loc = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, [meta?.useGps, meta, routeCoords.length]);

  const finishSnapshot = useCallback(() => {
    const m = metaRef.current;
    if (!m) return null;
    setIsRunning(false);
    mergeClockSync();
    stopForegroundWatch();
    mergeBackgroundCoords();
    stopBackgroundLocation();
    const durationSec = Math.floor(accumulatedMsRef.current / 1000);
    const stepsSnap = stepsRef.current;
    const distSnap = distanceRef.current;
    const routeSnap = m.useGps ? [...routeCoordsRef.current] : [];
    const calSnap = m.useAccelerometer
      ? Math.round(stepsSnap * 0.04)
      : Math.round((durationSec / 60) * (DURATION_CALORIE_PER_MIN[m.activityKey] ?? 5));
    return {
      meta: m,
      durationSec,
      stepsSnap,
      distSnap,
      routeSnap,
      lapsSnap: laps,
      setsSnap: sets,
      repsSnap: reps,
      calSnap,
    };
  }, [laps, mergeBackgroundCoords, mergeClockSync, reps, sets, stopBackgroundLocation, stopForegroundWatch]);

  const value = useMemo(
    () => ({
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
      persistDraftNow,
      setLaps,
      setSets,
      setReps,
      finishSnapshot,
    }),
    [
      attachOrLoadSession,
      calories,
      clearEngine,
      currentLocation,
      distance,
      draftRestored,
      sessionLoading,
      elapsedTime,
      finishSnapshot,
      isRunning,
      laps,
      meta,
      pause,
      persistDraftNow,
      reps,
      routeCoords,
      sets,
      start,
      steps,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExerciseTracking() {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error('useExerciseTracking requires ExerciseTrackingProvider');
  }
  return v;
}

export function useExerciseTrackingOptional() {
  return useContext(Ctx);
}
