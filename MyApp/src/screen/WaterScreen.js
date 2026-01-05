import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import API_URL from '../config';;

const WaterScreen = ({ route, navigation }) => {
  const { userId } = route.params; // รับ userId มาจากหน้า Main

  const addWater = async (amount) => {
    try {
      await axios.post(`${API_URL}/water/log`, {
        userId: userId,
        amount_ml: amount
      });
      Alert.alert('สำเร็จ!', `บันทึกการดื่มน้ำ ${amount}ml เรียบร้อย`);
      navigation.goBack(); // กลับหน้า Main เพื่อดู EXP ที่เพิ่มขึ้น
    } catch (error) {
      Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ดื่มน้ำเท่าไหร่ดี?</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.waterBtn} onPress={() => addWater(250)}>
          <Text>250ml</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.waterBtn} onPress={() => addWater(500)}>
          <Text>500ml</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 30 },
  row: { flexDirection: 'row', gap: 20 },
  waterBtn: { backgroundColor: '#ADD8E6', padding: 20, borderRadius: 50 }
});

export default WaterScreen;