import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MOODS } from '../constants/moods';

export default function MoodCount({ moods }) {
  const count = Object.values(moods).reduce((acc, mood) => {
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Mood Count</Text>

      <View style={styles.row}>
        {Object.keys(MOODS).map(key => (
          <View key={key} style={styles.item}>
            <Text style={styles.emoji}>{MOODS[key]}</Text>
            <Text style={styles.number}>
              {count[key] || 0}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F8F8F8',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  number: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
  },
});
