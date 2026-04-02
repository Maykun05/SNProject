import React from 'react';
import { View,TouchableOpacity, StyleSheet, Image, 
  Pressable } from 'react-native';
import { MOODS } from '../../constants/moods';

export default function MoodQuickPicker({ visible, onSelect }) {
  if (!visible) return null;

  return (
    <View style={styles.bar}>
      {MOODS.map(({ key, image }) => (
        <TouchableOpacity key={key} onPress={() => onSelect(key)}>
          <Image source={image} style={styles.icon} />
        </TouchableOpacity>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#abb9a7ff',
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 18,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});