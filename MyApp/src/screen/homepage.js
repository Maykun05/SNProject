import React, { useState } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,Image,Modal} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getHomeFeatures,saveHomeFeatures,} from '../services/homeFeatureService';
import {getMoodByDate,setMoodByDate,} from '../services/moodService';

/* ======================
   CONFIG
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

const MOODS = {
  rad: '😆',
  good: '🙂',
  meh: '😐',
  bad: '😞',
  awful: '😵',
};

const TREE_IMAGES = [
  require('../assets/tree_0.png'),
  require('../assets/tree_1.png'),
  require('../assets/tree_2.png'),
  require('../assets/tree_3.png'),
  require('../assets/tree_4.png'),
  require('../assets/tree_5.png'),
];

const todayKey = () => new Date().toISOString().slice(0, 10);

/* ======================
   HOME PAGE
====================== */

export default function Homepage() {
  const navigation = useNavigation();

  const [doneMap, setDoneMap] = useState({});
  const [enabledFeatures, setEnabledFeatures] = useState({});
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  /* ===== โหลดข้อมูลทุกครั้งที่เข้า Home ===== */
  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        const features = await getHomeFeatures();
        setEnabledFeatures(features);

        const today = todayKey();
        const result = {};

        for (const f of FEATURES) {
          if (f.key === 'mood') {
            const mood = await getMoodByDate(today);
            result.mood = !!mood;
          } else {
            const value = await AsyncStorage.getItem(
              `daily_${f.key}_${today}`
            );
            result[f.key] = !!value;
          }
        }
        setDoneMap(result);
      };
      load();
    }, [])
  );

  const visibleFeatures = FEATURES.filter(
    f => enabledFeatures[f.key] !== false
  );

  const doneCount = visibleFeatures.filter(
    f => doneMap[f.key]
  ).length;

  const treeImage =
    TREE_IMAGES[Math.min(doneCount, TREE_IMAGES.length - 1)];

  /* ===== handler mood icon ===== */
  const onPressMoodIcon = () => {
    setShowMoodPicker(prev => !prev); // กดซ้ำ = เปิด/ปิด
  };

  return (
    <View style={styles.container}>
      {/* ===== Header ===== */}
      <View style={styles.header}>
        <Text style={styles.logo}>SeeU Healthy</Text>
      </View>

      <Text style={styles.username}>เอวา</Text>

      {/* ===== วงกลม ===== */}
      <View style={styles.circleWrapper}>
        <View style={styles.mainCircle}>
          <Image source={treeImage} style={styles.centerImage} />
          <Text style={styles.progressText}>
            {doneCount}/{visibleFeatures.length} เป้าหมาย
          </Text>
        </View>

        {/* ===== ไอคอนรอบวง ===== */}
        {visibleFeatures
          .filter(f => !doneMap[f.key])
          .map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.circleIcon, f.position]}
              onPress={() => {
                if (f.key === 'mood') {
                  onPressMoodIcon();
                } else {
                  navigation.navigate(f.route);
                }
              }}
            >
              <MaterialCommunityIcons name={f.icon} size={26} />
            </TouchableOpacity>
          ))}
      </View>

      <TouchableOpacity onPress={() => setShowFeatureModal(true)}>
          <Ionicons name="add-circle-outline" size={28} />
        </TouchableOpacity>

      {/* ===== เมนูล่าง ===== */}
      <View style={styles.menuRow}>
        
        {visibleFeatures.map(f => (
          <TouchableOpacity
            key={f.key}
            style={styles.menuItem}
            onPress={() => {
              if (f.key === 'mood') {
                onPressMoodIcon();
              } else {
                navigation.navigate(f.route);
              }
            }}
          >
            <MaterialCommunityIcons name={f.icon} size={28} />
            <Text style={styles.menuText}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ===== Mood Picker (อยู่ล่างฟีเจอร์) ===== */}
      {showMoodPicker && (
        <View style={styles.moodBar}>
          {Object.entries(MOODS).map(([key, emoji]) => (
            <TouchableOpacity
              key={key}
              onPress={async () => {
                await setMoodByDate(todayKey(), key);
                setDoneMap(prev => ({ ...prev, mood: true }));
                setShowMoodPicker(false);
              }}
            >
              <Text style={styles.moodEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ===== Modal เลือกฟีเจอร์ ===== */}
      <Modal transparent visible={showFeatureModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>เลือกฟีเจอร์</Text>

            {FEATURES.map(f => (
              <TouchableOpacity
                key={f.key}
                onPress={async () => {
                  const updated = {
                    ...enabledFeatures,
                    [f.key]: !enabledFeatures[f.key],
                  };
                  setEnabledFeatures(updated);
                  await saveHomeFeatures(updated);
                }}
              >
                <Text>
                  {enabledFeatures[f.key] !== false ? '✅' : '⬜'} {f.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowFeatureModal(false)}
              style={{ marginTop: 10, alignSelf: 'flex-end' }}
            >
              <Text>ปิด</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ======================
   STYLES
====================== */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },

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

  username: { textAlign: 'center', marginVertical: 12 },

  circleWrapper: {
    alignSelf: 'center',
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },

  mainCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerImage: { width: 100, height: 100 },

  progressText: { marginTop: 6, fontSize: 15 },

  circleIcon: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#abb9a7ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },

  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 11,
  },

  menuItem: { alignItems: 'center' },

  menuText: { fontSize: 12, marginTop: 4 },

  moodBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#E6F7F4',
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 18,
  },

  moodEmoji: { fontSize: 28 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '80%',
  },

  modalTitle: { fontWeight: 'bold', marginBottom: 10 },
});
