import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../context/ProfileContext';

const GREEN = '#1E4D2B';

const THEMES = [
  { key: 'light',  label: 'โหมดสว่าง',  icon: 'sunny-outline',      bg: '#FFFDE7', accent: '#F9A825' },
  { key: 'dark',   label: 'โหมดมืด',    icon: 'moon-outline',       bg: '#263238', accent: '#90CAF9' },
  { key: 'nature', label: 'ธรรมชาติ',   icon: 'leaf-outline',       bg: '#E8F5E9', accent: '#2D5016' },
  { key: 'ocean',  label: 'มหาสมุทร',   icon: 'water-outline',      bg: '#E3F2FD', accent: '#1565C0' },
];

export default function ThemeScreen({ navigation }) {
  const { profile, updateSettings } = useProfile();
  const [selected, setSelected] = useState(profile.settings?.theme ?? 'light');

  const handleSave = () => {
    updateSettings({ theme: selected });
    Alert.alert('บันทึกสำเร็จ', 'ธีมถูกเปลี่ยนแปลงแล้ว', [
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
        <Text style={styles.headerTitle}>ธีม</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.sectionLabel}>เลือกธีมที่ต้องการ</Text>

        {/* ── Theme Cards ── */}
        {THEMES.map((theme) => {
          const isActive = selected === theme.key;
          return (
            <TouchableOpacity
              key={theme.key}
              style={[styles.themeCard, isActive && styles.themeCardActive]}
              onPress={() => setSelected(theme.key)}
            >
              {/* Preview */}
              <View style={[styles.themePreview, { backgroundColor: theme.bg }]}>
                <Ionicons name={theme.icon} size={28} color={theme.accent} />
              </View>

              <Text style={[styles.themeLabel, isActive && styles.themeLabelActive]}>
                {theme.label}
              </Text>

              {/* Checkmark */}
              <View style={[styles.checkCircle, isActive && styles.checkCircleActive]}>
                {isActive && <Ionicons name="checkmark" size={16} color="#FFF" />}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* ── Save ── */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#FFF" />
          <Text style={styles.saveBtnText}>บันทึกธีม</Text>
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
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 4 },
  themeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFF', borderRadius: 16, padding: 14,
    borderWidth: 2, borderColor: '#E0E0E0',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
  },
  themeCardActive: { borderColor: GREEN },
  themePreview: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  themeLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#444' },
  themeLabelActive: { color: GREEN },
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