import React from 'react';
import { TouchableOpacity, Image, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProfile } from '/Users/kuntidakongkad/Documents/ทำงานทำการ/SNProject/MyApp/src/context/ProfileContext.js';
import { useNavigation } from '@react-navigation/native'; // ✅ เพิ่ม

export default function ProfileAvatar({ size = 60 }) {
  const { profile } = useProfile(); // ✅ ใช้ profile.profileImage แทน profileImage
  const navigation = useNavigation(); // ✅ เพิ่ม

  return (
    <TouchableOpacity
      style={[styles.wrapper, { width: size, height: size }]}
      onPress={() => navigation.navigate('Profile')} // ✅ เปลี่ยนจาก pickImage → navigate
      activeOpacity={0.8}
    >
      <Image
        source={
          profile.profileImage
            ? { uri: profile.profileImage }
            : { uri: 'https://cdn-icons-png.flaticon.com/512/4333/4333609.png' }
        }
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
      <View style={styles.editIcon}>
        <MaterialCommunityIcons name="pencil" size={12} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  
  wrapper: {
    position: 'relative',
  },
  image: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 4,
  },
});