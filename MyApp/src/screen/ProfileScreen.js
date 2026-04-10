import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ScrollView, Image, Modal, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../context/ProfileContext';
import { useLevel } from '../context/LevelContext';
import CoinBadge from '../components/CoinBadge.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthProvider.js';
import ProfileHealthRow from '../components/profile/ProfileHealthRow';
import ProfileAccountCard from '../components/profile/ProfileAccountCard';
import BirthDatePickerCard from '../components/BirthDatePickerCard';
import { fetchUserInfo, updateProfileInfo, updateUserInfo } from '../services/profileService';
import {
  calculateAge,
  calculateBMI,
  formatBirthDateThai,
  getProfileAge,
  parseBirthDate,
} from '../utils/profileHealth';

const GREEN = '#1E4D2B';


const ProfileScreen = ({ navigation }) => {
  const { profile, updateProfile} = useProfile();
  const { level, xp, xpRequired, xpPercent, levelInfo } = useLevel();
  const [username, setUsername] = useState('');
  const [email, setEmailState] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const {userToken} = useContext(AuthContext);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userToken) return; // ถ้าไม่มี token ไม่ต้องยิง API

      const data = await fetchUserInfo(userToken);
      setUsername(data.username);
      setEmailState(data.email ?? '');
    };

    fetchProfile();
  }, [userToken]);

  useEffect(() => {
    setInputEmail(email || profile.email || '');
  }, [email, profile.email]);

  // ── Modal states ──
  const [showNameModal,   setShowNameModal]   = useState(false);
  const [inputName,       setInputName]       = useState(profile.name || '');
  const [showHealthFieldModal, setShowHealthFieldModal] = useState(false);
  const [healthFieldType, setHealthFieldType] = useState(null);
  const [healthFieldValue, setHealthFieldValue] = useState('');
  const [selectedBirthDate, setSelectedBirthDate] = useState(new Date());
  const [showBirthPicker, setShowBirthPicker] = useState(false);

  const bmi = calculateBMI(profile.weight, profile.height);

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

  const handleSaveName = async () => {
    const trimmed = inputName.trim();
    if (!trimmed || trimmed.length < 2) {
      Alert.alert('ชื่อไม่ถูกต้อง', 'กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร');
      return;
    }

    updateProfile({ name: trimmed });
    setShowNameModal(false);

    try {
      await updateUserInfo(userToken, { username: trimmed });
    } catch (err) {
      Alert.alert('เกิดข้อผิดพลาด', 'เชื่อมต่อ server ไม่สำเร็จ');
    }
  };

  const handleSaveEmail = async () => {
    const trimmed = inputEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
      Alert.alert('อีเมลไม่ถูกต้อง', 'กรุณากรอกรูปแบบอีเมลให้ถูกต้อง');
      return;
    }

    const token = userToken || await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('ไม่พบการเข้าสู่ระบบ', 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
      return;
    }

    try {
      await updateUserInfo(token, { email: trimmed });
      setEmailState(trimmed);
      updateProfile({ email: trimmed });
      setShowEmailModal(false);
    } catch (err) {
      Alert.alert('เกิดข้อผิดพลาด', 'เชื่อมต่อ server ไม่สำเร็จ');
    }
  };

  const saveProfilePatch = async (patch) => {
    const token = userToken || await AsyncStorage.getItem('token');
    await updateProfileInfo(token, patch);
  };

  const openHealthFieldEditor = (type) => {
    setHealthFieldType(type);
    setShowBirthPicker(false);
    if (type === 'weight') {
      setHealthFieldValue(String(profile.weight ?? ''));
    } else if (type === 'height') {
      setHealthFieldValue(String(profile.height ?? ''));
    } else if (type === 'age') {
      const parsedDate = parseBirthDate(profile.birthDate) ?? new Date(2000, 0, 1);
      setSelectedBirthDate(parsedDate);
      setShowBirthPicker(true);
    }
    setShowHealthFieldModal(true);
  };

  const handleSaveHealthField = async () => {
    if (!userToken) {
      Alert.alert('ไม่พบการเข้าสู่ระบบ', 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
      return;
    }

    try {
    if (healthFieldType === 'weight') {
      const w = parseFloat(healthFieldValue);
      if (Number.isNaN(w) || w < 20 || w > 300) {
        Alert.alert('น้ำหนักไม่ถูกต้อง', 'กรุณากรอกน้ำหนัก 20-300 กก.');
        return;
      }
      await saveProfilePatch({ weight: w });
      updateProfile({ weight: w });
      setShowHealthFieldModal(false);
      return;
    }

    if (healthFieldType === 'height') {
      const h = parseFloat(healthFieldValue);
      if (Number.isNaN(h) || h < 50 || h > 250) {
        Alert.alert('ส่วนสูงไม่ถูกต้อง', 'กรุณากรอกส่วนสูง 50-250 ซม.');
        return;
      }
      await saveProfilePatch({ height: h });
      updateProfile({ height: h });
      setShowHealthFieldModal(false);
      return;
    }

    if (healthFieldType === 'age') {
      const age = calculateAge(selectedBirthDate);
      if (Number.isNaN(age) || age < 1 || age > 120) {
        Alert.alert('วันเกิดไม่ถูกต้อง', 'กรุณาเลือกวันเกิดใหม่');
        return;
      }
      const isoBirthDate = selectedBirthDate.toISOString();
      await saveProfilePatch({ birthDate: isoBirthDate });
      updateProfile({ birthDate: isoBirthDate, age });
      setShowHealthFieldModal(false);
    }
    } catch (err) {
      Alert.alert('บันทึกไม่สำเร็จ', 'ไม่สามารถบันทึกข้อมูลลงเซิร์ฟเวอร์ได้');
    }
  };

const handleChangePassword = async () => {
  if (!oldPassword || !newPassword || !confirmPassword) {
    Alert.alert('กรุณากรอกข้อมูลให้ครบ');
    return;
  }
  if (newPassword !== confirmPassword) {
    Alert.alert('รหัสผ่านใหม่ไม่ตรงกัน');
    return;
  }
  if (newPassword.length < 6) {
    Alert.alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    return;
  }
  try {
    const token = await AsyncStorage.getItem('token');
    await updateUserInfo(token, { oldPassword, newPassword });
    Alert.alert('สำเร็จ', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(false);
  } catch (err) {
    Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อ server ได้');
  }
};


  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();   // เทสล้อกเอ้า
    navigation.replace("Login");
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

        {/* ── Name Card ── */}
        <View style={styles.nameCard}>
          <CoinBadge amount={profile.coins} />
          <Text style={styles.userNameText}>{username || profile.name || 'ชื่อผู้ใช้'}</Text>
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => { setInputName(profile.name || ''); setShowNameModal(true); }}
          >
            <Ionicons name="pencil" size={16} color="#3d644a" />
          </TouchableOpacity>
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

        {/* ── ข้อมูลสุขภาพ ── */}
        <Text style={styles.sectionLabel}>ข้อมูลสุขภาพ</Text>
        <ProfileHealthRow
          weight={profile.weight}
          height={profile.height}
          bmi={bmi}
          age={getProfileAge(profile.birthDate)}
          onPressWeight={() => openHealthFieldEditor('weight')}
          onPressHeight={() => openHealthFieldEditor('height')}
          onPressAge={() => openHealthFieldEditor('age')}
        />

        {/* ── ข้อมูลและเป้าหมาย ── */}
        <Text style={styles.sectionLabel}>ข้อมูลส่วนตัว</Text>
        <View style={styles.gridContainer}>
          <ProfileAccountCard
            email={email || profile.email}
            onPressEmail={() => {
              setInputEmail(email || profile.email || '');
              setShowEmailModal(true);
            }}
            onPressPassword={() => setShowPasswordModal(true)}
          />
        </View>

        {/* ── ตั้งค่าแอป ── */}
        <Text style={styles.sectionLabel}>ตั้งค่าแอป</Text>
        <View style={styles.cardFull}>
          <View style={styles.cardHeaderIndicator} />
          <View style={styles.notificationRow}>
            <View style={styles.notificationLeft}>
              <Ionicons name="notifications-outline" size={20} color={GREEN} />
              <Text style={styles.optionText}>การแจ้งเตือน</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, notificationEnabled && styles.toggleBtnOn]}
              onPress={() => setNotificationEnabled(prev => !prev)}
            >
              <View style={[styles.toggleCircle, notificationEnabled && styles.toggleCircleOn]} />
            </TouchableOpacity>
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

      {/* ── Modal แก้อีเมล ── */}
      <Modal visible={showEmailModal} transparent animationType="fade"
        onRequestClose={() => setShowEmailModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Ionicons name="mail-outline" size={22} color={GREEN} />
              <Text style={styles.modalTitle}>แก้ไขอีเมล</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={inputEmail}
                onChangeText={setInputEmail}
                placeholder="กรอกอีเมลใหม่"
                placeholderTextColor="#bbb"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEmailModal(false)}>
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveEmail}>
                <Text style={styles.confirmBtnText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Modal ข้อมูลสุขภาพ ── */}
      <Modal visible={showHealthFieldModal} transparent animationType="fade"
        onRequestClose={() => setShowHealthFieldModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="heart-pulse" size={22} color={GREEN} />
              <Text style={styles.modalTitle}>
                {healthFieldType === 'weight' ? 'แก้ไขน้ำหนัก' : healthFieldType === 'height' ? 'แก้ไขส่วนสูง' : 'เลือกวันเกิด'}
              </Text>
            </View>

            {(healthFieldType === 'weight' || healthFieldType === 'height') && (
              <View>
                <Text style={styles.fieldLabel}>
                  {healthFieldType === 'weight' ? 'น้ำหนัก (กก.)' : 'ส่วนสูง (ซม.)'}
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={healthFieldValue}
                    onChangeText={setHealthFieldValue}
                    placeholder={healthFieldType === 'weight' ? 'เช่น 65' : 'เช่น 172'}
                    placeholderTextColor="#bbb"
                    keyboardType="numeric"
                    maxLength={5}
                    autoFocus
                  />
                </View>
              </View>
            )}

            {healthFieldType === 'age' && (
              <View>
                <BirthDatePickerCard
                  textValue={formatBirthDateThai(selectedBirthDate)}
                  selectedDate={selectedBirthDate}
                  isOpen={showBirthPicker}
                  onToggle={() => setShowBirthPicker(prev => !prev)}
                  onChangeDate={setSelectedBirthDate}
                  accentColor={GREEN}
                />
              </View>
            )}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowHealthFieldModal(false)}>
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveHealthField}>
                <Text style={styles.confirmBtnText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Modal เปลี่ยนรหัสผ่าน ── */}
      <Modal visible={showPasswordModal} transparent animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Ionicons name="lock-closed-outline" size={22} color={GREEN} />
              <Text style={styles.modalTitle}>เปลี่ยนรหัสผ่าน</Text>
            </View>
            {[
              { label: 'รหัสผ่านเดิม',   value: oldPassword,     setter: setOldPassword     },
              { label: 'รหัสผ่านใหม่',   value: newPassword,     setter: setNewPassword     },
              { label: 'ยืนยันรหัสผ่าน', value: confirmPassword, setter: setConfirmPassword },
            ].map((field) => (
              <View key={field.label}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder="••••••••"
                    placeholderTextColor="#bbb"
                    secureTextEntry
                  />
                </View>
              </View>
            ))}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPasswordModal(false)}>
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleChangePassword}>
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
  avatarContainer: {width: 110, height: 110, borderRadius: 55,borderWidth: 3, borderColor: GREEN,overflow: 'hidden', backgroundColor: '#E9DCC9',justifyContent: 'center', alignItems: 'center',
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
    backgroundColor: '#8FBC8F',
    marginHorizontal: 20, marginTop: 12,
    paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 20, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  userNameText: { fontSize: 18, fontWeight: '700', marginRight: 8, color: '#1a1a1a' },
  editIcon: { padding: 4 },

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
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  accountRowLeft: { flex: 1, paddingRight: 10 },

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
  coinBadge: {
    position: 'absolute',   
    top: -10,               
    right: 12,              // 👈 เพิ่มตรงนี้
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 3, gap: 4,
  },
  coinIcon: {
    width: 20,
    height: 20,
  },
  coinText: { fontWeight: '700', fontSize: 15, color: '#C8861A' },
  notificationRow: {
  flexDirection: 'row', alignItems: 'center',
  justifyContent: 'space-between', paddingVertical: 6,
},
notificationLeft: {
  flexDirection: 'row', alignItems: 'center', gap: 8,
},
toggleBtn: {
  width: 48, height: 26, borderRadius: 13,
  backgroundColor: '#E0E0E0', justifyContent: 'center',
  paddingHorizontal: 3,
},
toggleBtnOn: { backgroundColor: GREEN },
toggleCircle: {
  width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff',
},
toggleCircleOn: { alignSelf: 'flex-end' },
});

export default ProfileScreen;