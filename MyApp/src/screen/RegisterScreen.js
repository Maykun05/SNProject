import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ใช้ Ionicons แทน Image เพื่อให้เหมือน PersonalInfo

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    if (!username || !email || !password) {
      Alert.alert('ผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('ผิดพลาด', 'รหัสผ่านไม่ตรงกัน');
      return;
    }
    if (!isAgreed) {
      Alert.alert('คำเตือน', 'กรุณากดยอมรับการอนุญาตข้อมูลส่วนตัว');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('PersonalInfo', { userId: 'mock_123' });
    }, 800);
  };

  return (
    <View style={styles.root}>
      {/* ส่วนหัวสีเขียว: ปรับให้เหมือนหน้า PersonalInfo */}
      <View style={styles.greenArea}>
        <SafeAreaView />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.iconContainer}>
          <Ionicons name="pulse-outline" size={120} color="#FFF" style={{ opacity: 0.8 }} />
          <Ionicons name="heart" size={50} color="#FFF" style={styles.heartIcon} />
        </View>
      </View>

      {/* ส่วนเนื้อหาตัวสีขาวโค้ง */}
      <View style={styles.whiteArea}>
        <ScrollView 
          contentContainerStyle={styles.card} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" 
        >
          <Text style={styles.title}>สมัครสมาชิก</Text>
          
          <Text style={styles.label}>ชื่อผู้ใช้</Text>
          <TextInput style={styles.input} onChangeText={setUsername} autoCorrect={false} placeholder="Username" />

          <Text style={styles.label}>อีเมล</Text>
          <TextInput 
            style={styles.input} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            autoCapitalize="none"
            placeholder="Email"
          />

          <Text style={styles.label}>รหัสผ่าน</Text>
          <TextInput style={styles.input} secureTextEntry onChangeText={setPassword} placeholder="Password" />

          <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
          <TextInput style={styles.input} secureTextEntry onChangeText={setConfirmPassword} placeholder="Confirm Password" />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, isAgreed && styles.checkboxChecked]}
              onPress={() => setIsAgreed(!isAgreed)}
            >
              {isAgreed && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              ฉันอนุญาตให้เข้าถึงและใช้งานข้อมูลส่วนตัวตามนโยบายของแอปพลิเคชัน
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.6 }]} 
            onPress={handleRegister}
            disabled={loading} 
          >
            <Text style={styles.buttonText}>{loading ? 'กำลังประมวลผล...' : 'ถัดไป'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.footer}>
            <Text style={styles.linkText}>มีบัญชีอยู่แล้ว? <Text style={styles.signUpText}>เข้าสู่ระบบ</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#2D4F45' },
  // ปรับส่วนเขียวให้สูงขึ้นและรองรับไอคอนกราฟหัวใจ
  greenArea: { 
    height: '30%', 
    backgroundColor: '#2D4F45', 
    justifyContent: 'center',
    paddingHorizontal: 20 
  },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  iconContainer: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 20 },
  heartIcon: { position: 'absolute', right: '32%', bottom: 20 },
  
  whiteArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 80, // ปรับความโค้งให้เท่ากับหน้า PersonalInfo
    overflow: 'hidden'
  },
  card: { padding: 35, paddingBottom: 50 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2D4F45', textAlign: 'center', marginBottom: 25 },
  label: { color: '#2D4F45', marginBottom: 6, fontWeight: '500' },
  input: { backgroundColor: '#E5E5E5', borderRadius: 15, padding: 16, marginBottom: 15 },
  
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#2D4F45',
    justifyContent: 'center', alignItems: 'center', marginRight: 10
  },
  checkboxChecked: { backgroundColor: '#2D4F45' },
  checkmark: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  checkboxLabel: { flex: 1, fontSize: 12, color: '#9E9E9E' },

  button: { 
    backgroundColor: '#2D4F45', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  footer: { alignItems: 'center', marginTop: 20 },
  linkText: { color: '#9E9E9E' },
  signUpText: { color: '#2D6A4F', fontWeight: 'bold' }
});

export default RegisterScreen;