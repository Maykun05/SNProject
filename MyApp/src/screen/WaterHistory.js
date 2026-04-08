import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WaterHistory = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnSmall}>
        <Ionicons name="chevron-back" size={20} color="white" />
      </TouchableOpacity>
      
      <View style={styles.titleBadge}>
        <Text style={styles.titleBadgeText}>History</Text>
      </View>

      <View style={styles.logContainer}>
        <View style={styles.todayBadge}><Text>today</Text></View>
        <ScrollView style={{height: 200}}>
          {[1,2,3,4,5].map((_, i) => (
            <View key={i} style={styles.logItem}>
               <Text>10:30 - น้ำสิงห์ 600 ml</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.chartCard}>
         <Text style={styles.chartTitle}>การดื่มน้ำ</Text>
         <Text style={{fontSize: 12, color: '#666'}}>เฉลี่ย: 1620ml</Text>
         {/* คุณสามารถใส่กราฟจาก react-native-chart-kit ตรงนี้ได้ */}
         <View style={styles.placeholderChart} />
      </View>
    </View>
  );
};