import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeFeatureIcons({ features, doneMap, onPress }) {
  return (
    <>
      {features
        .filter(f => !doneMap[f.key])
        .map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.icon, f.position]}
            onPress={() => onPress(f)}
          >
            <MaterialCommunityIcons name={f.icon} size={26} />
          </TouchableOpacity>
        ))}
    </>
  );
}

const styles = StyleSheet.create({
  icon: {
    position: 'absolute',   // 🔥 ต้องเป็น absolute
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#abb9a7ff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,              // 🔥 กันโดนวงกลมทับ
  },
});
