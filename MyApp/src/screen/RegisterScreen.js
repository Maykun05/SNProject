import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native'; // เพิ่ม Text และ TouchableOpacity
import axios from 'axios';
import API_URL from '../config';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${API_URL}/users/register`, {
        username: username,
        email: email,
        password: password,
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert('สำเร็จ', 'ลงทะเบียนเรียบร้อยแล้ว');
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถลงทะเบียนได้: ' + (error.response?.data?.message || 'โปรดลองอีกครั้ง'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>สร้างบัญชีใหม่</Text>
      
      <TextInput placeholder="ชื่อผู้ใช้" onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="อีเมล" onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="รหัสผ่าน" onChangeText={setPassword} secureTextEntry style={styles.input} />
      
      {/* ปุ่มสมัครสมาชิก (สีเขียวตาม Figma) */}
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.buttonText}>สมัครสมาชิก</Text>
      </TouchableOpacity>

      {/* ปุ่มย้อนกลับไปหน้า Login */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 30, 
    backgroundColor: '#F5FDFB' // สีพื้นหลังอ่อนๆ ตามโทน Figma คุณ
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D6A4F',
    marginBottom: 30,
    textAlign: 'center'
  },
  input: { 
    backgroundColor: '#fff',
    borderWidth: 1, 
    borderColor: '#D8E2DC',
    borderRadius: 10,
    marginBottom: 15, 
    padding: 15 
  },
  registerButton: {
    backgroundColor: '#74C69D', // สีเขียวสว่าง
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center'
  },
  backButtonText: {
    color: '#40916C',
    fontSize: 16,
    textDecorationLine: 'underline'
  }
});

export default RegisterScreen;