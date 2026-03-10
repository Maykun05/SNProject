import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressRing from '/Users/kuntidakongkad/Documents/ทำงานทำการ/SNProject/MyApp/src/component/ProgressRing.js';
import axios from 'axios';
import API_URL from '../config';

const WaterScreen = ({ route, navigation }) => {
  // รับ userId และ weight (ที่ดึงมาจากฐานข้อมูลตอน login/สมัครสมาชิก)
  const { userId, weight } = route.params || { userId: null, weight: 60 }; 

  // คำนวณปริมาณน้ำที่ควรดื่ม (น้ำหนัก x 30)
  const recommendedWater = weight * 30;

  const [consumed, setConsumed] = useState(0); // ปริมาณที่ดื่มไปแล้ว
  const [amountToAdd, setAmountToAdd] = useState(100); // ปริมาณที่จะกดเพิ่ม

  // ฟังก์ชันบันทึกข้อมูลไปยัง API
  const handleSaveWater = async () => {
    try {
      await axios.post(`${API_URL}/water/log`, {
        userId: userId,
        amount_ml: amountToAdd
      });
      setConsumed(prev => prev + amountToAdd);
      Alert.alert('สำเร็จ', 'บันทึกข้อมูลการดื่มน้ำเรียบร้อย');
    } catch (error) {
      Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  return (
      <View style={styles.}>
      {/* 1. ส่วนคำแนะนำด้านบนสุด (Recommendation Header) */}
      <View style={styles.recommendationBox}>
        <Text style={styles.recommendTitle}>ปริมาณน้ำที่แนะนำสำหรับคุณ</Text>
        <Text style={styles.recommendValue}>ประมาณ {recommendedWater} มล. ต่อวัน</Text>
        <Text style={styles.recommendSubText}>(คำนวณจากน้ำหนักตัว {weight} กก.)</Text>
      </View>

      {/* Header Buttons */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('WaterSetting')}>
          <Ionicons name="settings-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* Progress Ring */}
      <ProgressRing consumed={consumed} recommended={recommendedWater} />

      {/* Controller Section */}
      <View style={styles.controller}>
        <View style={styles.amountDisplay}>
          <Text style={styles.amountText}>{amountToAdd} ml</Text>
        </View>
        
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.circleBtn} 
            onPress={() => setAmountToAdd(prev => Math.max(0, prev - 50))}
          >
            <Text style={styles.btnText}>—</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.circleBtn} 
            onPress={() => setAmountToAdd(prev => prev + 50)}
          >
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveContainer} onPress={handleSaveWater}>
             <Ionicons name="water" size={32} color="#4A90E2" />
             <Text style={styles.saveLabel}>save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* History Preview */}
      <TouchableOpacity 
        style={styles.historyCard} 
        onPress={() => navigation.navigate('WaterHistory')}
      >
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>History</Text>
          <Text style={styles.arrow}>{'>'}</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.historyItem}>
              <Text>วันนี้คุณดื่มน้ำไปแล้ว {consumed} มล.</Text>
            </View>
        </ScrollView>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    alignItems: 'center',
  },
  recommendationBox: {
    backgroundColor: '#E8F5E9',
    width: '90%',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  recommendTitle: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  recommendValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginVertical: 2,
  },
  recommendSubText: {
    fontSize: 12,
    color: '#666',
  },
  header: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  backBtn: {
    backgroundColor: '#6B8E78',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controller: {
    alignItems: 'center',
    marginVertical: 20,
  },
  amountDisplay: {
    backgroundColor: '#C5E3F6',
    paddingHorizontal: 60,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
  },
  amountText: {
    fontSize: 22,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  circleBtn: {
    backgroundColor: '#A3C1AD',
    width: 70,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  saveContainer: {
    alignItems: 'center',
  },
  saveLabel: {
    fontSize: 10,
    color: '#333',
    fontWeight: 'bold'
  },
  historyCard: {
    width: '90%',
    flex: 1,
    backgroundColor: '#DBE4E0',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    marginTop: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  arrow: {
    fontSize: 20,
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
});

export default WaterScreen;