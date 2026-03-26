import React from 'react';
import { TouchableOpacity, Image, View, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProfile } from '../context/ProfileContext';

export default function ProfileAvatar({ size = 60 }) {
  const { profileImage, setProfileImage } = useProfile();

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission required', 'ต้องอนุญาตให้เข้าถึงรูปภาพ');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.wrapper, { width: size, height: size }]}
      onPress={pickImage}
      activeOpacity={0.8}
    >
      <Image
        source={
          profileImage
            ? { uri: profileImage }
            : { uri: 'https://cdn-icons-png.flaticon.com/512/4333/4333609.png' }
        }
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
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