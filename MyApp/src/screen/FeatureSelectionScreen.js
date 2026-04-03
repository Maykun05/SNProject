import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';



const FeatureSelectionScreen = ({ navigation }) => {
  // เก็บสถานะฟีเจอร์ที่เลือก (เป็น Array เพื่อให้เลือกได้หลายอย่าง)
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await fetch(`${API_URL}/api/features`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      body: JSON.stringify({ features: selectedFeatures })  
      });
      navigation.replace("MainTabs");
    } catch (err) {
      console.log("SAVE FEATURES ERROR:", err);
    }
  };
  const features = [
    { id: 1, label: 'บันทึกการดื่มน้ำ', image: require ('../assets/featureIcons/water.png') },
    { id: 2, label: 'บันทึกแคลอรี่', image: require ('../assets/featureIcons/ffood.png') },
    { id: 3, label: 'บันทึกอารมณ์', image: require ('../assets/featureIcons/mood.png') },
    { id: 5, label: 'บันทึกการออกกำลังกาย', image: require ('../assets/featureIcons/step.png') },
    { id: 4, label: 'บันทึกการนอนหลับ', image: require ('../assets/featureIcons/sleep.png') },
  ];

  const toggleFeature = (id) => {
    if (selectedFeatures.includes(id)) {
      setSelectedFeatures(selectedFeatures.filter((item) => item !== id));
    } else {
      setSelectedFeatures([...selectedFeatures, id]);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: '#2D4F45' }} />
      
      {/* Header ล้อตามตรีมเดิม */}
      <View style={styles.greenHeader}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#2D4F45" />
        </TouchableOpacity>
      </View>

      <View style={styles.whiteContent}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
          <Text style={styles.title}>คุณสนใจฟีเจอร์ไหนบ้าง?</Text>
          <Text style={styles.subtitle}>เลือกสิ่งที่คุณต้องการติดตามเพื่อสุขภาพที่ดี</Text>

          <View style={styles.featureList}>
            {features.map((item) => {
              const isSelected = selectedFeatures.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.featureCard, isSelected && styles.activeCard]}
                  onPress={() => toggleFeature(item.id)}
                >
                  <View style={styles.featureInfo}>
                    <Ionicons 
                      name={isSelected ? "checkbox" : "ellipse-outline"} 
                      size={24} 
                      color={isSelected ? "#FFF" : "#2D4F45"} 
                    />
                    <Text style={[styles.featureText, isSelected && styles.activeText]}>
                      {item.label}
                    </Text>
                  </View>
                  <Image 
                    source={item.image} 
                    style={[
                      styles.icon, 
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}          
          >
            <Text style={styles.saveButtonText}>บันทึก</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  container: { flex: 1, backgroundColor: '#2D4F45' },
  greenHeader: {
    height: 120,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  backButton: {
    width: 45,
    height: 45,
    backgroundColor: '#FFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  whiteContent: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60, // เพิ่มด้านขวาให้เหมือนในรูปตัวอย่างใหม่
  },
  scrollArea: {
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D4F45',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  featureList: { gap: 12, marginBottom: 40 },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  activeCard: {
    backgroundColor: '#2D4F45',
    borderColor: '#2D4F45',
  },
  featureInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { fontSize: 16, color: '#2D4F45', fontWeight: '500' },
  activeText: { color: '#FFF' },
  saveButton: {
    backgroundColor: '#2D4F45', // ใช้สีเดียวกับปุ่มบันทึกหน้าเดิม
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default FeatureSelectionScreen;