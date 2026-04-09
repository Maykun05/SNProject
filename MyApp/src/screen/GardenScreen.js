// src/screens/GardenScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated, FlatList,
} from 'react-native';
import { useGarden } from '../context/GardenContext';
import { SafeAreaView } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');

// Tree components ตาม index (หลากหลายแบบ)
const TREE_TYPES = ['🌱', '🌿', '🌲', '🌳', '🎋', '🌴', '🎄', '🍀'];
const getTreeType = (index) => TREE_TYPES[index % TREE_TYPES.length];

const MONTH_TH = [
  '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

// ─── Tree Item Component ───────────────────────
const TreeItem = ({ index, earnedDay }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 60,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const day = earnedDay
    ? new Date(earnedDay.date).getDate()
    : null;

  return (
    <Animated.View style={[styles.treeItem, { transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.treeEmoji}>{getTreeType(index)}</Text>
      {day && <Text style={styles.treeDay}>{day}</Text>}
    </Animated.View>
  );
};

// ─── Ground Row ────────────────────────────────
const TREES_PER_ROW = 5;

const GardenGrid = ({ treeCount, earnedDays }) => {
  const rows = [];
  for (let i = 0; i < treeCount; i += TREES_PER_ROW) {
    rows.push(earnedDays.slice(i, i + TREES_PER_ROW));
  }

  if (treeCount === 0) {
    return (
      <View style={styles.emptyGarden}>
        <Text style={styles.emptyEmoji}>🌱</Text>
        <Text style={styles.emptyText}>เริ่มใช้แอพเพื่อปลูกต้นแรก!</Text>
        <Text style={styles.emptySubText}>ใช้ครบทุก feature วันนี้ → ได้ต้นไม้ 1 ต้น</Text>
      </View>
    );
  }

  return (
    <View style={styles.gardenGrid}>
      {/* พื้นหญ้า */}
      <View style={styles.grassRow}>
        <Text style={styles.grassText}>🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾</Text>
      </View>

      {rows.map((rowTrees, rowIdx) => (
        <View key={rowIdx} style={styles.treeRow}>
          {rowTrees.map((earnedDay, colIdx) => (
            <TreeItem
              key={`${rowIdx}-${colIdx}`}
              index={rowIdx * TREES_PER_ROW + colIdx}
              earnedDay={earnedDay}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

// ─── Main Screen ───────────────────────────────
export default function GardenScreen() {
  const { gardenData, loading, fetchGardenMonth } = useGarden();

  const now       = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    fetchGardenMonth(year, month);
  }, [year, month]);

  const goToPrevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };

  const goToNextMonth = () => {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    if (isCurrentMonth) return; // ไม่ไปอนาคต
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const treeCount  = gardenData?.treeCount ?? 0;
  const earnedDays = gardenData?.earnedDays ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>สวนของฉัน 🌿</Text>
          <Text style={styles.headerSubtitle}>1 วันครบกิจกรรม = 1 ต้นไม้</Text>
        </View>

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity style={styles.monthArrow} onPress={goToPrevMonth}>
            <Text style={styles.monthArrowText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.monthLabel}>
            <Text style={styles.monthText}>{MONTH_TH[month]}</Text>
            <Text style={styles.yearText}>{year}</Text>
          </View>

          <TouchableOpacity
            style={[styles.monthArrow, isCurrentMonth && styles.monthArrowDisabled]}
            onPress={goToNextMonth}
            disabled={isCurrentMonth}
          >
            <Text style={[styles.monthArrowText, isCurrentMonth && { color: '#ccc' }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Tree count summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{treeCount}</Text>
            <Text style={styles.summaryLabel}>ต้นไม้เดือนนี้</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{earnedDays.length}</Text>
            <Text style={styles.summaryLabel}>วันที่ครบกิจกรรม</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>
              {gardenData?.selectedFeatures?.length ?? 5}
            </Text>
            <Text style={styles.summaryLabel}>กิจกรรมเป้าหมาย</Text>
          </View>
        </View>

        {/* Garden */}
        <View style={styles.gardenContainer}>
          <GardenGrid treeCount={treeCount} earnedDays={earnedDays} />
        </View>

        {/* Earned Days List */}
        {earnedDays.length > 0 && (
          <View style={styles.daysSection}>
            <Text style={styles.daysSectionTitle}>วันที่ได้ต้นไม้</Text>
            <View style={styles.daysGrid}>
              {earnedDays.map((d, i) => {
                const date = new Date(d.date);
                return (
                  <View key={i} style={styles.dayChip}>
                    <Text style={styles.dayChipEmoji}>{getTreeType(i)}</Text>
                    <Text style={styles.dayChipDate}>{date.getDate()}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FAF4' },

  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#1B4332' },
  headerSubtitle: { fontSize: 13, color: '#52796F', marginTop: 2 },

  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  monthArrow: { padding: 8 },
  monthArrowDisabled: { opacity: 0.3 },
  monthArrowText: { fontSize: 28, color: '#2D6A4F', fontWeight: '300' },
  monthLabel: { alignItems: 'center' },
  monthText: { fontSize: 18, fontWeight: '700', color: '#1B4332' },
  yearText:  { fontSize: 13, color: '#74C69D', marginTop: 2 },

  summaryBox: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: 28, fontWeight: '800', color: '#2D6A4F' },
  summaryLabel: { fontSize: 11, color: '#888', marginTop: 2, textAlign: 'center' },
  summaryDivider: { width: 1, backgroundColor: '#eee' },

  gardenContainer: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 200,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  gardenGrid: { alignItems: 'center' },
  grassRow: { marginBottom: 8 },
  grassText: { fontSize: 14, letterSpacing: -2 },
  treeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
    gap: 8,
  },
  treeItem: { alignItems: 'center', width: 52 },
  treeEmoji: { fontSize: 32 },
  treeDay: { fontSize: 10, color: '#888', marginTop: -2 },

  emptyGarden: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#2D6A4F' },
  emptySubText: { fontSize: 12, color: '#888', marginTop: 6, textAlign: 'center' },

  daysSection: { marginHorizontal: 16, marginTop: 16 },
  daysSectionTitle: { fontSize: 15, fontWeight: '700', color: '#1B4332', marginBottom: 10 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D8F3DC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  dayChipEmoji: { fontSize: 14 },
  dayChipDate: { fontSize: 13, fontWeight: '600', color: '#2D6A4F' },
});