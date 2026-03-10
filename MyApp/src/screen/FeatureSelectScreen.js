import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import {
  getHomeFeatures,
  saveHomeFeatures,
} from '../services/homeFeatureService';

/* ======================
   FEATURE LIST
====================== */

const FEATURE_LIST = [
  { key: 'water', label: 'บันทึกการดื่มน้ำ' },
  { key: 'calorie', label: 'บันทึกแคลอรี่' },
  { key: 'mood', label: 'บันทึกอารมณ์' },
  { key: 'exercise', label: 'บันทึกก้าวเดิน' },
  { key: 'sleep', label: 'บันทึกการนอนหลับ' },
];

/* ======================
   SCREEN
====================== */

export default function FeatureSelectScreen() {
  const navigation = useNavigation();
  const [selected, setSelected] = useState({});

  /* ===== load ค่าเริ่มต้น (เผื่อ default) ===== */
  useEffect(() => {
    const load = async () => {
      const features = await getHomeFeatures();
      setSelected(features);
    };
    load();
  }, []);

  /* ===== toggle feature ===== */
  const toggleFeature = key => {
    setSelected(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /* ===== save & go home ===== */
  const onSave = async () => {
    // ป้องกันไม่ให้กดผ่านถ้าไม่เลือกอะไรเลย
    const hasAny = Object.values(selected).some(v => v);
    if (!hasAny) return;

    await saveHomeFeatures(selected);
    await AsyncStorage.setItem('HAS_SELECTED_FEATURES', 'true');

    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          คุณสนใจฟีเจอร์ไหนบ้าง?
        </Text>

        {FEATURE_LIST.map(f => (
          <TouchableOpacity
            key={f.key}
            style={styles.option}
            onPress={() => toggleFeature(f.key)}
          >
            <View style={styles.radioOuter}>
              {selected[f.key] && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.optionText}>{f.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.saveBtn,
            !Object.values(selected).some(v => v) && styles.disabledBtn,
          ]}
          onPress={onSave}
        >
          <Text style={styles.saveText}>บันทึก</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ======================
   STYLES
====================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E7D5B',
    justifyContent: 'center',
    padding: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D5B',
    textAlign: 'center',
    marginBottom: 20,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2E7D5B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E7D5B',
  },

  optionText: {
    fontSize: 14,
    color: '#333',
  },

  saveBtn: {
    marginTop: 28,
    backgroundColor: '#2E7D5B',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },

  disabledBtn: {
    opacity: 0.4,
  },

  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
