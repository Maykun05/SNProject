import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { API_URL } from '../config';

const ForgotPasswordScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [recoveryQuestion, setRecoveryQuestion] = useState('');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const raw = route.params?.email;
    const trimmed = typeof raw === 'string' ? raw.trim() : '';
    if (!trimmed) {
      Alert.alert(
        'แจ้งเตือน',
        'กรุณากรอกอีเมลในหน้าเข้าสู่ระบบก่อน แล้วค่อยกดลืมรหัสผ่าน',
        [{ text: 'ตกลง', onPress: () => navigation.goBack() }]
      );
      setLoadError(true);
      setLoadingQuestion(false);
      return;
    }

    setEmail(trimmed);
    let cancelled = false;

    (async () => {
      try {
        setLoadingQuestion(true);
        const res = await fetch(`${API_URL}/api/forgot-password/question`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmed }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          Alert.alert('ผิดพลาด', data.message || 'โหลดคำถามไม่สำเร็จ', [
            { text: 'ตกลง', onPress: () => navigation.goBack() },
          ]);
          setLoadError(true);
          return;
        }
        setRecoveryQuestion(data.recoveryQuestion || '');
      } catch (e) {
        if (!cancelled) {
          console.log('FORGOT QUESTION ERROR:', e);
          Alert.alert('ผิดพลาด', 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ', [
            { text: 'ตกลง', onPress: () => navigation.goBack() },
          ]);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoadingQuestion(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigation, route.params?.email]);

  const goBackHeader = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const submitReset = async () => {
    const trimmed = email.trim();
    const aTrim = recoveryAnswer.trim();
    if (!trimmed) {
      navigation.goBack();
      return;
    }
    if (!aTrim) {
      Alert.alert('ผิดพลาด', 'กรุณากรอกคำตอบ');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('ผิดพลาด', 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('ผิดพลาด', 'รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/api/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          recoveryAnswer: aTrim,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('ผิดพลาด', data.message || 'รีเซ็ตรหัสผ่านไม่สำเร็จ');
        return;
      }
      Alert.alert('สำเร็จ', 'รีเซ็ตรหัสผ่านแล้ว กรุณาเข้าสู่ระบบด้วยรหัสใหม่', [
        {
          text: 'ตกลง',
          onPress: () =>
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            ),
        },
      ]);
    } catch (e) {
      console.log('FORGOT RESET ERROR:', e);
      Alert.alert('ผิดพลาด', 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const showForm = !loadError && recoveryQuestion !== '' && !loadingQuestion;

  return (
    <View style={styles.root}>
      <View style={styles.greenArea}>
        <SafeAreaView edges={['top']} style={styles.greenSafe}>
          <TouchableOpacity style={styles.backButton} onPress={goBackHeader}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.whiteArea}
      >
        <ScrollView
          contentContainerStyle={styles.card}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>ตอบคำถามกู้คืน</Text>

          {email ? (
            <Text style={styles.emailHint} numberOfLines={2}>
              อีเมล: {email}
            </Text>
          ) : null}

          {loadingQuestion && !loadError ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator size="large" color="#2D4F45" />
              <Text style={styles.loadingText}>กำลังโหลดคำถาม...</Text>
            </View>
          ) : null}

          {showForm ? (
            <>
              <Text style={styles.label}>คำถาม</Text>
              <View style={styles.questionBox}>
                <Text style={styles.questionText}>{recoveryQuestion}</Text>
              </View>
              <Text style={styles.label}>คำตอบของคุณ</Text>
              <TextInput
                style={styles.input}
                value={recoveryAnswer}
                onChangeText={setRecoveryAnswer}
                secureTextEntry
                autoCorrect={false}
                placeholderTextColor="#9E9E9E"
                placeholder="คำตอบ"
              />
              <Text style={styles.label}>รหัสผ่านใหม่</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholderTextColor="#9E9E9E"
                placeholder="อย่างน้อย 6 ตัวอักษร"
              />
              <Text style={styles.label}>ยืนยันรหัสผ่านใหม่</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholderTextColor="#9E9E9E"
                placeholder="ยืนยันรหัสผ่าน"
              />
              <TouchableOpacity
                style={[styles.button, saving && styles.buttonDisabled]}
                onPress={submitReset}
                disabled={saving}
              >
                <Text style={styles.buttonText}>
                  {saving ? 'กำลังบันทึก...' : 'รีเซ็ตรหัสผ่าน'}
                </Text>
              </TouchableOpacity>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#2D4F45' },
  greenArea: {
    backgroundColor: '#2D4F45',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  greenSafe: { paddingBottom: 4 },
  backButton: { paddingVertical: 6, alignSelf: 'flex-start' },
  whiteArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    overflow: 'hidden',
  },
  card: {
    paddingHorizontal: 35,
    paddingTop: 36,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D4F45',
    textAlign: 'center',
    marginBottom: 12,
  },
  emailHint: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingBlock: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2D4F45',
  },
  label: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#D9D9D9',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#333',
    marginBottom: 18,
  },
  questionBox: {
    backgroundColor: '#E8E8E8',
    borderRadius: 15,
    padding: 16,
    marginBottom: 18,
  },
  questionText: {
    fontSize: 16,
    color: '#2D4F45',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#2D4F45',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
});

export default ForgotPasswordScreen;
