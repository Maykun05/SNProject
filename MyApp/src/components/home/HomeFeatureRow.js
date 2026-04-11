import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'react-native';

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
            <Image source={f.image} style={{ width: 26, height: 26 }} />
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
    width: '100%',          // แนะนำให้ใส่
    marginTop: 5,
    paddingHorizontal: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
