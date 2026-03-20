import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WaterSetting = ({ navigation }) => {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <View style={styles.container}>
       <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnSmall}>
        <Ionicons name="chevron-back" size={20} color="white" />
      </TouchableOpacity>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>เตือนดื่มน้ำ</Text>
        <Switch 
          trackColor={{ false: "#767577", true: "#000" }}
          onValueChange={() => setIsEnabled(previousState => !previousState)}
          value={isEnabled}
        />
      </View>

      <View style={[styles.settingItem, { flexDirection: 'column', alignItems: 'flex-start', height: 80 }]}>
        <Text style={styles.settingText}>เป้าหมายการดื่มน้ำในแต่ละวัน</Text>
        <View style={{ flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center' }}>
          <Text style={styles.goalValue}>2000 ml </Text>
          <Ionicons name="pencil" size={16} color="gray" />
        </View>
      </View>
    </View>
  );
};