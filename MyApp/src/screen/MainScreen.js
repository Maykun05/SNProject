import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import API_URL from '../config';;

const MainScreen = ({ route }) => {
  const [userData, setUserData] = useState(null);
  const userId = 1; // ในระบบจริงควรได้มาจากตอน Login

  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/${userId}`);
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching tree data:", error);
      }
    };
    fetchTreeData();
  }, []);

  // ฟังก์ชันเลือกรูปต้นไม้ตามเลเวล
 const getTreeImage = (level) => {
  switch (level) {
    case 1: return require('../../assets/tree_lv1.png'); 
    case 2: return require('../../assets/tree_lv2.png');
    case 3: return require('../../assets/tree_lv3.png');
    case 4: return require('../../assets/tree_lv4.png');
    case 5: return require('../../assets/tree_lv5.png');
    default: return require('../../assets/tree_lv1.png');
  }
};

  return (
    <View style={styles.container}>
      {userData ? (
        <>
          <Text>Level: {userData.tree_level}</Text>
          <Text>EXP: {userData.tree_exp}</Text>
          <Image 
            source={getTreeImage(userData.tree_level)} 
            style={{ width: 200, height: 200 }} 
          />
        </>
      ) : (
        <Text>กำลังโหลดข้อมูล...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});

export default MainScreen;