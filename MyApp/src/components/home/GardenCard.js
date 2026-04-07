// src/components/home/GardenCard.js
// การ์ดสวนที่แสดงบน Home screen — กดแล้วไปหน้า GardenScreen

import React, { useEffect } from 'react';
import {
  TouchableOpacity, View, Text, StyleSheet,
  ImageBackground, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGarden } from '../../context/GardenContext';

const { width } = Dimensions.get('window');

export default function GardenCard() {
  const navigation               = useNavigation();
  const { gardenData, todayProgress, fetchGardenMonth, fetchTodayProgress } = useGarden();

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;

  useEffect(() => {
    fetchGardenMonth(year, month);
    fetchTodayProgress();
  }, []);

  const treeCount      = gardenData?.treeCount ?? 0;
  const completedCount = todayProgress?.completedCount ?? 0;
  const totalCount     = todayProgress?.totalCount ?? 5;
  const treeEarned     = todayProgress?.treeEarnedToday ?? false;

  const MONTH_TH = [
    '', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ];

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('GardenScreen')}
    >
      {/* Background image ของสวน */}
      <ImageBackground
        source={require('../../assets/garden-bg.png')} // ใส่รูปจากภาพที่มี
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        {/* ป้ายชื่อสวน */}
        <View style={styles.signBoard}>
          <Text style={styles.signText}>สวนของฉัน</Text>
        </View>

        {/* จำนวนต้นไม้ */}
        <View style={styles.treeCountBadge}>
          <Text style={styles.treeEmoji}>🌳</Text>
          <Text style={styles.treeCount}>{treeCount}</Text>
          <Text style={styles.treeLabel}>ต้น</Text>
        </View>

        {/* ปุ่มดูสวน */}
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate('GardenScreen')}
        >
          <Text style={styles.viewButtonText}>
            ดูสวน {MONTH_TH[month]} →
          </Text>
        </TouchableOpacity>
      </ImageBackground>

      {/* Progress bar วันนี้ */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            วันนี้: {completedCount}/{totalCount} กิจกรรม
          </Text>
          {treeEarned && (
            <View style={styles.treeEarnedBadge}>
              <Text style={styles.treeEarnedText}>🌱 +1 ต้น!</Text>
            </View>
          )}
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(completedCount / totalCount) * 100}%` },
              treeEarned && styles.progressBarComplete,
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  bg: {
    width: '100%',
    height: 180,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
  },
  bgImage: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    resizeMode: 'cover',
  },
  signBoard: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#8B5E3C',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6B4423',
  },
  signText: {
    color: '#FFF8E7',
    fontSize: 14,
    fontWeight: '700',
  },
  treeCountBadge: {
    position: 'absolute',
    top: 12,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  treeEmoji: { fontSize: 14 },
  treeCount: { fontSize: 16, fontWeight: '700', color: '#2d6a4f' },
  treeLabel: { fontSize: 12, color: '#52796f' },
  viewButton: {
    backgroundColor: '#F5A623',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  progressSection: {
    padding: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  treeEarnedBadge: {
    backgroundColor: '#d8f3dc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  treeEarnedText: {
    fontSize: 12,
    color: '#2d6a4f',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#74C69D',
    borderRadius: 4,
  },
  progressBarComplete: {
    backgroundColor: '#40916C',
  },
});