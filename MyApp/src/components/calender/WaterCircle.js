import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GOAL = 2000;

export default function WaterCircle({ value }) {
  const percent = Math.min(value / GOAL, 1);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.fill,
          { height: `${percent * 100}%` },
        ]}
      />
      {value > 0 && (
        <Text style={styles.text}>
          {(value / 1000).toFixed(1)}L
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#4FC3F7',
  },
  text: {
    fontSize: 10,
    zIndex: 1,
  },
});