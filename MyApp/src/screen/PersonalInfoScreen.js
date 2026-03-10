import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const PersonalInfoScreen = ({ navigation }) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [birthDateText, setBirthDateText] = useState('เลือกวันเกิด');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('ไม่ระบุเพศ');
  const [exerciseLevel, setExerciseLevel] = useState(null);

  const genderOptions = [
    { key: 'female', label: 'หญิง', icon: 'female' },
    { key: 'male', label: 'ชาย', icon: 'male' },
    { key: 'other', label: 'ไม่ระบุเพศ', icon: 'person' },
  ];

  const exerciseOptions = [
    { level: 0, times: '0 ครั้ง/สัปดาห์', desc: 'ไม่ออกกำลังกาย' },
    { level: 1, times: '1–2 ครั้ง/สัปดาห์', desc: 'น้อย' },
    { level: 2, times: '3–4 ครั้ง/สัปดาห์', desc: 'ปานกลาง' },
    { level: 3, times: '5–6 ครั้ง/สัปดาห์', desc: 'ดี' },
    { level: 4, times: '7 ครั้ง/สัปดาห์', desc: 'ดีมาก' },
  ];

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const fDate = `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`;
      setBirthDateText(fDate);
    }
  };

  // ตรวจสอบว่ากรอกข้อมูลครบหรือยัง (Validation)
  const isFormValid = weight !== '' && height !== '' && exerciseLevel !== null && birthDateText !== 'เลือกวันเกิด';

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={{ backgroundColor: '#2D4F45' }} />
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={28} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.logoWrapper}>
                <Ionicons name="pulse-outline" size={80} color="#FFF" />
                <Ionicons name="heart" size={30} color="#FFF" style={styles.smallHeart} />
              </View>
            </View>

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

              <Text style={styles.label}>วันเกิด</Text>
              <TouchableOpacity style={styles.inputBox} onPress={() => setShowDatePicker(true)}>
                <Text style={{ color: birthDateText === 'เลือกวันเกิด' ? '#999' : '#333' }}>
                  {birthDateText}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#2D4F45" />
              </TouchableOpacity>

              <Text style={styles.label}>เพศ</Text>
              <View style={styles.genderGrid}>
                {genderOptions.map((item) => {
                  const active = gender === item.label;
                  return (
                    <TouchableOpacity 
                      key={item.key} 
                      style={[styles.genderBtn, active && styles.btnActive]} 
                      onPress={() => { Keyboard.dismiss(); setGender(item.label); }}
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
                      {active && <Ionicons name="checkmark-circle" size={24} color="#FFF" />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ปุ่มบันทึก: จะไปหน้าเลือกฟีเจอร์ (FeatureSelection) */}
              <TouchableOpacity
  style={[
    styles.saveBtn,
    !isFormValid && { opacity: 0.5 }
  ]}
  onPress={() => {
    if (!isFormValid) {
      console.log("Form not complete");
      return;
    }

    navigation.navigate('FeatureSelection');
  }}
  activeOpacity={0.8}
>
  <Text style={styles.saveBtnText}>บันทึก</Text>
</TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {showDatePicker && (
        <DateTimePicker 
          value={date} 
          mode="date" 
          display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
          onChange={onDateChange}
          maximumDate={new Date()} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#2D4F45' },
  scrollContent: { flexGrow: 1 },
  header: { height: 160, justifyContent: 'center', alignItems: 'center' },
  backBtn: { position: 'absolute', top: 20, left: 20, zIndex: 10 },
  logoWrapper: { flexDirection: 'row', alignItems: 'center' },
  smallHeart: { marginLeft: -25, marginTop: 30 },
  whiteCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 40, 
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2D4F45', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#2D4F45', marginTop: 15, marginBottom: 8 },
  input: { backgroundColor: '#F0F0F0', borderRadius: 12, padding: 15, marginBottom: 5, color: '#333', fontSize: 16 },
  inputBox: { backgroundColor: '#F0F0F0', borderRadius: 12, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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