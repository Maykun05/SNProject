import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Platform, Animated, TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SLEEP_PRESETS = [5, 6, 7, 8, 9, 10];

const THEME = {
  primary:      '#2d5a2d',
  primaryLight: '#3B6D11',
  surface:      '#f5f7f2',
  surfaceDeep:  '#e8f0e4',
  text:         '#1e3a1e',
  textMuted:    '#7a9e7a',
  textLight:    '#a0b8a0',
  border:       '#d0e4c8',
};

export default function SleepQuickPicker({ visible, initialHours, onSelect, onClose }) {
  const [hours, setHours]     = useState(initialHours || 7);
  const [minutes, setMinutes] = useState(0);
  const [done, setDone]       = useState(false);
  const checkScale             = useState(new Animated.Value(0))[0];
  const popAnim                = useState(new Animated.Value(0.88))[0];
  const fadeAnim               = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      setHours(initialHours || 7);
      setMinutes(0);
      setDone(false);
      popAnim.setValue(0.88);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(popAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 90,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const totalHoursDecimal = hours + minutes / 60;

  const getSleepFeedback = () => {
    if (totalHoursDecimal < 6)  return { text: 'นอนน้อยเกินไป',       color: '#b94040' };
    if (totalHoursDecimal < 7)  return { text: 'ควรนอนเพิ่มอีกนิด',   color: '#a06020' };
    if (totalHoursDecimal <= 9) return { text: 'จำนวนการนอนที่ดีมาก', color: THEME.primaryLight };
    return                              { text: 'นอนมากเกินไปนะ',       color: '#3a6080' };
  };

  const feedback = getSleepFeedback();

  const handleSave = () => {
    setDone(true);
    checkScale.setValue(0);
    Animated.spring(checkScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 6,
    }).start();
    onSelect(totalHoursDecimal);
  };

  const handleClose = () => {
    setDone(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      {/* Overlay กดปิดได้ */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Card กลางจอ */}
      <View style={styles.centerWrapper} pointerEvents="box-none">
        <Animated.View style={[
          styles.card,
          { transform: [{ scale: popAnim }], opacity: fadeAnim },
        ]}>

          {done ? (
            /* ── หน้ายืนยัน ── */
            <View style={styles.doneContainer}>
              <Animated.View style={[
                styles.checkCircle,
                { transform: [{ scale: checkScale }] },
              ]}>
                <Ionicons name="checkmark" size={32} color="#e8f5e0" />
              </Animated.View>

              <Text style={styles.doneTitle}>
                บันทึกแล้ว {hours} ชม.{minutes > 0 ? ` ${minutes} นาที` : ''}
              </Text>
              <Text style={[styles.doneSub, { color: feedback.color }]}>
                {feedback.text}
              </Text>

              <TouchableOpacity style={styles.doneCloseBtn} onPress={handleClose}>
                <Text style={styles.doneCloseTxt}>เสร็จสิ้น</Text>
              </TouchableOpacity>
            </View>

          ) : (
            /* ── หน้ากรอกข้อมูล ── */
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>การนอนหลับ</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={THEME.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Display */}
              <View style={styles.displayBox}>
                <Text style={styles.displayTime}>
                  {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
                </Text>
                <Text style={styles.displayLabel}>ชั่วโมง : นาที</Text>
              </View>

              {/* Feedback */}
              <View style={[styles.feedbackBox, { backgroundColor: feedback.color + '18' }]}>
                <View style={[styles.feedbackDot, { backgroundColor: feedback.color }]} />
                <Text style={[styles.feedbackText, { color: feedback.color }]}>
                  {feedback.text}
                </Text>
              </View>

              {/* ชั่วโมง */}
              <Text style={styles.sectionLabel}>ชั่วโมง</Text>
              <View style={styles.stepRow}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setHours(h => Math.max(0, h - 1))}
                >
                  <Ionicons name="remove" size={20} color={THEME.primary} />
                </TouchableOpacity>
                <Text style={styles.stepValue}>{hours} ชม.</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setHours(h => Math.min(24, h + 1))}
                >
                  <Ionicons name="add" size={20} color={THEME.primary} />
                </TouchableOpacity>
              </View>

              {/* นาที */}
              <Text style={styles.sectionLabel}>นาที</Text>
              <View style={styles.stepRow}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setMinutes(m => Math.max(0, m - 15))}
                >
                  <Ionicons name="remove" size={20} color={THEME.primary} />
                </TouchableOpacity>
                <Text style={styles.stepValue}>{minutes} นาที</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setMinutes(m => Math.min(45, m + 15))}
                >
                  <Ionicons name="add" size={20} color={THEME.primary} />
                </TouchableOpacity>
              </View>

              {/* Preset */}
              <Text style={styles.sectionLabel}>เลือกเร็ว</Text>
              <View style={styles.presetRow}>
                {SLEEP_PRESETS.map(h => {
                  const active = hours === h && minutes === 0;
                  return (
                    <TouchableOpacity
                      key={h}
                      style={[styles.presetBtn, active && styles.presetActive]}
                      onPress={() => { setHours(h); setMinutes(0); }}
                    >
                      <Text style={[styles.presetText, active && styles.presetTextActive]}>
                        {h}h
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ปุ่มบันทึก */}
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle" size={20} color="#e8f5e0" />
                <Text style={styles.saveBtnText}>บันทึกการนอนหลับ</Text>
              </TouchableOpacity>
            </>
          )}

        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  centerWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 24 : 20,
    gap: 10,
  },

  /* ── Done ── */
  doneContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  doneTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text,
  },
  doneSub: {
    fontSize: 14,
    fontWeight: '500',
  },
  doneCloseBtn: {
    marginTop: 8,
    paddingVertical: 13,
    paddingHorizontal: 48,
    backgroundColor: THEME.primary,
    borderRadius: 20,
  },
  doneCloseTxt: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e8f5e0',
  },

  /* ── Form ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: THEME.text,
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  displayBox: {
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 20,
    paddingVertical: 16,
  },
  displayTime: {
    fontSize: 50,
    fontWeight: '600',
    color: THEME.primary,
    letterSpacing: 3,
  },
  displayLabel: {
    fontSize: 12,
    color: THEME.textLight,
    marginTop: 4,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  feedbackDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 12,
    color: THEME.textLight,
    marginBottom: -4,
    letterSpacing: 0.3,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.surfaceDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepValue: {
    fontSize: 17,
    fontWeight: '600',
    color: THEME.primary,
    minWidth: 80,
    textAlign: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 6,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    backgroundColor: THEME.surface,
  },
  presetActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '500',
    color: THEME.textMuted,
  },
  presetTextActive: {
    color: '#e8f5e0',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.primary,
    borderRadius: 20,
    paddingVertical: 14,
    marginTop: 2,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e8f5e0',
  },
});