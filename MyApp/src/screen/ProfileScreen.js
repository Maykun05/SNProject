import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  
  // ฟังก์ชันสำหรับการออกจากระบบ
  const handleLogout = () => {
    Alert.alert(
      "ยืนยันการออกจากระบบ",
      "คุณต้องการออกจากระบบใช่หรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        { 
          text: "ออกจากระบบ", 
          style: "destructive",
          // ใช้ reset เพื่อล้าง stack ทั้งหมดและกลับไปหน้า Login
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          }) 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ตั้งค่าโปรไฟล์</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.menuList}>
        <SettingItem icon="person-outline" label="ข้อมูลส่วนตัว" />
        <SettingItem icon="notifications-outline" label="การแจ้งเตือน" />
        <SettingItem icon="shield-checkmark-outline" label="ความเป็นส่วนตัว" />
        
        {/* ปุ่มออกจากระบบ */}
        <SettingItem 
          icon="log-out-outline" 
          label="ออกจากระบบ" 
          color="#FF4D4D" 
          onPress={handleLogout} // เรียกฟังก์ชัน handleLogout
        />
      </View>
    </SafeAreaView>
  );
};

// แก้ไข Component SettingItem ให้รับ onPress
const SettingItem = ({ icon, label, color = "black", onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.itemLeft}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.itemLabel, { color }]}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#CCC" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  menuList: { marginTop: 20, paddingHorizontal: 20 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#EEE' },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemLabel: { marginLeft: 15, fontSize: 16 }
});

export default ProfileScreen;