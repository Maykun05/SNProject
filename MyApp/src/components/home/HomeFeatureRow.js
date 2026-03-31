import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'; // ✅ เพิ่ม Image
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeFeatureRow({ features, onPress }) {
  return (
    <View style={styles.row}>
      {features.map(f => (
        <TouchableOpacity
          key={f.key}
          style={styles.item}
          onPress={() => onPress?.(f)}
        >
          <View style={styles.iconWrapper}>
            {/* ✅ ถ้ามี image ใช้ Image แทน Icon */}
            {f.image ? (
              <Image source={f.image} style={styles.featureImage} />
            ) : (
              <MaterialCommunityIcons name={f.icon} size={26} />
            )}
          </View>
          <Text style={styles.text}>{f.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 25,
    paddingHorizontal: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 36, height: 36,
    justifyContent: 'center', alignItems: 'center',
  },
  text: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  // ✅ style สำหรับรูปภาพ
  featureImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});