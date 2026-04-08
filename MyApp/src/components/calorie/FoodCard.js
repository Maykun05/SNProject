/*
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FoodCard({ result }) {
  if (!result) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🍽️ {result.อาหาร}</Text>

      <Text style={styles.cal}>
        🔥 {result.แคลอรี่} kcal
      </Text>

      <View style={styles.nutritionRow}>
        <Text>🍚 คาร์บ: {result.คาร์บ ?? '-'} g</Text>
        <Text>💪 โปรตีน: {result.โปรตีน ?? '-'} g</Text>
        <Text>🥑 ไขมัน: {result.ไขมัน ?? '-'} g</Text>
      </View>

      {result.ความคิดเห็น && (
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>💡 {result.ความคิดเห็น}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#F5FDF9',
    borderWidth: 1,
    borderColor: '#CDE8DB',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cal: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  nutritionRow: {
    gap: 4,
    marginBottom: 10,
  },
  tipBox: {
    backgroundColor: '#E6F7F4',
    padding: 10,
    borderRadius: 10,
  },
  tipText: {
    fontSize: 13,
    color: '#2E7D32',
  },
});
*/
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function FoodCard({ result, onAdd }) {
  if (!result) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{result.name}</Text>
      <Text style={styles.cal}>{result.calories} kcal</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => onAdd(result.calories)}
        >
          <Text style={styles.btnText}>เพิ่มไปวันนี้</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton}>
          <Text style={styles.btnText}>ไม่เพิ่ม</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
  },

  cal: {
    marginTop: 5,
    fontSize: 16,
    color: "#555",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 15,
  },

  addButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },

  skipButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },

  btnText: {
    color: "white",
    fontWeight: "bold",
  },
});