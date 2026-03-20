import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressRing from '../component/ProgressRing';

const WaterScreen = ({ route, navigation }) => {

  const { weight } = route.params || { weight: 60 };

  const recommendedWater = weight * 30;

  const [consumed, setConsumed] = useState(0);
  const [amountToAdd, setAmountToAdd] = useState(100);

  const handleSaveWater = () => {

    if (consumed + amountToAdd > recommendedWater) {
      Alert.alert("เกินปริมาณ", "คุณดื่มน้ำครบตามที่แนะนำแล้ว");
      return;
    }

    setConsumed(prev => prev + amountToAdd);

  };

  return (

    <View style={styles.container}>

      {/* Recommendation */}
      <View style={styles.recommendContainer}>
        <Text style={styles.recommendTitle}>
          ปริมาณน้ำที่แนะนำสำหรับคุณ
        </Text>

        <Text style={styles.recommendValue}>
          ประมาณ {recommendedWater} มล. ต่อวัน
        </Text>

        <Text style={styles.recommendSubText}>
          (คำนวณจากน้ำหนักตัว {weight} กก.)
        </Text>
      </View>

      {/* Progress Ring */}
      <ProgressRing
        consumed={consumed}
        recommended={recommendedWater}
      />

      {/* Controller */}
      <View style={styles.controller}>

        <View style={styles.amountDisplay}>
          <Text style={styles.amountText}>
            {amountToAdd} ml
          </Text>
        </View>

        <View style={styles.actionRow}>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => setAmountToAdd(prev => Math.max(50, prev - 50))}
          >
            <Text style={styles.btnText}>-</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => setAmountToAdd(prev => prev + 50)}
          >
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveContainer}
            onPress={handleSaveWater}
          >
            <Ionicons name="water" size={32} color="#4A90E2" />
            <Text style={styles.saveLabel}>Save</Text>
          </TouchableOpacity>

        </View>

      </View>

      {/* History */}
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
            <Text>
              วันนี้คุณดื่มน้ำไปแล้ว {consumed} มล.
            </Text>
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
    paddingTop: 20,
    alignItems: 'center',
  },

  recommendContainer: {
    marginBottom: 10,
    alignItems: 'center'
  },

  recommendTitle: {
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: '500',
    textAlign: 'center'
  },

  recommendValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginVertical: 4,
    textAlign: 'center'
  },

  recommendSubText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
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