import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import MapView, { Polyline, Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const STEP_THRESHOLD = 1.2;
const STEP_DELAY = 300;

export default function StepTrackerScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [routeCoords, setRouteCoords] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  const lastStepTime = useRef(0);
  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  const timerRef = useRef(null);
  const locationRef = useRef(null);
  const stepsRef = useRef(0);
  const distanceRef = useRef(0);

  // ── ขอ permission ──
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ต้องการ permission', 'กรุณาอนุญาตให้เข้าถึง GPS');
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  // ── Accelerometer สำหรับนับก้าว ──
  useEffect(() => {
    if (!isRunning) return;

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
  }, [isRunning]);

  // ── GPS tracking ──
  useEffect(() => {
    if (!isRunning) return;

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
  }, [isRunning]);

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
      date: new Date().toISOString(),
      steps: stepsRef.current,
      distance: distanceRef.current,
      calories: Math.round(stepsRef.current * 0.04),
      duration: elapsedTime,
      route: routeCoords,
    };

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
      `ก้าว: ${stepsRef.current}\nระยะทาง: ${distanceRef.current.toFixed(2)} km\nแคลอรี่: ${Math.round(stepsRef.current * 0.04)} kcal`,
      [
        { text: 'ตกลง', onPress: resetSession },
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
    resetSession();
  };

  const resetSession = () => {
    setSteps(0);
    setDistance(0);
    setCalories(0);
    setElapsedTime(0);
    setRouteCoords([]);
    stepsRef.current = 0;
    distanceRef.current = 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* ── Map ── */}
        <View style={styles.mapContainer}>
          {currentLocation && (
            <MapView style={styles.map} region={currentLocation}>
              <Polyline
                coordinates={routeCoords}
                strokeColor="#2E7D5B"
                strokeWidth={4}
              />
              {routeCoords.length > 0 && (
                <Marker coordinate={routeCoords[0]} title="เริ่มต้น" />
              )}
            </MapView>
          )}
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsGrid}>
          {[
            { label: 'ก้าว', value: steps.toLocaleString(), unit: 'steps' },
            { label: 'ระยะทาง', value: distance.toFixed(2), unit: 'km' },
            { label: 'แคลอรี่', value: calories, unit: 'kcal' },
            { label: 'เวลา', value: formatTime(elapsedTime), unit: '' },
          ].map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statUnit}>{item.unit}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBF9' },
  mapContainer: { height: 300, margin: 16, borderRadius: 20, overflow: 'hidden' },
  map: { flex: 1 },
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
});