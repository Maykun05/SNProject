
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';


/* ======================
   CONFIG กลาง (ทุกฟีเจอร์)
====================== */

const FEATURES = [
  {
    key: 'sleep',
    label: 'การนอน',
    icon: 'sleep',
    route: 'Sleep',
    position: { top: -12, left: '50%', marginLeft: -22 },
  },
  {
    key: 'exercise',
    label: 'ออกกำลังกาย',
    icon: 'dumbbell',
    route: 'Exercise',
    position: { right: -12, top: '50%', marginTop: -22 },
  },
  {
    key: 'mood',
    label: 'อารมณ์',
    icon: 'emoticon-happy-outline',
    route: 'Mood',
    position: { bottom: -12, left: '50%', marginLeft: -22 },
  },
  {
    key: 'calorie',
    label: 'แคลอรี่',
    icon: 'food',
    route: 'Calorie',
    position: { left: -12, top: '50%', marginTop: -22 },
  },
  {
    key: 'water',
    label: 'น้ำ',
    icon: 'water',
    route: 'Water',
    position: { bottom: 24, left: 24 }, 
  },
];

/* ======================
   UTILS
====================== */

const todayKey = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/* ======================
   HOME PAGE
====================== */

export default function Homepage() {
  const navigation = useNavigation();
  const [doneMap, setDoneMap] = useState({});

  // โหลดสถานะทุกครั้งที่กลับมาหน้านี้
  useFocusEffect(
    React.useCallback(() => {
      loadDailyStatus();
    }, [])
  );

  const loadDailyStatus = async () => {
    const today = todayKey();
    const result = {};

    for (const f of FEATURES) {
      const value = await AsyncStorage.getItem(
        `daily_${f.key}_${today}`
      );
      result[f.key] = !!value;
    }

    setDoneMap(result);
  };

  return (
    <View style={styles.container}>
      {/* ===== Header ===== */}
      <View style={styles.header}>
        <Text style={styles.logo}>SeeU Healthy</Text>
        <Ionicons name="person-circle-outline" size={32} />
      </View>

      <Text style={styles.username}>เอวา</Text>

      {/* ===== วงกลมหลัก ===== */}
      <View style={styles.circleWrapper}>
        <View style={styles.mainCircle}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
            }}
            style={styles.centerImage}
          />
        </View>

        {/* ===== ICON รอบวง (ซ่อนเฉพาะที่กรอกแล้ว) ===== */}
        {FEATURES.filter(f => !doneMap[f.key]).map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.circleIcon, f.position]}
            onPress={() => navigation.navigate(f.route)}
          >
            <MaterialCommunityIcons name={f.icon} size={26} />
          </TouchableOpacity>
        ))}
      </View>

      {/* ===== เมนูล่าง (แสดงครบเสมอ) ===== */}
      <View style={styles.menuRow}>
  {FEATURES.map(f => (
    <TouchableOpacity
      key={f.key}
      style={styles.menuItem}
      onPress={() => navigation.navigate(f.route)}
    >
      <MaterialCommunityIcons name={f.icon} size={28} />
      <Text style={styles.menuText}>{f.label}</Text>
    </TouchableOpacity>
  ))}
</View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  logo: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    fontWeight: 'bold',
  },

  username: {
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 16,
  },

  circleWrapper: {
    alignSelf: 'center',
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },

  mainCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerImage: {
    width: 90,
    height: 90,
  },

  circleIcon: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },

  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: 10,
  },

  menuItem: {
    alignItems: 'center',
  },

  menuText: {
    fontSize: 12,
    marginTop: 4,
  },
});
