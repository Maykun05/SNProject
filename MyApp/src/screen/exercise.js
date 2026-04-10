import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ACTIVITY_KEYS, ACTIVITY_TEMPLATES } from '../exercise/activityTemplates';
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
  getExercisePlanDateKey,
  openGoalEditorValues,
  buildOverrideFromEditor,
  normalizeExerciseState,
  buildPlanForStorage,
  newExerciseInstanceId,
  EXERCISE_DAILY_BONUS_SLOTS,
} from '../utils/exercisePlan';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGarden } from '../context/GardenContext';
import { useLevel } from '../context/LevelContext';
import { getExerciseDay, putExerciseDay } from '../services/exerciseApi';
import { clearStepTrackerDraft } from '../utils/stepTrackerDraft';

/** เว้นพื้นที่ล่างให้เลื่อนเห็นรายการสุดท้าย (รวมแท็บ / home indicator) */
const SCROLL_BOTTOM_EXTRA = 88;

const PRESET_TEMPLATE_KEYS = ['walk', 'run', 'bike', 'gym'];

export default function ExerciseScreen({ navigation, route }) {
  const [activityInstances, setActivityInstances] = useState([]);
  const [progressById, setProgressById] = useState({});
  const [xpGrantedIds, setXpGrantedIds] = useState([]);

  const [createPresetKey, setCreatePresetKey] = useState(null);
  const [editA, setEditA] = useState('');
  const [editB, setEditB] = useState('');
  const [editLabels, setEditLabels] = useState({ labelA: '', labelB: '' });

  const [customModalVisible, setCustomModalVisible] = useState(false);
  /** เป้าเวลาในโมดัล — บันทึกเป็นวินาที (นาที × 60) */
  const [customTargetMinutes, setCustomTargetMinutes] = useState(10);
  const [customName, setCustomName] = useState('');

  const today = getExercisePlanDateKey();
  const fromHomeFeature = route?.params?.fromHomeFeature === true;
  const { notifyHomeFeatureGoalMet, setStepSessionSavedHandler, addXp } = useLevel();
  const insets = useSafeAreaInsets();
  const { logFeature, todayProgress, fetchTodayProgress } = useGarden();
  const allowApiSyncRef = useRef(false);
  const homeOnDoneCalledRef = useRef(false);
  const progressRef = useRef({});

  useEffect(() => {
    progressRef.current = progressById;
  }, [progressById]);

  useEffect(() => {
    let cancelled = false;
    allowApiSyncRef.current = false;

    const load = async () => {
      try {
        const [savedPlan, savedProgress] = await Promise.all([
          AsyncStorage.getItem(PLAN_STORAGE_KEY + today),
          AsyncStorage.getItem(PROGRESS_STORAGE_KEY + today),
        ]);
        let planRaw = {};
        let progRaw = {};
        if (savedPlan) {
          try {
            planRaw = JSON.parse(savedPlan);
          } catch (_) {
            planRaw = {};
          }
        }
        if (savedProgress) {
          try {
            progRaw = JSON.parse(savedProgress);
          } catch (_) {
            progRaw = {};
          }
        }

        const applyNormalized = (plan, prog) => {
          const n = normalizeExerciseState(plan, prog);
          if (!cancelled) {
            setActivityInstances(n.activityInstances);
            setProgressById(n.progressById);
            setXpGrantedIds(n.exerciseXpGrantedInstanceIds);
          }
        };

        applyNormalized(planRaw, progRaw);

        const token = await AsyncStorage.getItem('token');
        if (token) {
          const remote = await getExerciseDay(token, today);
          if (!cancelled && remote?.plan && typeof remote.plan === 'object') {
            const rp = remote.progress && typeof remote.progress === 'object' ? remote.progress : {};
            const localTs = Number(planRaw?.clientUpdatedAt) || 0;
            const remoteTs = Number(remote.plan?.clientUpdatedAt) || 0;

            const nLocal = normalizeExerciseState(planRaw, progRaw).activityInstances.length;
            const nRemote = normalizeExerciseState(remote.plan, rp).activityInstances.length;

            const remoteIsNewer =
              remoteTs > localTs || (remoteTs === localTs && nRemote > nLocal);

            if (remoteIsNewer) {
              applyNormalized(remote.plan, rp);
              const n = normalizeExerciseState(remote.plan, rp);
              await AsyncStorage.setItem(PLAN_STORAGE_KEY + today, JSON.stringify(n.planObject));
              await AsyncStorage.setItem(PROGRESS_STORAGE_KEY + today, JSON.stringify(n.progressById));
            }
          }
        }
      } catch (e) {
        console.log('load exercise plan error:', e);
      } finally {
        if (!cancelled) allowApiSyncRef.current = true;
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [today]);

  const planForStorage = useMemo(
    () => buildPlanForStorage(activityInstances, xpGrantedIds),
    [activityInstances, xpGrantedIds]
  );

  useEffect(() => {
    AsyncStorage.setItem(PLAN_STORAGE_KEY + today, JSON.stringify(planForStorage)).catch((e) =>
      console.log('save plan error:', e)
    );
  }, [planForStorage, today]);

  useEffect(() => {
    AsyncStorage.setItem(PROGRESS_STORAGE_KEY + today, JSON.stringify(progressById)).catch((e) =>
      console.log('save progress error:', e)
    );
  }, [progressById, today]);

  const completedCount = useMemo(
    () => activityInstances.filter((i) => progressById[i.id]).length,
    [activityInstances, progressById]
  );

  const ringArcProgress =
    EXERCISE_DAILY_BONUS_SLOTS <= 0
      ? 0
      : Math.min(completedCount, EXERCISE_DAILY_BONUS_SLOTS) / EXERCISE_DAILY_BONUS_SLOTS;

  const ringLabelText = `${completedCount}/${EXERCISE_DAILY_BONUS_SLOTS}`;

  const exerciseFeatureDone =
    activityInstances.length >= 1 && activityInstances.some((i) => progressById[i.id]);

  useEffect(() => {
    fetchTodayProgress();
  }, [fetchTodayProgress]);

  useEffect(() => {
    if (!exerciseFeatureDone) {
      homeOnDoneCalledRef.current = false;
      return;
    }
    if (todayProgress?.completedFeatures?.includes('exercise')) return;
    logFeature('exercise');
  }, [exerciseFeatureDone, todayProgress?.completedFeatures, logFeature]);

  useEffect(() => {
    if (!exerciseFeatureDone || !fromHomeFeature) return;
    if (homeOnDoneCalledRef.current) return;
    homeOnDoneCalledRef.current = true;
    notifyHomeFeatureGoalMet('exercise');
  }, [exerciseFeatureDone, fromHomeFeature, notifyHomeFeatureGoalMet]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!allowApiSyncRef.current) return;
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        await putExerciseDay(token, today, planForStorage, progressById);
      } catch (e) {
        console.log('exercise api sync error:', e);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [planForStorage, progressById, today]);

  const openCreatePresetModal = (templateKey) => {
    const v = openGoalEditorValues(templateKey, null);
    setEditA(v.a);
    setEditB(v.b);
    setEditLabels({ labelA: v.labelA, labelB: v.labelB });
    setCreatePresetKey(templateKey);
  };

  const closeCreatePresetModal = () => setCreatePresetKey(null);

  const saveCreatePreset = () => {
    if (!createPresetKey) return;
    const next = buildOverrideFromEditor(createPresetKey, editA, editB);
    const id = newExerciseInstanceId();
    setActivityInstances((prev) => [
      ...prev,
      { id, templateKey: createPresetKey, goalOverride: next, customConfig: null },
    ]);
    setCreatePresetKey(null);
  };

  const openCustomModal = () => {
    setCustomTargetMinutes(10);
    setCustomName('');
    setCustomModalVisible(true);
  };

  const saveCustomCreate = () => {
    const id = newExerciseInstanceId();
    const trimmed = customName.trim().slice(0, 40);
    const minutes = Math.max(1, Math.round(Number(customTargetMinutes)) || 1);
    const targetSec = minutes * 60;
    setActivityInstances((prev) => [
      ...prev,
      {
        id,
        templateKey: 'custom',
        goalOverride: null,
        customConfig: {
          metric: 'duration',
          target: targetSec,
          ...(trimmed ? { name: trimmed } : {}),
        },
      },
    ]);
    setCustomModalVisible(false);
  };

  const customInstanceTitle = (instance) => {
    if (instance.templateKey === 'custom' && instance.customConfig?.name?.trim()) {
      return instance.customConfig.name.trim();
    }
    return ACTIVITY_TEMPLATES[instance.templateKey]?.label ?? instance.templateKey;
  };

  const confirmDeleteInstance = (instance) => {
    Alert.alert('ลบกิจกรรม', `ลบ "${customInstanceTitle(instance)}" จากรายการวันนี้?`, [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบ',
        style: 'destructive',
        onPress: () => {
          clearStepTrackerDraft(today, instance.id);
          setActivityInstances((prev) => prev.filter((x) => x.id !== instance.id));
          setProgressById((prev) => {
            const next = { ...prev };
            delete next[instance.id];
            progressRef.current = next;
            return next;
          });
        },
      },
    ]);
  };

  const openTracker = (inst) => {
    const { id: instanceId, templateKey, goalOverride, customConfig } = inst;
    const customCfg = templateKey === 'custom' ? customConfig : null;
    const activityGoalOverride = templateKey !== 'custom' ? goalOverride : null;
    setStepSessionSavedHandler((session) => {
      if (!session?.isQualified) return;
      if (progressRef.current[instanceId]) return;
      progressRef.current = { ...progressRef.current, [instanceId]: true };
      setProgressById((prev) => ({ ...prev, [instanceId]: true }));
      setXpGrantedIds((g) => {
        if (g.includes(instanceId) || g.length >= EXERCISE_DAILY_BONUS_SLOTS) return g;
        addXp(10);
        return [...g, instanceId];
      });
    });
    navigation.navigate('StepTracker', {
      instanceId,
      planDate: today,
      activityKey: templateKey,
      customConfig: customCfg,
      activityGoalOverride,
    });
  };

  const pendingLabels = activityInstances
    .filter((i) => !progressById[i.id])
    .map((i) => customInstanceTitle(i))
    .filter(Boolean);

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
            <ExerciseProgressRing progress={ringArcProgress} />
            <Text style={styles.ringText}>{ringLabelText}</Text>
            <Text style={styles.ringCaption}>สำเร็จ / โควตาโบนัส XP วันนี้ (3)</Text>
          </View>
        </View>

        <Text style={styles.helperText}>
          กด &quot;เพิ่ม&quot; เพื่อสร้างกิจกรรมและกำหนดเป้าหมาย — ทำสำเร็จอย่างน้อย 1 รายการเพื่อนับฟีเจอร์ exercise บนโฮม
          โบนัส 10 XP ต่อครั้งที่ผ่านเป้า สูงสุด 3 ครั้งต่อวัน (เลขซ้ายคือจำนวนที่สำเร็จจริง เลขขวาคือโควตา)
        </Text>

        {activityInstances.length > 1 && pendingLabels.length > 0 && (
          <Text style={styles.pendingSummary}>
            ยังต้องทำ: {pendingLabels.join(' · ')}
          </Text>
        )}

        <Text style={styles.sectionTitle}>เพิ่มกิจกรรม</Text>
        {ACTIVITY_KEYS.map((key) => {
          const item = ACTIVITY_TEMPLATES[key];
          return (
            <View key={key} style={styles.typeRow}>
              <View style={styles.typeRowLeft}>
                <Ionicons name={item.icon} size={22} color={item.color} />
                <Text style={styles.typeRowLabel}>{item.label}</Text>
              </View>
              <TouchableOpacity
                style={[styles.addTypeBtn, { borderColor: item.color }]}
                onPress={() => (key === 'custom' ? openCustomModal() : openCreatePresetModal(key))}
              >
                <Ionicons name="add-circle-outline" size={18} color={item.color} />
                <Text style={[styles.addTypeBtnText, { color: item.color }]}>เพิ่ม</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <Text style={styles.sectionTitle}>กิจกรรมของวันนี้</Text>
        {activityInstances.length === 0 ? (
          <Text style={styles.emptyHint}>ยังไม่มีรายการ — กดเพิ่มด้านบนเพื่อสร้างกิจกรรมแรก</Text>
        ) : null}
        {activityInstances.map((inst) => {
          const meta = ACTIVITY_TEMPLATES[inst.templateKey];
          const done = !!progressById[inst.id];
          const hasPreset = ACTIVITY_GOAL_RULES[inst.templateKey];
          const defaultSum = hasPreset ? getDefaultGoalSummary(inst.templateKey) : '';
          const goalSummary = getActivityGoalSummary(
            inst.templateKey,
            inst.templateKey === 'custom' ? inst.customConfig : null,
            inst.templateKey !== 'custom' ? inst.goalOverride : null
          );
          return (
            <View
              key={inst.id}
              style={[styles.activityBtn, { backgroundColor: done ? '#DFF3E6' : '#F4F4F4' }]}
            >
              <TouchableOpacity style={styles.activityMainTap} onPress={() => openTracker(inst)}>
                <View style={styles.activityRowInner}>
                  <View style={styles.activityLeft}>
                    <Ionicons name={meta.icon} size={20} color={meta.color} />
                    <View style={styles.activityTextCol}>
                      <Text style={styles.activityLabel}>
                        {inst.templateKey === 'custom' && inst.customConfig?.name?.trim()
                          ? inst.customConfig.name.trim()
                          : meta.label}
                      </Text>
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
              <TouchableOpacity
                style={styles.deleteGoalBtn}
                onPress={() => confirmDeleteInstance(inst)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="ลบกิจกรรม"
              >
                <Ionicons name="trash-outline" size={22} color={meta.color} />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <ExerciseGoalEditModal
        visible={createPresetKey != null && PRESET_TEMPLATE_KEYS.includes(createPresetKey)}
        title={
          createPresetKey
            ? `สร้างกิจกรรม — ${ACTIVITY_TEMPLATES[createPresetKey]?.label ?? ''}`
            : ''
        }
        activityLabel=""
        defaultSummaryHint={createPresetKey ? getDefaultGoalSummary(createPresetKey) : ''}
        labelA={editLabels.labelA}
        labelB={editLabels.labelB}
        valueA={editA}
        valueB={editB}
        onChangeA={setEditA}
        onChangeB={setEditB}
        onCancel={closeCreatePresetModal}
        onSave={saveCreatePreset}
      />

      <Modal visible={customModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>สร้างกิจกรรม — กำหนดเวลาและชื่อ</Text>
            <Text style={styles.modalHint}>ตั้งชื่อที่จำได้ แล้วกำหนดระยะเวลาเป้าหมาย (นาที)</Text>
            <Text style={styles.nameFieldLabel}>ชื่อกิจกรรม</Text>
            <TextInput
              style={styles.nameInput}
              value={customName}
              onChangeText={setCustomName}
              placeholder="เช่น โยคะเช้า · ปั่นกลับบ้าน"
              placeholderTextColor="#9E9E9E"
              maxLength={40}
            />
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>เป้าเวลา</Text>
              <View style={styles.targetActions}>
                <TouchableOpacity
                  style={styles.targetBtn}
                  onPress={() => setCustomTargetMinutes((v) => Math.max(1, v - 1))}
                >
                  <Text style={styles.targetBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.targetValue}>{customTargetMinutes} นาที</Text>
                <TouchableOpacity
                  style={styles.targetBtn}
                  onPress={() => setCustomTargetMinutes((v) => v + 1)}
                >
                  <Text style={styles.targetBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGhost]} onPress={() => setCustomModalVisible(false)}>
                <Text style={styles.modalBtnGhostText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={saveCustomCreate}>
                <Text style={styles.modalBtnPrimaryText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    top: '40%',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D5B',
  },
  ringCaption: {
    position: 'absolute',
    top: '58%',
    fontSize: 11,
    fontWeight: '600',
    color: '#8AA39A',
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#23413A',
    marginTop: 14,
    marginBottom: 8,
  },
  helperText: { color: '#7A7A7A', marginTop: 8, fontSize: 12, lineHeight: 18 },
  emptyHint: { color: '#9E9E9E', fontSize: 13, marginBottom: 8, lineHeight: 19 },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    backgroundColor: '#FAFAFA',
  },
  typeRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  typeRowLabel: { fontSize: 15, fontWeight: '700', color: '#2A2A2A' },
  addTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  addTypeBtnText: { fontWeight: '700', fontSize: 14 },
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
  deleteGoalBtn: {
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#23413A',
  },
  modalHint: {
    marginTop: 6,
    fontSize: 12,
    color: '#78909C',
    marginBottom: 10,
  },
  nameFieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E342E',
    marginBottom: 6,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#D7CCC8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#2A2A2A',
    marginBottom: 14,
    backgroundColor: '#FAFAFA',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnGhost: {
    borderWidth: 1,
    borderColor: '#B0BEC5',
  },
  modalBtnGhostText: {
    fontWeight: '700',
    color: '#546E7A',
  },
  modalBtnPrimary: {
    backgroundColor: '#2E7D5B',
  },
  modalBtnPrimaryText: {
    fontWeight: '800',
    color: '#fff',
  },
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
