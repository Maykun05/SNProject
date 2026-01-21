import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import API_URL from '../config';

const PersonalInfoScreen = ({ route, navigation }) => {
  // รับ userId พร้อมค่า default ป้องกัน Error
  const { userId } = route.params || {}; 
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('Male');

  const saveInfo = async () => {
    if (!weight || !height) {
      Alert.alert('คำเตือน', 'กรุณากรอกข้อมูลน้ำหนักและส่วนสูง');
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/users/update-info/${userId}`, { 
        weight: parseFloat(weight), 
        height: parseFloat(height), 
        gender 
      });
      
      if (response.status === 200 || response.status === 201) {
        Alert.alert('สำเร็จ', 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
        navigation.replace('Main', { userId });
      }
    } catch (error) {
      console.log("Update Info Error:", error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  return (
    <View style={styles.root}>
      {/* ===== GREEN TOP AREA (เหมือนหน้า Login/Register) ===== */}
      <View style={styles.greenArea}>
        <SafeAreaView />
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logoImage} 
              resizeMode="contain" 
            />
          </View>
        </View>
      </View>

      {/* ===== WHITE AREA (ดีไซน์โค้งมน) ===== */}
      <View style={styles.whiteArea}>
        <ScrollView contentContainerStyle={styles.card} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>ข้อมูลส่วนตัว</Text>
          <Text style={styles.subtitle}>ระบุข้อมูลเพื่อคำนวณเป้าหมายการดื่มน้ำ</Text>
          
          <Text style={styles.label}>เพศ</Text>
          <View style={styles.genderRow}>
            {['Male', 'Female'].map(g => (
              <TouchableOpacity 
                key={g} 
                style={[styles.genderBtn, gender === g && styles.activeBtn]} 
                onPress={() => setGender(g)}
              >
                <Text style={[styles.btnText, gender === g && styles.activeText]}>
                  {g === 'Male' ? 'ชาย' : 'หญิง'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>น้ำหนัก</Text>
          <TextInput 
            placeholder="กิโลกรัม" 
            style={styles.input} 
            keyboardType="numeric" 
            onChangeText={setWeight}
            value={weight}
          />

          <Text style={styles.label}>ส่วนสูง</Text>
          <TextInput 
            placeholder="เซนติเมตร" 
            style={styles.input} 
            keyboardType="numeric" 
            onChangeText={setHeight}
            value={height}
          />
          
          <TouchableOpacity style={styles.button} onPress={saveInfo}>
            <Text style={styles.buttonText}>ถัดไป</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#2D4F45' },
  
  /* ===== GREEN TOP ===== */
  greenArea: { backgroundColor: '#2D4F45', paddingBottom: 20 },
  logoContainer: { alignItems: 'center', marginTop: 10 },
  logoBox: { width: 80, height: 80, borderRadius: 20, overflow: 'hidden' },
  logoImage: { width: '100%', height: '100%' },

  /* ===== WHITE AREA ===== */
  whiteArea: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 60, 
    overflow: 'hidden' 
  },
  card: { padding: 30, paddingBottom: 50 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2D4F45', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#9E9E9E', marginBottom: 30, textAlign: 'center' },
  
  label: { color: '#9E9E9E', marginBottom: 8, fontSize: 14 },
  genderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  genderBtn: { 
    flex: 0.48, 
    padding: 16, 
    borderRadius: 20, 
    backgroundColor: '#E5E5E5', 
    alignItems: 'center' 
  },
  activeBtn: { backgroundColor: '#2D4F45' },
  btnText: { color: '#9E9E9E', fontWeight: 'bold' },
  activeText: { color: '#fff' },
  
  input: { 
    backgroundColor: '#E5E5E5', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 20,
    fontSize: 16 
  },
  button: { 
    backgroundColor: '#2D4F45', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default PersonalInfoScreen;