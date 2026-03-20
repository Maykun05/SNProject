import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import HomeScreen from './homepage';
const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // สั่งให้เปลี่ยนหน้าไปที่ 'Main' ทันที
    // หมายเหตุ: ตรวจสอบว่าใน App.js ของคุณมี Screen ชื่อ 'Main' อยู่ใน Stack Navigator แล้ว
    navigation.replace('MainTabs'); 
  };

  return (
    <View style={styles.root}>
      {/* ส่วนหัวสีเขียว */}
      <View style={styles.greenArea}>
        <SafeAreaView />
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Image
              // ตรวจสอบ Path รูปภาพของคุณให้ถูกต้อง
              source={require('/Users/kuntidakongkad/Documents/ทำงานทำการ/SNProject/MyApp/src/assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* ส่วนเนื้อหาพื้นหลังสีขาว */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.whiteArea}
      >
        <ScrollView contentContainerStyle={styles.card} bounces={false}>
          <Text style={styles.title}>เข้าสู่ระบบ</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ชื่อ</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor="#9E9E9E"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>รหัสผ่าน</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#9E9E9E"
            />
          </View>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <TouchableOpacity>
              <Text style={styles.forgotText}>ลืมรหัสผ่าน?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signUpText}>สมัครสมาชิก</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#2D4F45' // สีเขียวเข้มพื้นหลัง
  },
  greenArea: {
    backgroundColor: '#2D4F45',
    height: '35%', // ปรับสัดส่วนตามความเหมาะสม
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoBox: {
    width: 120,
    height: 120,
    backgroundColor: '#76B947', // สีเขียวสว่างของไอคอน (ถ้าต้องการใส่พื้นหลังไอคอน)
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  logoImage: {
    width: '100%',
    height: '100%'
  },
  whiteArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 50, // ความโค้งมนด้านบนตามดีไซน์
    borderTopRightRadius: 50,
  },
  card: {
    paddingHorizontal: 40,
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'stretch'
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#2D4F45',
    textAlign: 'center',
    marginBottom: 40
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 8,
    marginLeft: 5
  },
  input: {
    backgroundColor: '#D9D9D9', // สีเทาอ่อนตามรูป
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333'
  },
  loginButton: {
    backgroundColor: '#2D4F45',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    // เพิ่มเงาให้ดูสวยงาม
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  footer: {
    alignItems: 'center',
    marginTop: 30
  },
  forgotText: {
    color: '#9E9E9E',
    fontSize: 16,
    marginBottom: 10
  },
  signUpText: {
    color: '#2D4F45',
    fontWeight: 'bold',
    fontSize: 18
  }
});

export default LoginScreen;