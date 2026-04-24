import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import WaterProgressRing from '../components/water/waterProgressRing';
import WaterQuickPick from '../components/water/WaterQuickPick';
import WaterGoalModal from '../components/water/WaterGoalModal';
import { useWater } from '../context/WaterContext';
import { useProfile } from '../context/ProfileContext';
import { useGarden } from '../context/GardenContext';
import { AuthContext } from '../context/AuthProvider';
import { useLevel } from '../context/LevelContext';
import { recommendedWaterMl } from '../utils/waterFormula';
import StackScreenBackButton from '../components/StackScreenBackButton';

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F9FF' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 28 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  loadingTxt: { fontSize: 14, color: '#546E7A' },
  ringCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 14,
    marginTop: 105,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  logs: { marginTop: 8 },
  logHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  logTitle: { fontSize: 17, fontWeight: '800', color: '#263238' },
  overGoalBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1565C0',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  logSum: { fontSize: 14, color: '#78909C', fontWeight: '600' },
  empty: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  emptyTxt: { fontSize: 14, color: '#78909C', textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#42A5F5', marginRight: 12 },
  amt: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1565C0' },
  time: { fontSize: 13, color: '#90A4AE' },
  delBtn: { padding: 8, marginLeft: 4 },
});

function formatLogTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function WaterScreen({ route }) {
  const fromHomeFeature = route?.params?.fromHomeFeature === true;
  const { notifyHomeFeatureGoalMet } = useLevel();
  const { userToken } = useContext(AuthContext);
  const { profile } = useProfile();

  const weightNum = profile.weight != null && profile.weight !== '' ? Number(profile.weight) : null;
  const activityLevel = profile.activityLevel != null ? Number(profile.activityLevel) : 1;

  useEffect(() => {
    if (__DEV__ && userToken && (weightNum == null || Number.isNaN(weightNum) || weightNum <= 0)) {
      console.warn('[Water] ไม่มีน้ำหนักในโปรไฟล์ — ค่าแนะนำจาก 0 kg');
    }
  }, [userToken, weightNum]);

  const wFor = weightNum != null && !Number.isNaN(weightNum) && weightNum > 0 ? weightNum : 0;
  const recommendedWater = recommendedWaterMl(wFor, activityLevel);

  const { consumed, waterGoal, setWaterGoal, addWater, removeWaterLog, logs, loading, refreshWater } = useWater();
  const { logFeature } = useGarden();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const doneCalled = useRef(false);

  useFocusEffect(useCallback(() => { if (userToken) refreshWater(); }, [userToken, refreshWater]));

  useEffect(() => {
    if (consumed < waterGoal) doneCalled.current = false;
  }, [consumed, waterGoal]);

  useEffect(() => {
    if (waterGoal <= 0) return;
    if (consumed < waterGoal) return;
    if (doneCalled.current) return;
    doneCalled.current = true;
    if (userToken) {
      logFeature('water').catch((err) => {
        console.error('logFeature water:', err);
        doneCalled.current = false;
      });
    }
    if (fromHomeFeature) notifyHomeFeatureGoalMet('water');
  }, [consumed, waterGoal, fromHomeFeature, userToken, logFeature, notifyHomeFeatureGoalMet]);

  const handlePick = (ml) => {
    addWater(ml);
  };

  const handleSaveGoal = async (parsed) => {
    if (parsed > consumed) doneCalled.current = false;
    await setWaterGoal(parsed);
  };

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <StackScreenBackButton tintColor="#1565C0" />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View style={s.loading}>
            <ActivityIndicator color="#1565C0" />
            <Text style={s.loadingTxt}>กำลังโหลด…</Text>
          </View>
        ) : null}

        <View style={s.ringCard}>
          <WaterProgressRing
            consumed={consumed}
            recommended={waterGoal}
            accentColor="#1976D2"
            trackColor="#E8EEF5"
            recommendedDaily={recommendedWater}
            onEditGoal={() => setShowGoalModal(true)}
          />
        </View>

        <WaterQuickPick onPick={handlePick} />

        <View style={s.logs}>
          <View style={s.logHead}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={s.logTitle}>วันนี้</Text>
              {consumed > waterGoal && waterGoal > 0 && (
                <Text style={s.overGoalBadge}>เกินเป้าหมายแล้ว</Text>
              )}
            </View>
            <Text style={s.logSum}>{consumed} มล.</Text>
          </View>
          {!userToken ? (
            <Empty icon="cloud-offline-outline" text="ล็อกอินเพื่อเก็บประวัติรายครั้ง" />
          ) : logs.length === 0 ? (
            <Empty icon="beaker-outline" text="ยังไม่มีรายการ — แตะปริมาณหรือพิมพ์มล.ด้านบน" />
          ) : (
            logs.map((item) => (
              <View key={item.id} style={s.row}>
                <View style={s.dot} />
                <Text style={s.amt}>+{item.amountMl} มล.</Text>
                <Text style={s.time}>{formatLogTime(item.createdAt)}</Text>
                <TouchableOpacity
                  style={s.delBtn}
                  onPress={() => removeWaterLog(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="ลบรายการ"
                >
                  <Ionicons name="trash-outline" size={20} color="#C62828" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <WaterGoalModal
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        recommendedWater={recommendedWater}
        waterGoal={waterGoal}
        onSave={handleSaveGoal}
      />
    </SafeAreaView>
  );
}

function Empty({ icon, text }) {
  return (
    <View style={s.empty}>
      <Ionicons name={icon} size={32} color="#90A4AE" />
      <Text style={s.emptyTxt}>{text}</Text>
    </View>
  );
}
