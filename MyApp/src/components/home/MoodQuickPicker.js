import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MOODS } from '../../constants/moods';

export default function MoodQuickPicker({ visible, onSelect }) {
  if (!visible) return null;

  return (
    <View style={styles.bar}>
      {Object.entries(MOODS).map(([key, emoji]) => (
        <TouchableOpacity key={key} onPress={() => onSelect(key)}>
          <Text style={styles.emoji}>{emoji}</Text>
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
  emoji: { fontSize: 28 },
});
