import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const DEFAULT_GOAL = 2000;

/** ฟ้าน้ำชัดขึ้น — ยังนุ่มกว่า #4FC3F7 / #039BE5 ชุดเดิม */
const WATER_GRADIENT = [
  '#3A7CAD',
  '#6CB0DC',
  '#B8E0F5',
];
/** ครบเป้า: ฟ้าอมเขียวน้ำทะเล */
const WATER_GRADIENT_MET = [
  '#2D8AA5',
  '#52B4CC',
  '#9EE5F2',
];

/** วงกลมแต่ละวัน: น้ำเติมจากล่างขึ้นตาม % ของเป้า (ฟีลแก้วน้ำ) */
export default function WaterCircle({ value = 0, goal = DEFAULT_GOAL }) {
  const safeGoal = Number(goal) > 0 ? Number(goal) : DEFAULT_GOAL;
  const v = Number(value);
  const raw = Number.isFinite(v) ? v : 0;
  const percent = Math.min(Math.max(raw / safeGoal, 0), 1);
  const metGoal = raw >= safeGoal;
  const isFull = metGoal || percent >= 1;
  const onWater = percent >= 0.38;

  const amountLabel = Math.round(raw);

  const fillStyle = isFull
    ? [styles.fillShell, styles.fillShellFull]
    : [styles.fillShell, { height: `${percent * 100}%` }];

  return (
    <View style={styles.container}>
      {/* พื้นหลังแก้วว่าง */}
      <View style={styles.glassTint} pointerEvents="none" />

      {percent > 0 && (
        <View style={fillStyle} pointerEvents="none">
          <LinearGradient
            colors={metGoal ? WATER_GRADIENT_MET : WATER_GRADIENT}
            locations={[0, 0.45, 1]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          {/* เส้นขอบด้านบนของน้ำ — ซ่อนเมื่อเต็มวงเพื่อไม่ให้มีแถบขาวคั่นบน */}
          {!isFull && <View style={styles.meniscus} />}
        </View>
      )}

      {raw > 0 && (
        <View style={styles.labelWrap} pointerEvents="none">
          <Text
            style={[styles.amount, onWater && styles.amountOnWater]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.65}
          >
            {amountLabel}
            <Text style={[styles.unit, onWater && styles.unitOnWater]}> ml</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 999,
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(170, 214, 245, 0.45)',
  },
  fillShell: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
  },
  /** ครบเป้า: ไม่ใช้ height % (บน RN มักหลุดไม่เต็ม) — ใช้ top+bottom เต็มกรอบ + มนเท่าวงนอก */
  fillShellFull: {
    top: 0,
    height: undefined,
    borderRadius: 999,
  },
  meniscus: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  labelWrap: {
    zIndex: 2,
    maxWidth: '92%',
    alignItems: 'center',
  },
  amount: {
    fontSize: 9,
    fontWeight: '700',
    color: '#37474F',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  amountOnWater: {
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 2,
  },
  unit: {
    fontSize: 6,
    fontWeight: '600',
    color: '#546E7A',
  },
  unitOnWater: {
    color: 'rgba(255, 255, 255, 0.92)',
  },
});
