import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../context/ProfileContext';

const GREEN = '#1E4D2B';

const LANGUAGES = [
  { key: 'th', label: 'ภาษาไทย',   flag: '🇹🇭', native: 'Thai'    },
  { key: 'en', label: 'อังกฤษ',    flag: '🇬🇧', native: 'English' },
  { key: 'zh', label: 'จีน',       flag: '🇨🇳', native: '中文'    },
  { key: 'ja', label: 'ญี่ปุ่น',   flag: '🇯🇵', native: '日本語'  },
  { key: 'ko', label: 'เกาหลี',    flag: '🇰🇷', native: '한국어'  },
];

export default function LanguageScreen({ navigation }) {
  const { profile, updateSettings } = useProfile();
  const [selected, setSelected] = useState(profile.settings?.language ?? 'th');

  const handleSave = () => {
    updateSettings({ language: selected });
    Alert.alert('บันทึกสำเร็จ', 'ภาษาถูกเปลี่ยนแปลงแล้ว', [
      { text: 'ตกลง', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ภาษา</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.sectionLabel}>เลือกภาษาที่ต้องการใช้งาน</Text>

        {/* ── Language List ── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderIndicator} />
          {LANGUAGES.map((lang, index) => {
            const isActive = selected === lang.key;
            return (
              <React.Fragment key={lang.key}>
                <TouchableOpacity
                  style={styles.langRow}
                  onPress={() => setSelected(lang.key)}
                >
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <View style={styles.langInfo}>
                    <Text style={[styles.langLabel, isActive && styles.langLabelActive]}>
                      {lang.label}
                    </Text>
                    <Text style={styles.langNative}>{lang.native}</Text>
                  </View>
                  <View style={[styles.checkCircle, isActive && styles.checkCircleActive]}>
                    {isActive && <Ionicons name="checkmark" size={16} color="#FFF" />}
                  </View>
                </TouchableOpacity>
                {index < LANGUAGES.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            );
          })}
        </View>

        {/* ── Save ── */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#FFF" />
          <Text style={styles.saveBtnText}>บันทึกภาษา</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>ยกเลิก</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: GREEN },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 4 },
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, overflow: 'hidden',
  },
  cardHeaderIndicator: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, backgroundColor: GREEN,
  },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  flag: { fontSize: 28 },
  langInfo: { flex: 1 },
  langLabel: { fontSize: 15, fontWeight: '600', color: '#444' },
  langLabelActive: { color: GREEN },
  langNative: { fontSize: 12, color: '#999', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F0F0F0' },
  checkCircle: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: '#E0E0E0',
    justifyContent: 'center', alignItems: 'center',
  },
  checkCircleActive: { backgroundColor: GREEN, borderColor: GREEN },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: GREEN, paddingVertical: 15, borderRadius: 30,
    marginTop: 10, gap: 8, elevation: 4,
    shadowColor: GREEN, shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 6,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelBtnText: { fontSize: 15, color: '#999' },
});