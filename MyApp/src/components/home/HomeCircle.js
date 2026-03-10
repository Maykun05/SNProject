import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeCircle({
  features,
  doneMap,
  doneCount,
  totalCount,
  treeImage,
  onPressFeature,
}) {
  return (
    <View style={styles.wrapper}>
      {/* วงกลมหลัก */}
      <View style={styles.circle}>
        <Image source={treeImage} style={styles.image} />
        <Text style={styles.text}>
          {doneCount}/{totalCount} เป้าหมาย
        </Text>
      </View>

      {/* ไอคอนรอบวง */}
      {features
        .filter(f => !doneMap[f.key])
        .map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.icon, f.position]}
            onPress={() => onPressFeature(f)}
          >
            <MaterialCommunityIcons name={f.icon} size={26} />
          </TouchableOpacity>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // 🔥 สำคัญ
  },

  circle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    width: 100,
    height: 100,
  },

  text: {
    marginTop: 6,
    fontSize: 15,
  },

  icon: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#abb9a7ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});
