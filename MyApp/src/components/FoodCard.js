// components/FoodCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FoodCard({ result }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>🍽️ คุณกิน: {result.อาหาร}</Text>
      <Text>🔥 แคลอรี่: {result.แคลอรี่} kcal</Text>
      {result.โปรตีน && <Text>💪 โปรตีน: {result.โปรตีน} g</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});