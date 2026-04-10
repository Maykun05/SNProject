import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ACTIVITY_KEYS, ACTIVITY_TEMPLATES, DEFAULT_ACTIVITY_KEY } from '../exercise/activityTemplates';
import {
  ACTIVITY_GOAL_RULES,
  getActivityGoalSummary,
  getDefaultGoalSummary,
} from '../exercise/goalRules';
import ExerciseGoalEditModal from '../components/exercise/ExerciseGoalEditModal';
import ExerciseProgressRing from '../components/exercise/ExerciseProgressRing';
import {
  PLAN_STORAGE_KEY,
  PROGRESS_STORAGE_KEY,
  GOAL_EDITABLE_KEYS,
  getExercisePlanDateKey,
  openGoalEditorValues,
  buildOverrideFromEditor,
  customStep,
  formatTarget,
} from '../utils/exercisePlan';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** เว้นพื้นที่ล่างให้เลื่อนเห็นรายการสุดท้าย (รวมแท็บ / home indicator) */
const SCROLL_BOTTOM_EXTRA = 88;

export default function ExerciseScreen({ navigation, route }) {
  const [selectedActivities, setSelectedActivities] = useState([DEFAULT_ACTIVITY_KEY]);
  const [completedActivities, setCompletedActivities] = useState({});
  const [customMetric, setCustomMetric] = useState('duration');
  const [customTarget, setCustomTarget] = useState(900);
  const [goalOverrides, setGoalOverrides] = useState({});
  const [goalEditorKey, setGoalEditorKey] = useState(null);
  const [editA, setEditA] = useState('');
  const [editB, setEditB] = useState('');
  const [editLabels, setEditLabels] = useState({ labelA: '', labelB: '' });

  const today = getExercisePlanDateKey();
  const onDone = route?.params?.onDone;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const load = async () => {
      try {
        const [savedPlan, savedProgress] = await Promise.all([
          AsyncStorage.getItem(PLAN_STORAGE_KEY + today),
          AsyncStorage.getItem(PROGRESS_STORAGE_KEY + today),
        ]);
        if (savedPlan) {
          const parsed = JSON.parse(savedPlan);
          if (Array.isArray(parsed?.selectedActivities) && parsed.selectedActivities.length > 0) {
            const allowed = parsed.selectedActivities.filter((key) => !!ACTIVITY_TEMPLATES[key]);
            setSelectedActivities(allowed.length > 0 ? allowed : [DEFAULT_ACTIVITY_KEY]);
          }
          if (parsed?.customMetric) setCustomMetric(parsed.customMetric);
          if (Number.isFinite(Number(parsed?.customTarget))) setCustomTarget(Number(parsed.customTarget));
          if (parsed?.goalOverrides && typeof parsed.goalOverrides === 'object') {
            setGoalOverrides(parsed.goalOverrides);
          }
        }
        if (savedProgress) {
          const parsedProgress = JSON.parse(savedProgress);
          setCompletedActivities(parsedProgress || {});
        }
      } catch (e) {
        console.log('load exercise plan error:', e);
      }
    };
    load();
  }, [today]);

  useEffect(() => {
    AsyncStorage.setItem(
      PLAN_STORAGE_KEY + today,
      JSON.stringify({ selectedActivities, customMetric, customTarget, goalOverrides })
    ).catch((e) => console.log('save plan error:', e));
  }, [selectedActivities, today, customMetric, customTarget, goalOverrides]);

  useEffect(() => {
    AsyncStorage.setItem(
      PROGRESS_STORAGE_KEY + today,
      JSON.stringify(completedActivities)
    ).catch((e) => console.log('save progress error:', e));
  }, [completedActivities, today]);

  const validSelectedActivities = selectedActivities.filter((key) => !!ACTIVITY_TEMPLATES[key]);
  const selectedCount = validSelectedActivities.length;
  const completedCount = validSelectedActivities.filter((key) => completedActivities[key]).length;
  const progress = selectedCount === 0 ? 0 : completedCount / selectedCount;
  const allCompleted = selectedCount > 0 && completedCount === selectedCount;

  useEffect(() => {
    if (allCompleted && onDone) onDone();
  }, [allCompleted, onDone]);

  const selectedMeta = useMemo(
    () => validSelectedActivities.map((key) => ACTIVITY_TEMPLATES[key]).filter(Boolean),
    [validSelectedActivities]
  );

  const toggleActivity = (key) => {
    const currentlySelected = validSelectedActivities.includes(key);
    if (currentlySelected) {
      if (validSelectedActivities.length === 1) {
        Alert.alert('ต้องเลือกอย่างน้อย 1 กิจกรรม');
        return;
      }
      setSelectedActivities((prev) => prev.filter((k) => k !== key));
      return;
    }
    setSelectedActivities((prev) => [...prev, key]);
  };

  const openGoalModal = (activityKey) => {
    const v = openGoalEditorValues(activityKey, goalOverrides);
    setEditA(v.a);
    setEditB(v.b);
    setEditLabels({ labelA: v.labelA, labelB: v.labelB });
    setGoalEditorKey(activityKey);
  };

  const saveGoalModal = () => {
    if (!goalEditorKey) return;
    const next = buildOverrideFromEditor(goalEditorKey, editA, editB);
    setGoalOverrides((prev) => ({ ...prev, [goalEditorKey]: next }));
    setGoalEditorKey(null);
  };

  const openTracker = (activityKey) => {
    const customConfig = activityKey === 'custom'
      ? { metric: customMetric, target: customTarget }
      : null;
    const activityGoalOverride = activityKey !== 'custom' ? goalOverrides[activityKey] ?? null : null;
    navigation.navigate('StepTracker', {
      activityKey,
      selectedActivities: validSelectedActivities,
      customConfig,
      activityGoalOverride,
      onSessionSaved: (session) => {
        if (session?.isQualified) {
          setCompletedActivities((prev) => ({ ...prev, [activityKey]: true }));
        }
      },
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: SCROLL_BOTTOM_EXTRA + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topCard}>
          <View style={styles.ringWrapper}>
            <ExerciseProgressRing progress={progress} />
            <Text style={styles.ringText}>
              {completedCount}/{selectedCount || 1}
            </Text>
            <Text style={styles.ringCaption}>กิจกรรมที่ผ่านแล้ว</Text>
          </View>
        </View>

        <Text style={styles.helperText}>
          เลือกอย่างน้อย 1 กิจกรรม — ต้องผ่านเป้าครบทุกรายการที่เลือก (แตะไอคอนดินสอเพื่อปรับเป้า มีค่าแนะนำ)
        </Text>

        {validSelectedActivities.length > 1 && (
          <Text style={styles.pendingSummary}>
            ยังต้องทำ:{' '}
            {validSelectedActivities
              .filter((k) => !completedActivities[k])
              .map((k) => ACTIVITY_TEMPLATES[k]?.label)
              .filter(Boolean)
              .join(' · ') || 'ครบทุกกิจกรรม'}
          </Text>
        )}

        <Text style={styles.sectionTitle}>เลือกกิจกรรม</Text>
        <View style={styles.chipWrap}>
          {ACTIVITY_KEYS.map((key) => {
            const item = ACTIVITY_TEMPLATES[key];
            const active = selectedActivities.includes(key);
            return (
              <TouchableOpacity
                key={key}
                style={[styles.chip, active && { backgroundColor: item.color, borderColor: item.color }]}
                onPress={() => toggleActivity(key)}
              >
                <Ionicons name={item.icon} size={16} color={active ? '#fff' : item.color} />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {validSelectedActivities.includes('custom') && (
          <View style={styles.customCard}>
            <Text style={styles.customTitle}>ตั้งค่า Custom</Text>
            <Text style={styles.customSub}>เลือก metric และกำหนดเป้าหมายเอง</Text>

            <View style={styles.chipWrap}>
              {[
                { key: 'duration', label: 'เวลา (วินาที)' },
                { key: 'distance', label: 'ระยะทาง (km)' },
                { key: 'steps', label: 'ก้าว' },
                { key: 'sets', label: 'เซต' },
                { key: 'reps', label: 'ครั้ง' },
                { key: 'laps', label: 'รอบ' },
                { key: 'calories', label: 'kcal' },
              ].map((item) => {
                const active = customMetric === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.chip, active && styles.customMetricChip]}
                    onPress={() => setCustomMetric(item.key)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>เป้าหมาย</Text>
              <View style={styles.targetActions}>
                <TouchableOpacity
                  style={styles.targetBtn}
                  onPress={() => setCustomTarget((v) => Math.max(1, Number((v - customStep(customMetric)).toFixed(2))))}
                >
                  <Text style={styles.targetBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.targetValue}>{formatTarget(customTarget, customMetric)}</Text>
                <TouchableOpacity
                  style={styles.targetBtn}
                  onPress={() => setCustomTarget((v) => Number((v + customStep(customMetric)).toFixed(2)))}
                >
                  <Text style={styles.targetBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>เริ่มทำกิจกรรม</Text>
        {selectedMeta.map((activity) => {
          const done = !!completedActivities[activity.key];
          const hasPreset = ACTIVITY_GOAL_RULES[activity.key];
          const defaultSum = hasPreset ? getDefaultGoalSummary(activity.key) : '';
          const goalSummary = getActivityGoalSummary(
            activity.key,
            activity.key === 'custom' ? { metric: customMetric, target: customTarget } : null,
            activity.key !== 'custom' ? goalOverrides[activity.key] : null
          );
          return (
            <View
              key={activity.key}
              style={[styles.activityBtn, { backgroundColor: done ? '#DFF3E6' : '#F4F4F4' }]}
            >
              <TouchableOpacity style={styles.activityMainTap} onPress={() => openTracker(activity.key)}>
                <View style={styles.activityRowInner}>
                  <View style={styles.activityLeft}>
                    <Ionicons name={activity.icon} size={20} color={activity.color} />
                    <View style={styles.activityTextCol}>
                      <Text style={styles.activityLabel}>{activity.label}</Text>
                      {hasPreset ? (
                        <>
                          <Text style={styles.activityRecommendLine} numberOfLines={2}>
                            แนะนำ: {defaultSum}
                          </Text>
                          <Text style={styles.activityGoalLine} numberOfLines={2}>
                            เป้าหมาย: {goalSummary}
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.activityGoalLine} numberOfLines={2}>
                          เป้าหมาย: {goalSummary}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={[styles.activityStatus, { color: done ? '#2E7D32' : '#999' }]}>
                    {done ? 'สำเร็จแล้ว' : 'ยังไม่สำเร็จ'}
                  </Text>
                </View>
              </TouchableOpacity>
              {GOAL_EDITABLE_KEYS.includes(activity.key) && (
                <TouchableOpacity
                  style={styles.editGoalBtn}
                  onPress={() => openGoalModal(activity.key)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="แก้ไขเป้าหมาย"
                >
                  <Ionicons name="create-outline" size={22} color={activity.color} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      <ExerciseGoalEditModal
        visible={goalEditorKey != null}
        activityLabel={goalEditorKey ? ACTIVITY_TEMPLATES[goalEditorKey]?.label : ''}
        defaultSummaryHint={goalEditorKey ? getDefaultGoalSummary(goalEditorKey) : ''}
        labelA={editLabels.labelA}
        labelB={editLabels.labelB}
        valueA={editA}
        valueB={editB}
        onChangeA={setEditA}
        onChangeB={setEditB}
        onCancel={() => setGoalEditorKey(null)}
        onSave={saveGoalModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  topCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  ringWrapper: {
    alignItems: 'center',
    marginBottom: 2,
    paddingTop: 2,
    paddingBottom: 2,
  },
  ringText: {
    position: 'absolute',
    top: '43%',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D5B',
  },
  ringCaption: {
    position: 'absolute',
    top: '56%',
    fontSize: 12,
    fontWeight: '600',
    color: '#8AA39A',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#23413A',
    marginTop: 14,
    marginBottom: 8,
  },
  helperText: { color: '#7A7A7A', marginTop: 8, fontSize: 12, lineHeight: 18 },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  chipText: { color: '#444', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  activityBtn: {
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  activityMainTap: {
    flex: 1,
    padding: 14,
    paddingRight: 8,
  },
  editGoalBtn: {
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  activityRowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  activityLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  activityTextCol: { flex: 1, minWidth: 0 },
  activityLabel: { fontSize: 15, fontWeight: '700', color: '#2A2A2A' },
  activityRecommendLine: {
    marginTop: 4,
    fontSize: 11,
    color: '#8A9B94',
    fontWeight: '600',
    lineHeight: 15,
  },
  activityGoalLine: {
    marginTop: 2,
    fontSize: 12,
    color: '#5C6C66',
    fontWeight: '600',
    lineHeight: 16,
  },
  activityStatus: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  pendingSummary: {
    marginTop: 6,
    fontSize: 12,
    color: '#5D4037',
    fontWeight: '600',
    lineHeight: 17,
  },
  customCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DED7D3',
    backgroundColor: '#FBF8F6',
  },
  customTitle: { fontSize: 15, fontWeight: '700', color: '#4E342E' },
  customSub: { marginTop: 4, marginBottom: 8, color: '#7B655E', fontSize: 12 },
  customMetricChip: { backgroundColor: '#8D6E63', borderColor: '#8D6E63' },
  targetRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  targetLabel: { fontSize: 14, fontWeight: '700', color: '#4E342E' },
  targetActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  targetBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8DFDB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetBtnText: { fontSize: 18, fontWeight: '700', color: '#4E342E' },
  targetValue: { minWidth: 78, textAlign: 'center', fontWeight: '700', color: '#4E342E' },
});
