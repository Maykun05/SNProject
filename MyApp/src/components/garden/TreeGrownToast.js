// src/components/garden/TreeGrownToast.js
// แสดง toast animation เมื่อ user ได้ต้นไม้ใหม่

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

/**
 * @param {boolean} visible  - แสดง/ซ่อน
 * @param {number}  count    - จำนวนต้นไม้ปัจจุบัน
 * @param {func}    onHide   - callback หลัง animation จบ
 *
 * @example
 * const [showToast, setShowToast] = useState(false);
 * const [treeCount, setTreeCount] = useState(0);
 *
 * // หลัง logAndCheck():
 * if (result?.treeGrown) {
 *   setTreeCount(result.treeCount);
 *   setShowToast(true);
 * }
 *
 * <TreeGrownToast
 *   visible={showToast}
 *   count={treeCount}
 *   onHide={() => setShowToast(false)}
 * />
 */
export default function TreeGrownToast({ visible, count, onHide }) {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scale,      { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      ]).start(() => {
        // ซ่อนอัตโนมัติหลัง 3 วินาที
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(translateY, { toValue: 80, duration: 300, useNativeDriver: true }),
            Animated.timing(opacity,    { toValue: 0, duration: 300, useNativeDriver: true }),
          ]).start(() => onHide?.());
        }, 3000);
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        { transform: [{ translateY }, { scale }], opacity },
      ]}
    >
      <Text style={styles.treeEmoji}>🌳</Text>
      <View>
        <Text style={styles.title}>ได้ต้นไม้ใหม่!</Text>
        <Text style={styles.subtitle}>สวนของคุณมี {count} ต้นแล้ว</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#1B4332',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
  },
  treeEmoji: { fontSize: 32 },
  title:     { fontSize: 16, fontWeight: '700', color: '#fff' },
  subtitle:  { fontSize: 13, color: '#74C69D', marginTop: 2 },
});