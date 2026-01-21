import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView, Image } from 'react-native';
import axios from 'axios';
import API_URL from '../config';

const RegisterScreen = ({ navigation }) => {
const [username, setUsername] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState(''); // เพิ่ม State ยืนยันรหัสผ่าน
const [isAgreed, setIsAgreed] = useState(false); // 1. เพิ่ม State สำหรับช่องติ๊ก

const handleRegister = async () => {
// เช็ครหัสผ่านตรงกันไหม
if (password !== confirmPassword) {
Alert.alert('ผิดพลาด', 'รหัสผ่านไม่ตรงกัน');
return;
}

// 2. เช็คว่าติ๊กอนุญาตหรือยัง
if (!isAgreed) {
Alert.alert('คำเตือน', 'กรุณากดยอมรับการอนุญาตข้อมูลส่วนตัว');
return;
}

try {
const response = await axios.post(`${API_URL}/users/register`, {
username,
email,
password
});

if (response.status === 201 || response.status === 200) {
// ดึง userId ออกมาจาก response.data เพื่อส่งไปหน้าถัดไป
const userId = response.data.userId;
Alert.alert('สำเร็จ', 'สร้างบัญชีเรียบร้อยแล้ว');
// นำทางไปหน้า PersonalInfo พร้อมส่ง userId ไปด้วย
navigation.navigate('PersonalInfo', { userId: userId });
}
} catch (error) {
console.log("Register Error:", error.response?.data || error.message);
Alert.alert('Error', 'สมัครสมาชิกไม่สำเร็จ: ' + (error.response?.data?.message || 'โปรดลองอีกครั้ง'));
}
};

return (
<View style={styles.root}>
{/* 3. เพิ่มส่วนหัวสีเขียวเข้ม (เหมือนหน้า Login) */}
<View style={styles.greenArea}>
<SafeAreaView />
<View style={styles.logoContainer}>
<View style={styles.logoBox}>
<Image source={require('../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
</View>
</View>
</View>

{/* ส่วนสีขาวที่เลื่อนได้ */}
<View style={styles.whiteArea}>
<ScrollView contentContainerStyle={styles.card} showsVerticalScrollIndicator={false}>
<Text style={styles.title}>สมัครสมาชิก</Text>
<Text style={styles.label}>ชื่อผู้ใช้</Text>
<TextInput style={styles.input} onChangeText={setUsername} />

<Text style={styles.label}>อีเมล</Text>
<TextInput style={styles.input} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

<Text style={styles.label}>รหัสผ่าน</Text>
<TextInput style={styles.input} secureTextEntry onChangeText={setPassword} />

<Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
<TextInput style={styles.input} secureTextEntry onChangeText={setConfirmPassword} />

{/* 4. เพิ่มช่องติ๊กอนุญาตข้อมูลส่วนตัว */}
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
<TouchableOpacity style={styles.button} onPress={handleRegister}>
<Text style={styles.buttonText}>ถัดไป</Text>
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
greenArea: { backgroundColor: '#2D4F45', paddingBottom: 30 },
logoContainer: { alignItems: 'center', marginTop: 10 },
logoBox: { width: 90, height: 90, borderRadius: 20, overflow: 'hidden' },
logoImage: { width: '100%', height: '100%' },
whiteArea: {
flex: 1,
backgroundColor: '#FFFFFF',
borderTopLeftRadius: 40,
borderTopRightRadius: 40,
overflow: 'hidden'
},
card: { padding: 30, paddingBottom: 50 },
title: { fontSize: 32, fontWeight: 'bold', color: '#2D4F45', textAlign: 'center', marginBottom: 25 },
label: { color: '#9E9E9E', marginBottom: 6 },
input: { backgroundColor: '#E5E5E5', borderRadius: 20, padding: 16, marginBottom: 15 },
// สไตล์สำหรับ Checkbox
checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
checkbox: {
width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#2D4F45',
justifyContent: 'center', alignItems: 'center', marginRight: 10
},
checkboxChecked: { backgroundColor: '#2D4F45' },
checkmark: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
checkboxLabel: { flex: 1, fontSize: 12, color: '#9E9E9E' },

button: { backgroundColor: '#2D4F45', padding: 18, borderRadius: 15, alignItems: 'center' },
buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
footer: { alignItems: 'center', marginTop: 20 },
linkText: { color: '#9E9E9E' },
signUpText: { color: '#2D6A4F', fontWeight: 'bold' }
});

export default RegisterScreen;