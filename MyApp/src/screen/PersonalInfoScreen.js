import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { AuthContext } from "../context/AuthProvider";
import BirthDatePickerCard from '../components/BirthDatePickerCard';

const PersonalInfoScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { userToken } = useContext(AuthContext);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [birthDateText, setBirthDateText] = useState('เลือกวันเกิด');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('OTHER');
  const [exerciseLevel, setExerciseLevel] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatBirthDateThai = (selectedDate) => {
    try {
      return new Intl.DateTimeFormat('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(selectedDate);
    } catch {
      return selectedDate.toLocaleDateString('th-TH');
    }
  };

  const genderOptions = [
    { key: 'FEMALE', label: 'หญิง', icon: 'female' },
    { key: 'MALE', label: 'ชาย', icon: 'male' },
    { key: 'OTHER', label: 'ไม่ระบุเพศ', icon: 'person' },
  ];

  const exerciseOptions = [
    { level: 0, times: '0 ครั้ง/สัปดาห์', desc: 'ไม่ออกกำลังกาย' },
    { level: 1, times: '1-2 ครั้ง/สัปดาห์', desc: 'น้อย' },
    { level: 2, times: '3-4 ครั้ง/สัปดาห์', desc: 'ปานกลาง' },
    { level: 3, times: '5-6 ครั้ง/สัปดาห์', desc: 'ดี' },
    { level: 4, times: '7 ครั้ง/สัปดาห์', desc: 'ดีมาก' },
  ];

  const handleSave = async () => {
    try {
      if (!isFormValid) {
        console.log("Form not complete");
        return;
      }

      const w = parseFloat(weight);
      if (Number.isNaN(w) || w < 20 || w > 300) {
        Alert.alert('น้ำหนักไม่ถูกต้อง', 'กรุณากรอกน้ำหนัก 20-300 กก.');
        return;
      }

      const h = parseFloat(height);
      if (Number.isNaN(h) || h < 50 || h > 250) {
        Alert.alert('ส่วนสูงไม่ถูกต้อง', 'กรุณากรอกส่วนสูง 50-250 ซม.');
        return;
      }

      const res = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          weight: w,
          height: h,
          birthDate: date.toISOString(),
          activityLevel: exerciseLevel,
          gender: gender,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      navigation.navigate("Select");

    } catch (err) {
      console.log("SAVE PROFILE ERROR:", err);
    }
  };

  // ตรวจสอบว่ากรอกข้อมูลครบหรือยัง (Validation)
  const isFormValid = weight !== '' && height !== '' && exerciseLevel !== null && birthDateText !== 'เลือกวันเกิด';

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={{ backgroundColor: '#2D4F45' }} />
      
      <TouchableWithoutFeedback 
        onPress={() => {
          Keyboard.dismiss();       
          setShowDatePicker(false); 
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                height: Math.max(insets.top, 8) + 80,
                backgroundColor: '#2D4F45',
              }}
            />

            {/* Content Area */}
            <View style={styles.whiteCard}>
              <Text style={styles.title}>ข้อมูลส่วนตัว</Text>

              <Text style={styles.label}>น้ำหนัก (กก.)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="เช่น 65" 
                placeholderTextColor="#999"
                keyboardType="numeric" 
                value={weight} 
                onChangeText={setWeight} 
              />

              <Text style={styles.label}>ส่วนสูง (ซม.)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="เช่น 160" 
                placeholderTextColor="#999"
                keyboardType="numeric" 
                value={height} 
                onChangeText={setHeight} 
              />

              <BirthDatePickerCard
                textValue={birthDateText}
                isPlaceholder={birthDateText === 'เลือกวันเกิด'}
                selectedDate={date}
                isOpen={showDatePicker}
                onToggle={() => setShowDatePicker(prev => !prev)}
                onChangeDate={(selectedDate) => {
                  setDate(selectedDate);
                  setBirthDateText(formatBirthDateThai(selectedDate));
                }}
                accentColor="#2D4F45"
              />

              <Text style={styles.label}>เพศ</Text>
              <View style={styles.genderGrid}>
                {genderOptions.map((item) => {
                  const active = gender === item.key;
                  return (
                    <TouchableOpacity 
                      key={item.key} 
                      style={[styles.genderBtn, active && styles.btnActive]} 
                      onPress={() => { Keyboard.dismiss(); setGender(item.key); }}
                    >
                      <Ionicons name={item.icon} size={18} color={active ? '#FFF' : '#2D4F45'} />
                      <Text style={[styles.genderText, active && styles.txtActive]}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>ระดับการออกกำลังกาย</Text>
              <View style={styles.exContainer}>
                {exerciseOptions.map((item) => {
                  const active = exerciseLevel === item.level;
                  return (
                    <TouchableOpacity 
                      key={item.level} 
                      style={[styles.exCard, active && styles.btnActive]} 
                      onPress={() => { Keyboard.dismiss(); setExerciseLevel(item.level); }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.exTitle, active && styles.txtActive]}>ระดับ {item.level}</Text>
                        <Text style={[styles.exSubtitle, active && styles.txtActive]}>{item.times} {item.desc}</Text>
                      </View>
                      {Boolean(active) && <Ionicons name="checkmark-circle" size={24} color="#FFF" />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  !isFormValid && { opacity: 0.5 }
                ]}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <TouchableOpacity
        style={[
          styles.backFab,
          { top: Math.max(insets.top, 8) + 4, left: 8 },
        ]}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#2D4F45' },
  scrollContent: { flexGrow: 1 },
  backFab: {
    position: 'absolute',
    zIndex: 999,
    padding: 8,
    ...Platform.select({
      android: { elevation: 24 },
    }),
  },
  whiteCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 40,
    marginTop: -28,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2D4F45', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#2D4F45', marginTop: 15, marginBottom: 8 },
  input: { backgroundColor: '#F0F0F0', borderRadius: 12, padding: 15, marginBottom: 5, color: '#333', fontSize: 16 },
  genderGrid: { flexDirection: 'row', gap: 8, marginTop: 5 },
  genderBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F0F0F0', alignItems: 'center' },
  genderText: { fontSize: 12, fontWeight: 'bold', color: '#2D4F45', marginTop: 4 },
  exContainer: { gap: 10, marginTop: 5, marginBottom: 30 },
  exCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 15, backgroundColor: '#F5F5F5' },
  exTitle: { fontSize: 14, fontWeight: 'bold', color: '#2D4F45' },
  exSubtitle: { fontSize: 12, color: '#666' },
  btnActive: { backgroundColor: '#2D4F45' },
  txtActive: { color: '#FFF' },
  saveBtn: { 
    backgroundColor: '#2D4F45', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 }
    })
  },
  saveBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default PersonalInfoScreen;