import React from 'react';
import { TouchableOpacity, Image, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProfile } from '../../context/ProfileContext.js';
import { useNavigation } from '@react-navigation/native'; // ✅ เพิ่ม

export default function ProfileAvatar({ size = 60 }) {
  const { profile } = useProfile(); // ✅ ใช้ profile.profileImage แทน profileImage
  const navigation = useNavigation(); // ✅ เพิ่ม
  const handleOpenProfile = () => {
    const currentRoutes = navigation.getState?.()?.routeNames ?? [];
    if (currentRoutes.includes('Profile')) {
      navigation.navigate('Profile');
      return;
    }

    // Fallback: เข้าผ่าน Tab -> HomeTab -> Profile เมื่ออยู่คนละ navigator
    navigation.navigate('HomeTab', { screen: 'Profile' });
  };

  return (
    <TouchableOpacity
      style={[styles.wrapper, { width: size, height: size }]}
      onPress={handleOpenProfile}
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