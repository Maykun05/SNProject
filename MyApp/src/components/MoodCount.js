import React from 'react';
import { View, Text, StyleSheet,Image } from 'react-native';
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
        {MOODS.map(({ key, image }) => (
          <View key={key} style={styles.item}>
            <Image source={image} style={styles.icon} />
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
  icon: { 
    width: 32, 
    height: 32, 
    resizeMode: 'contain' 
  },
  number: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
  },
});
