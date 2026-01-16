import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Image
} from 'react-native';
import axios from 'axios';
import API_URL from '../config';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        username,
        password
      });

      if (response.status === 200) {
        navigation.navigate('Main', {
          userId: response.data.userId
        });
      }
    } catch (error) {
      Alert.alert('Error', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <View style={styles.root}>

      {/* ===== GREEN TOP AREA ===== */}
      <View style={styles.greenArea}>
        <SafeAreaView />
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Image
              source={require('/Users/kuntidakongkad/Documents/ทำงานทำการ/SNProject/MyApp/src/assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* ===== WHITE AREA (INCLUDES BOTTOM SAFE AREA) ===== */}
      <SafeAreaView style={styles.whiteArea}>
        <View style={styles.card}>
          <Text style={styles.title}>เข้าสู่ระบบ</Text>

          <Text style={styles.label}>ชื่อ</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text style={styles.label}>รหัสผ่าน</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.forgotText}>ลืมรหัสผ่าน?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signUpText}>สมัครสมาชิก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  /* ===== ROOT ===== */
  root: {
    flex: 1,
    backgroundColor: '#2D4F45'
  },

  /* ===== GREEN TOP ===== */
  greenArea: {
    backgroundColor: '#2D4F45',
    paddingBottom: 40
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10
  },
  logoBox: {
    width: 110,
    height: 110,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoImage: {
    width: '100%',
    height: '100%'
  },

  /* ===== WHITE AREA ===== */
  whiteArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden'
  },

  /* ===== CARD ===== */
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 30
  },

  /* ===== TEXT ===== */
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D4F45',
    textAlign: 'center',
    marginBottom: 30
  },
  label: {
    color: '#9E9E9E',
    marginBottom: 6
  },

  /* ===== INPUT ===== */
  input: {
    backgroundColor: '#E5E5E5',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20
  },

  /* ===== BUTTON ===== */
  button: {
    backgroundColor: '#2D4F45',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },

  /* ===== FOOTER ===== */
  footer: {
    alignItems: 'center',
    marginTop: 25
  },
  forgotText: {
    color: '#9E9E9E',
    marginBottom: 5
  },
  signUpText: {
    color: '#2D6A4F',
    fontWeight: 'bold'
  }
});
