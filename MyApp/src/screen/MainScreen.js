import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const MainScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Header: Logo & Profile */}
        <View style={styles.header}>
          <Image source={require('../assets/logo.png')} style={styles.logoTop} />
          
          {/* แก้ไข: เพิ่ม onPress เพื่อนำทางไปยังหน้า Profile */}
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle" size={45} color="black" />
          </TouchableOpacity>
        </View>

        <Text style={styles.levelText}>Lv.1</Text>

        {/* ส่วนวงกลมตรงกลาง (Circle Menu) */}
        <View style={styles.circleContainer}>
          <View style={styles.outerCircle}>
            <Image source={require('../assets/dirt_plant.png')} style={styles.centerPlant} />
            
            {/* ไอคอนบนวงกลม */}
            <View style={[styles.iconOnCircle, { top: -15 }]}>
              <MaterialCommunityIcons name="sleep" size={24} color="black" />
            </View>
            <View style={[styles.iconOnCircle, { right: -15, top: 70 }]}>
              <MaterialCommunityIcons name="dumbbell" size={24} color="#5D8AA8" />
            </View>
            <View style={[styles.iconOnCircle, { left: -15, bottom: 40 }]}>
              <MaterialCommunityIcons name="water" size={24} color="#7EC8E3" />
            </View>
            <View style={[styles.iconOnCircle, { right: -15, bottom: 40 }]}>
              <MaterialCommunityIcons name="emoticon-happy" size={24} color="#FFD700" />
            </View>
          </View>
        </View>

        {/* แถวเมนูไอคอน 5 อันล่างวงกลม */}
        <View style={styles.iconRow}>
          {/* แก้ไข: เพิ่ม onPress ให้ไอคอนน้ำไปหน้า WaterScreen */}
          <MenuIcon 
            icon="water" 
            label="น้ำ" 
            color="#7EC8E3" 
            onPress={() => navigation.navigate('Water')} 
          />
          <MenuIcon icon="food-apple" label="แคลลอรี่" color="#C1E1C1" />
          <MenuIcon icon="emoticon-happy" label="อารมณ์" color="#FFD700" />
          <MenuIcon icon="dumbbell" label="ออกกำลังกาย" color="#5D8AA8" />
          <MenuIcon icon="sleep" label="การนอน" color="#000" />
        </View>

        {/* ปุ่มคำแนะนำ */}
        <TouchableOpacity style={styles.adviceTag}>
          <Text style={styles.adviceText}>คำแนะนำสำหรับคุณ</Text>
        </TouchableOpacity>

        {/* การ์ดบทความด้านล่าง */}
        <View style={styles.articleCard}>
          <Image source={{ uri: 'https://f.ptcdn.info/160/073/000/qt2m6p4n8S7S9m6uYv-o.jpg' }} style={styles.articleImage} />
          <View style={styles.articleContent}>
            <Text style={styles.articleTitle}>กินอาหารตามกรุ๊ปเลือด</Text>
            <Text style={styles.bloodText}>A</Text>
          </View>
        </View>

      </ScrollView>

      {/* Floating Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.activeTab}>
          <Ionicons name="home" size={24} color="#2D4F45" />
          <Text style={styles.activeTabText}>main</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="calendar-outline" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialCommunityIcons name="speedometer" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="stats-chart-outline" size={28} color="black" />
        </TouchableOpacity>
        {/* แก้ไข: เพิ่มการนำทางไปหน้า Profile จาก Tab Bar ด้วย */}
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// แก้ไข: รับ props onPress เพิ่มเติม
const MenuIcon = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.menuIconContainer} onPress={onPress}>
    <View style={[styles.iconCircle, { borderColor: color }]}>
      <MaterialCommunityIcons name={icon} size={28} color={color} />
    </View>
    <Text style={styles.menuLabelText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  logoTop: { width: 45, height: 45, borderRadius: 10 },
  levelText: { textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  circleContainer: { alignItems: 'center', marginVertical: 30 },
  outerCircle: { 
    width: 220, height: 220, borderRadius: 110, 
    borderWidth: 6, borderColor: '#000', 
    justifyContent: 'center', alignItems: 'center' 
  },
  centerPlant: { width: 150, height: 100, resizeMode: 'contain' },
  iconOnCircle: { position: 'absolute', backgroundColor: '#FFF', borderRadius: 20, padding: 5, borderWidth: 1, borderColor: '#EEE' },
  iconRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 15, marginBottom: 20 },
  menuIconContainer: { alignItems: 'center' },
  iconCircle: { width: 55, height: 55, borderRadius: 28, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  menuLabelText: { fontSize: 11 },
  adviceTag: { backgroundColor: '#5C8D76', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', marginLeft: 25, marginBottom: 15 },
  adviceText: { color: '#FFF', fontWeight: 'bold' },
  articleCard: { marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', height: 180 },
  articleImage: { width: '100%', height: '100%' },
  articleContent: { position: 'absolute', bottom: 15, left: 15 },
  articleTitle: { color: '#333', fontSize: 18, fontWeight: 'bold' },
  bloodText: { position: 'absolute', right: -180, bottom: -10, fontSize: 60, fontWeight: 'bold', color: '#FFF', opacity: 0.9 },
  tabBar: { 
    position: 'absolute', bottom: 30, left: 20, right: 20, 
    backgroundColor: '#6A8E7F', height: 70, borderRadius: 35,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 10
  },
  activeTab: { backgroundColor: '#FFF', flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, alignItems: 'center' },
  activeTabText: { marginLeft: 5, color: '#2D4F45', fontWeight: 'bold' }
});

export default MainScreen;