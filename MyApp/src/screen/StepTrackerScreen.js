import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, Alert, FlatList, Dimensions,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import MapView, { Polyline, Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STEP_THRESHOLD = 1.2;
const STEP_DELAY = 300;

const EXERCISE_MODES = [
  { key: 'walk',  label: 'เดิน',     icon: 'walk-outline',      color: '#2E7D32', bg: '#E8F5E9', accent: '#4CAF50' },
  { key: 'run',   label: 'วิ่ง',      icon: 'body-outline',      color: '#1565C0', bg: '#E3F2FD', accent: '#2196F3' },
  { key: 'swim',  label: 'ว่ายน้ำ',   icon: 'water-outline',     color: '#00695C', bg: '#E0F2F1', accent: '#26A69A' },
  { key: 'gym',   label: 'ยิม',       icon: 'barbell-outline',   color: '#BF360C', bg: '#FBE9E7', accent: '#FF5722' },
  { key: 'bike',  label: 'จักรยาน',   icon: 'bicycle-outline',   color: '#E65100', bg: '#FFF3E0', accent: '#FF9800' },
  { key: 'yoga',  label: 'โยคะ',      icon: 'body-outline',      color: '#6A1B9A', bg: '#F3E5F5', accent: '#AB47BC' },
];

export default function StepTrackerScreen({ route }) {
  const initialMode = route?.params?.mode
    ? EXERCISE_MODES.find(m => m.key === route.params.mode.key) ?? EXERCISE_MODES[0]
    : EXERCISE_MODES[0];

  const [selectedMode, setSelectedMode] = useState(initialMode);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [routeCoords, setRouteCoords] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const lastStepTime = useRef(0);
  const timerRef = useRef(null);
  const locationRef = useRef(null);
  const stepsRef = useRef(0);
  const distanceRef = useRef(0);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') Alert.alert('ต้องการ permission', 'กรุณาอนุญาตให้เข้าถึง GPS');
      const loc = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (magnitude > STEP_THRESHOLD && now - lastStepTime.current > STEP_DELAY) {
        lastStepTime.current = now;
        stepsRef.current += 1;
        setSteps(stepsRef.current);
        setCalories(Math.round(stepsRef.current * 0.04));
      }
    });
    return () => sub.remove();
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    let lastCoord = null;
    locationRef.current = Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 2000, distanceInterval: 2 },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        const newCoord = { latitude, longitude };
        setRouteCoords(prev => [...prev, newCoord]);
        setCurrentLocation({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        if (lastCoord) {
          distanceRef.current += getDistance(lastCoord, newCoord);
          setDistance(parseFloat(distanceRef.current.toFixed(3)));
        }
        lastCoord = newCoord;
      }
    );
    return () => { locationRef.current?.then(sub => sub.remove()); };
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const getDistance = (c1, c2) => {
    const R = 6371;
    const dLat = ((c2.latitude - c1.latitude) * Math.PI) / 180;
    const dLon = ((c2.longitude - c1.longitude) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((c1.latitude * Math.PI) / 180) *
      Math.cos((c2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`;
  };

  // แทนที่ handleStop เดิมทั้งหมด
const handlePause = () => {
  setIsRunning(false);
  setIsPaused(true);
};

const handleResume = () => {
  setIsRunning(true);
  setIsPaused(false);
};

const handleSave = async () => {
  setIsPaused(false);

  const session = {
    mode: selectedMode.key,
    date: new Date().toISOString(),
    steps: stepsRef.current,
    distance: distanceRef.current,
    calories: Math.round(stepsRef.current * 0.04),
    duration: elapsedTime,
    route: routeCoords,
  };

  // บันทึกลง AsyncStorage
  try {
    const existing = await AsyncStorage.getItem('STEP_SESSIONS');
    const sessions = existing ? JSON.parse(existing) : [];
    sessions.push(session);
    await AsyncStorage.setItem('STEP_SESSIONS', JSON.stringify(sessions));
  } catch (e) {
    console.error(e);
  }

  // ✅ markDone แจ้ง HomeScreen ว่าทำเสร็จแล้ว
  const onDone = route?.params?.onDone;
  if (onDone) onDone();

  Alert.alert(
    '🎉 บันทึกสำเร็จ!',
    `${selectedMode.label} · ก้าว: ${stepsRef.current}\nระยะทาง: ${distanceRef.current.toFixed(2)} km\nแคลอรี่: ${Math.round(stepsRef.current * 0.04)} kcal`,
    [{ text: 'ตกลง', onPress: resetSession }]
  );
};
  const syncToBackend = async (session) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/steps`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });
      if (res.ok) Alert.alert('✅ Sync สำเร็จ');
      else Alert.alert('❌ Sync ไม่สำเร็จ');
    } catch { Alert.alert('❌ ไม่สามารถเชื่อมต่อ server'); }
    resetSession();
  };

  const resetSession = () => {
    setSteps(0); setDistance(0); setCalories(0);
    setElapsedTime(0); setRouteCoords([]);
    stepsRef.current = 0; distanceRef.current = 0;
  };

  const m = selectedMode;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Mode Selector (Strava-style horizontal scroll) ── */}
        <View style={styles.modeSection}>
          <FlatList
            data={EXERCISE_MODES}
            keyExtractor={item => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modeList}
            renderItem={({ item }) => {
              const active = item.key === selectedMode.key;
              return (
                <TouchableOpacity
                  style={[
                    styles.modeChip,
                    active
                      ? { backgroundColor: item.color, borderColor: item.color }
                      : { backgroundColor: '#fff', borderColor: '#E0E0E0' },
                  ]}
                  onPress={() => !isRunning && setSelectedMode(item)}
                  activeOpacity={0.75}
                  disabled={isRunning}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={active ? '#fff' : item.color}
                  />
                  <Text style={[
                    styles.modeChipLabel,
                    { color: active ? '#fff' : '#555' },
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* ── Map ── */}
        <View style={styles.mapContainer}>
          {currentLocation && (
            <MapView style={styles.map} region={currentLocation}>
              <Polyline coordinates={routeCoords} strokeColor={m.accent} strokeWidth={4} />
              {routeCoords.length > 0 && <Marker coordinate={routeCoords[0]} title="เริ่มต้น" />}
            </MapView>
          )}
          {/* overlay badge บน map */}
          <View style={[styles.mapModeBadge, { backgroundColor: m.color }]}>
            <Ionicons name={m.icon} size={14} color="#fff" />
            <Text style={styles.mapModeBadgeText}>{m.label}</Text>
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsGrid}>
          {[
            { label: 'ก้าว',      value: steps.toLocaleString(), unit: 'steps' },
            { label: 'ระยะทาง',  value: distance.toFixed(2),     unit: 'km'    },
            { label: 'แคลอรี่',  value: calories,                unit: 'kcal'  },
            { label: 'เวลา',     value: formatTime(elapsedTime), unit: ''       },
          ].map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: m.color }]}>{item.value}</Text>
              <Text style={styles.statUnit}>{item.unit}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── ปุ่มหลัก ── */}
{!isPaused ? (
  <TouchableOpacity
    style={[styles.mainBtn, { backgroundColor: isRunning ? '#E53935' : m.color }]}
    onPress={isRunning ? handlePause : () => setIsRunning(true)}
    activeOpacity={0.85}
  >
    <Ionicons name={isRunning ? 'pause' : 'play'} size={22} color="#fff" />
    <Text style={styles.mainBtnText}>{isRunning ? 'หยุด' : 'เริ่ม'}</Text>
  </TouchableOpacity>
) : (
  // ── Paused: ไปต่อ / บันทึก ──
  <View style={styles.pausedRow}>
    <TouchableOpacity
      style={[styles.actionBtn, styles.resumeBtn]}
      onPress={handleResume}
      activeOpacity={0.85}
    >
      <Ionicons name="play" size={20} color={m.color} />
      <Text style={[styles.actionBtnText, { color: m.color }]}>ไปต่อ</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.actionBtn, styles.saveBtn, { backgroundColor: m.color }]}
      onPress={handleSave}
      activeOpacity={0.85}
    >
      <Ionicons name="checkmark" size={20} color="#fff" />
      <Text style={[styles.actionBtnText, { color: '#fff' }]}>บันทึก</Text>
    </TouchableOpacity>
  </View>
)}

        {isRunning && (
          <Text style={styles.runningHint}>ระหว่างออกกำลังกาย ไม่สามารถเปลี่ยนโหมดได้</Text>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8F7' },

  // ── Mode selector ──
  modeSection: { paddingTop: 12 },
  modeList: { paddingHorizontal: 16, gap: 8 },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 40,
    borderWidth: 1.5,
  },
  modeChipLabel: { fontSize: 13, fontWeight: '600' },

  // ── Map ──
  mapContainer: {
    height: 280, margin: 16, borderRadius: 20,
    overflow: 'hidden', position: 'relative',
  },
  map: { flex: 1 },
  mapModeBadge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 5, paddingHorizontal: 10,
    borderRadius: 20,
  },
  mapModeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // ── Stats ──
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    marginHorizontal: 16, gap: 10,
  },
  statCard: {
    width: '47%', backgroundColor: '#fff',
    borderRadius: 16, padding: 16, alignItems: 'center',
    elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 }, shadowRadius: 3,
  },
  statValue: { fontSize: 28, fontWeight: '800' },
  statUnit: { fontSize: 12, color: '#aaa', marginTop: 1 },
  statLabel: { fontSize: 13, color: '#888', marginTop: 2 },

  // ── Button ──
  mainBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    margin: 16, paddingVertical: 18,
    borderRadius: 40, elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 }, shadowRadius: 6,
  },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  runningHint: {
    textAlign: 'center', fontSize: 12,
    color: '#bbb', marginBottom: 20, marginTop: -8,
  },

  pausedRow: {
  flexDirection: 'row',
  marginHorizontal: 16,
  marginVertical: 16,
  gap: 12,
},
actionBtn: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  paddingVertical: 18,
  borderRadius: 40,
  elevation: 3,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 3 },
  shadowRadius: 6,
},
resumeBtn: {
  backgroundColor: '#fff',
  borderWidth: 2,
  borderColor: '#E0E0E0',
},
saveBtn: {
  // backgroundColor set inline ตามโหมด
},
actionBtnText: {
  fontSize: 17,
  fontWeight: '800',
},
});