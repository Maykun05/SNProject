import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Alert, ScrollView, Image, Modal, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../context/ProfileContext';
import { useLevel } from '../context/LevelContext';

const GREEN = '#1E4D2B';

const ProfileScreen = ({ navigation }) => {
  const { profile, updateProfile, logout } = useProfile();
  const { level, xp, xpRequired, xpPercent, levelInfo } = useLevel();

  // ── Modal states ──
  const [showNameModal,   setShowNameModal]   = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [inputName,       setInputName]       = useState(profile.name || '');

  // ── Health inputs ──
  const [inputWeight, setInputWeight] = useState(String(profile.weight   ?? ''));
  const [inputHeight, setInputHeight] = useState(String(profile.height   ?? ''));
  const [inputAge,    setInputAge]    = useState(String(profile.age      ?? ''));

  // คำนวณ BMI
  const calculateBMI = () => {
    if (!profile.weight || !profile.height) return '-';
    const weight = parseFloat(profile.weight);
    const height = parseFloat(profile.height);
    if (isNaN(weight) || isNaN(height) || height <= 0) return '-';
    const bmiValue = weight / Math.pow(height / 100, 2);
    return isNaN(bmiValue) ? '-' : bmiValue.toFixed(1);
  };
  const bmi = calculateBMI();

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission denied', 'กรุณาอนุญาตให้เข้าถึงรูปภาพ');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) {
      updateProfile({ profileImage: result.assets[0].uri });
    }
  };

  const handleSaveName = () => {
    const trimmed = inputName.trim();
    if (!trimmed || trimmed.length < 2) {
      Alert.alert('ชื่อไม่ถูกต้อง', 'กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร');
      return;
    }
    updateProfile({ name: trimmed });
    setShowNameModal(false);
  };

  const handleSaveHealth = () => {
    const w = parseFloat(inputWeight);
    const h = parseFloat(inputHeight);
    const a = parseInt(inputAge);
    if (isNaN(w) || w < 20 || w > 300) {
      Alert.alert('น้ำหนักไม่ถูกต้อง', 'กรุณากรอกน้ำหนัก 20-300 กก.');
      return;
    }
    if (isNaN(h) || h < 50 || h > 250) {
      Alert.alert('ส่วนสูงไม่ถูกต้อง', 'กรุณากรอกส่วนสูง 50-250 ซม.');
      return;
    }
    if (isNaN(a) || a < 1 || a > 120) {
      Alert.alert('อายุไม่ถูกต้อง', 'กรุณากรอกอายุ 1-120 ปี');
      return;
    }
    updateProfile({ weight: w, height: h, age: a });
    setShowHealthModal(false);
  };

  const handleLogout = () => {
    Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ตกลง', onPress: () => logout(navigation), style: 'destructive' },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'ลบบัญชี',
      'การลบบัญชีจะลบข้อมูลทั้งหมดของคุณและไม่สามารถกู้คืนได้ ต้องการดำเนินการต่อหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบบัญชี',
          style: 'destructive',
          onPress: () => logout(navigation),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
            {profile.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera" size={40} color="#555" />
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Ionicons name="add" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>เปลี่ยนรูป</Text>
        </View>

        {/* ── Level Badge ── */}
        <View style={styles.levelBadge}>
          <View style={[styles.levelCircle, { borderColor: levelInfo?.color ?? GREEN }]}>
            <Text style={styles.levelNum}>{String(level)}</Text>
            <Text style={styles.levelLv}>LV</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={[styles.levelName, { color: levelInfo?.color ?? GREEN }]}>
              {levelInfo?.displayName ?? 'นักสำรวจมือใหม่'}
            </Text>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, {
                width: `${xpPercent}%`,
                backgroundColor: levelInfo?.color ?? GREEN,
              }]} />
            </View>
            <Text style={styles.xpText}>{String(xp)} / {String(xpRequired)} XP</Text>
          </View>
        </View>

        {/* ── Name Card ── */}
        <View style={styles.nameCard}>
          <View style={styles.coinBadge}>
            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.coinText}>{String(profile.coins ?? 0)}</Text>
          </View>
          <Text style={styles.userNameText}>{profile.name || 'ชื่อผู้ใช้'}</Text>
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => { setInputName(profile.name || ''); setShowNameModal(true); }}
          >
            <Ionicons name="pencil" size={16} color="#999" />
          </TouchableOpacity>
        </View>

        {/* ── ข้อมูลสุขภาพ ── */}
        <Text style={styles.sectionLabel}>ข้อมูลสุขภาพ</Text>
        <TouchableOpacity
          style={styles.healthRow}
          onPress={() => {
            setInputWeight(String(profile.weight ?? ''));
            setInputHeight(String(profile.height ?? ''));
            setInputAge(String(profile.age ?? ''));
            setShowHealthModal(true);
          }}
        >
          {[
            { label: 'น้ำหนัก', value: profile.weight ? `${String(profile.weight)} kg` : '-', icon: 'scale-bathroom' },
            { label: 'ส่วนสูง', value: profile.height ? `${String(profile.height)} cm` : '-', icon: 'human-male-height' },
            { label: 'BMI',     value: bmi,                                                     icon: 'heart-pulse'      },
            { label: 'อายุ',    value: profile.age    ? `${String(profile.age)} ปี`    : '-', icon: 'calendar-account' },
          ].map((item, index) => (
            <View key={index} style={styles.healthCard}>
              <MaterialCommunityIcons name={item.icon} size={18} color={GREEN} />
              <Text style={styles.healthLabel}>{item.label}</Text>
              <Text style={styles.healthValue}>{item.value}</Text>
            </View>
          ))}
        </TouchableOpacity>

        {/* ── ข้อมูลและเป้าหมาย ── */}
        <Text style={styles.sectionLabel}>ข้อมูลและเป้าหมาย</Text>
        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={styles.cardHalf}
            onPress={() => navigation.navigate('EditPersonalInfo')}
          >
            <View style={styles.cardHeaderIndicator} />
            <Text style={styles.cardTitle}>ข้อมูลส่วนตัว</Text>
            <Text style={styles.label}>อีเมล</Text>
            <Text style={styles.value} numberOfLines={1}>{profile.email || '-'}</Text>
            <View style={styles.divider} />
            <Text style={styles.label}>เบอร์โทร</Text>
            <Text style={styles.value}>{profile.phone || '-'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cardHalf}
            onPress={() => navigation.navigate('EditGoals')}
          >
            <View style={[styles.cardHeaderIndicator, { backgroundColor: '#E9DCC9' }]} />
            <Text style={styles.cardTitle}>เป้าหมาย</Text>
            <Text style={styles.label}>ก้าวเดินรายวัน</Text>
            <Text style={styles.value}>{(profile.goals?.dailyStep ?? 5000).toLocaleString()} ก้าว</Text>
            <View style={styles.divider} />
            <Text style={styles.label}>น้ำหนักเป้าหมาย</Text>
            <Text style={styles.value}>{profile.goals?.weightGoal ? `${String(profile.goals.weightGoal)} kg` : '-'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── ตั้งค่าแอป ── */}
        <Text style={styles.sectionLabel}>ตั้งค่าแอป</Text>
        <View style={styles.cardFull}>
          <View style={styles.cardHeaderIndicator} />
          <View style={styles.settingOptions}>
            {[
              { label: 'การแจ้งเตือน', icon: 'notifications-outline', screen: 'Notifications' },
              { label: 'ธีม',           icon: 'contrast-outline',       screen: 'Theme'         },
              { label: 'ภาษา',          icon: 'language-outline',       screen: 'Language'      },
              { label: 'หน่วยวัด',      icon: 'options-outline',        screen: 'Units'         },
            ].map((item, index, arr) => (
              <React.Fragment key={item.label}>
                <TouchableOpacity
                  style={styles.settingOption}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <Ionicons name={item.icon} size={20} color={GREEN} />
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
                {index < arr.length - 1 && <View style={styles.verticalDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ── ข้อมูลและความปลอดภัย ── */}
        <Text style={styles.sectionLabel}>ข้อมูลและความปลอดภัย</Text>
        <TouchableOpacity
          style={styles.cardFull}
          onPress={() => navigation.navigate('PrivacyPolicy')}
        >
          <View style={styles.cardHeaderIndicator} />
          <View style={styles.privacyRow}>
            <Text style={[styles.cardTitle, { marginBottom: 0 }]}>นโยบายความเป็นส่วนตัว</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cardFull, { marginTop: 8 }]}
          onPress={handleDeleteAccount}
        >
          <View style={[styles.cardHeaderIndicator, { backgroundColor: '#FF6347' }]} />
          <View style={styles.privacyRow}>
            <Text style={[styles.cardTitle, { marginBottom: 0, color: '#FF6347' }]}>ลบบัญชี</Text>
            <Ionicons name="chevron-forward" size={18} color="#FF6347" />
          </View>
        </TouchableOpacity>

        {/* ── ปุ่ม Logout ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FFF" />
          <Text style={styles.logoutBtnText}>ออกจากระบบ</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Modal แก้ชื่อ ── */}
      <Modal visible={showNameModal} transparent animationType="fade"
        onRequestClose={() => setShowNameModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Ionicons name="person-outline" size={22} color={GREEN} />
              <Text style={styles.modalTitle}>แก้ไขชื่อ</Text>
            </View>
            <Text style={styles.modalSubtitle}>ชื่อปัจจุบัน: {profile.name || '-'}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={inputName}
                onChangeText={setInputName}
                placeholder="กรอกชื่อใหม่"
                placeholderTextColor="#bbb"
                maxLength={50}
                autoFocus
              />
            </View>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowNameModal(false)}>
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveName}>
                <Text style={styles.confirmBtnText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Modal ข้อมูลสุขภาพ ── */}
      <Modal visible={showHealthModal} transparent animationType="fade"
        onRequestClose={() => setShowHealthModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="heart-pulse" size={22} color={GREEN} />
              <Text style={styles.modalTitle}>ข้อมูลสุขภาพ</Text>
            </View>

            {[
              { label: 'น้ำหนัก (กก.)', value: inputWeight, setter: setInputWeight, placeholder: 'เช่น 65' },
              { label: 'ส่วนสูง (ซม.)', value: inputHeight, setter: setInputHeight, placeholder: 'เช่น 172' },
              { label: 'อายุ (ปี)',      value: inputAge,    setter: setInputAge,    placeholder: 'เช่น 25'  },
            ].map((field) => (
              <View key={field.label}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor="#bbb"
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>
            ))}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowHealthModal(false)}>
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveHealth}>
                <Text style={styles.confirmBtnText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { paddingBottom: 100 },

  /* ── Avatar ── */
  avatarSection: { alignItems: 'center', marginTop: 30 },
  avatarContainer: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 3, borderColor: GREEN,
    overflow: 'hidden', backgroundColor: '#E9DCC9',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cameraOverlay: {
    position: 'absolute', bottom: 4, right: 4,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: GREEN,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#F8F9FA',
  },
  changePhotoText: { fontSize: 12, color: GREEN, fontWeight: '600', marginTop: 6 },

  /* ── Level Badge ── */
  levelBadge: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginTop: 14,
    backgroundColor: '#fff', borderRadius: 16,
    padding: 10, gap: 12,
    elevation: 2, shadowColor: '#000',
    shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
  },
  levelCircle: {
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 2.5, justifyContent: 'center',
    alignItems: 'center', backgroundColor: '#fff',
  },
  levelNum: { fontSize: 16, fontWeight: '700', color: GREEN, lineHeight: 18 },
  levelLv: { fontSize: 8, color: '#999', letterSpacing: 0.5 },
  levelInfo: { flex: 1 },
  levelName: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  xpBarBg: { height: 6, backgroundColor: '#E8F5E9', borderRadius: 3, overflow: 'hidden' },
  xpBarFill: { height: 6, borderRadius: 3 },
  xpText: { fontSize: 10, color: '#999', marginTop: 3 },

  /* ── Name Card ── */
  nameCard: {
    backgroundColor: '#FFF4E6',
    marginHorizontal: 20, marginTop: 12,
    paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 20, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  userNameText: { fontSize: 18, fontWeight: '700', marginRight: 8, color: '#1a1a1a' },
  editIcon: { padding: 4 },
  coinBadge: {
    position: 'absolute', top: -10, right: 12,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 3, gap: 4,
  },
  coinText: { fontWeight: '700', fontSize: 15, color: '#C8861A' },

  /* ── Section Label ── */
  sectionLabel: {
    fontSize: 11, fontWeight: '600',
    color: '#999', paddingHorizontal: 20,
    marginTop: 20, marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  /* ── Health Row ── */
  healthRow: {
    flexDirection: 'row', marginHorizontal: 20, gap: 8,
  },
  healthCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14,
    padding: 10, alignItems: 'center', gap: 4,
    elevation: 2, shadowColor: '#000',
    shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 3,
  },
  healthLabel: { fontSize: 9, color: '#999', textAlign: 'center' },
  healthValue: { fontSize: 12, fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },

  /* ── Grid Cards ── */
  gridContainer: {
    flexDirection: 'row', paddingHorizontal: 20, gap: 10,
  },
  cardHalf: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 14,
    padding: 14, elevation: 2, shadowColor: '#000',
    shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4, overflow: 'hidden',
  },
  cardFull: {
    backgroundColor: '#FFF', marginHorizontal: 20,
    borderRadius: 14, padding: 16,
    elevation: 2, shadowColor: '#000',
    shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4, overflow: 'hidden',
  },
  cardHeaderIndicator: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 5, backgroundColor: GREEN,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: GREEN, marginBottom: 10 },
  label: { fontSize: 10, color: '#999' },
  value: { fontSize: 12, fontWeight: '500', marginTop: 2, marginBottom: 4, color: '#333' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 6 },

  /* ── Settings ── */
  settingOptions: { flexDirection: 'row', alignItems: 'center' },
  settingOption: { flex: 1, alignItems: 'center', paddingVertical: 6, gap: 4 },
  optionText: { fontSize: 10, color: '#555', textAlign: 'center' },
  verticalDivider: { width: 1, height: 28, backgroundColor: '#E0E0E0' },

  /* ── Privacy Row ── */
  privacyRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },

  /* ── Logout ── */
  logoutBtn: {
    backgroundColor: '#FF6347', marginHorizontal: 20,
    marginTop: 20, paddingVertical: 14, borderRadius: 30,
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 8, elevation: 4,
    shadowColor: '#FF6347', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 6,
  },
  logoutBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  /* ── Modal ── */
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: {
    width: '88%', backgroundColor: '#FFF',
    borderRadius: 24, padding: 24, gap: 12,
    elevation: 8,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: GREEN },
  modalSubtitle: { fontSize: 12, color: '#888' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 4 },
  inputWrapper: {
    backgroundColor: '#F5F5F5', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E0E0E0', paddingHorizontal: 14,
  },
  input: { fontSize: 16, fontWeight: '600', color: '#222', paddingVertical: 12 },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 30,
    borderWidth: 1.5, borderColor: '#E0E0E0', alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, color: '#999', fontWeight: '600' },
  confirmBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 30,
    backgroundColor: GREEN, alignItems: 'center',
    elevation: 3, shadowColor: GREEN,
    shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 }, shadowRadius: 5,
  },
  confirmBtnText: { fontSize: 14, color: '#FFF', fontWeight: '700' },
});

export default ProfileScreen;