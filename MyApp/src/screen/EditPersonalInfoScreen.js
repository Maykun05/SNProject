import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
 TextInput, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../context/ProfileContext';
import { SafeAreaView } from 'react-native-safe-area-context';


const GREEN = '#1E4D2B';

export default function EditPersonalInfoScreen({ navigation }) {
  const { profile, updateProfile } = useProfile();

  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const validatePhone = (val) => /^[0-9\-]{9,12}$/.test(val.replace(/-/g, ''));

  const handleSave = () => {
    if (!validateEmail(email)) {
      Alert.alert('อีเมลไม่ถูกต้อง', 'กรุณากรอกอีเมลให้ถูกรูปแบบ เช่น example@email.com');
      return;
    }
    if (!validatePhone(phone)) {
      Alert.alert('เบอร์โทรไม่ถูกต้อง', 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง เช่น 08X-XXX-XXXX');
      return;
    }

    // ✅ ใช้ updateProfile() ตรงจาก ProfileContext
    updateProfile({ email, phone });
    Alert.alert('บันทึกสำเร็จ', 'ข้อมูลส่วนตัวถูกอัปเดตแล้ว', [
      { text: 'ตกลง', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ข้อมูลส่วนตัว</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* ── อีเมล ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>อีเมล</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              placeholderTextColor="#bbb"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* ── เบอร์โทรศัพท์ ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>เบอร์โทรศัพท์</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="08X-XXX-XXXX"
              placeholderTextColor="#bbb"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* ── ปุ่มบันทึก ── */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#FFF" />
          <Text style={styles.saveBtnText}>บันทึกข้อมูล</Text>
        </TouchableOpacity>

        {/* ── ปุ่มยกเลิก ── */}
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>ยกเลิก</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: GREEN,
  },

  /* ── Content ── */
  content: {
    padding: 20,
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    paddingVertical: 14,
  },

  /* ── Buttons ── */
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 10,
    gap: 8,
    elevation: 4,
    shadowColor: GREEN,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelBtnText: {
    fontSize: 15,
    color: '#999',
  },
});