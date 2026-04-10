import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const GREEN = '#1E4D2B';

const ProfileHealthRow = ({ weight, height, bmi, age, onPressWeight, onPressHeight, onPressAge }) => {
  const items = [
    { label: 'น้ำหนัก', value: weight ? `${String(weight)} kg` : '-', icon: 'scale-bathroom', onPress: onPressWeight, editable: true },
    { label: 'ส่วนสูง', value: height ? `${String(height)} cm` : '-', icon: 'human-male-height', onPress: onPressHeight, editable: true },
    { label: 'BMI', value: bmi, icon: 'heart-pulse', editable: false },
    { label: 'อายุ', value: age ? `${String(age)} ปี` : '-', icon: 'calendar-account', onPress: onPressAge, editable: true },
  ];

  return (
    <View style={styles.healthRow}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={styles.healthCard}
          disabled={!item.editable}
          onPress={item.onPress}
        >
          <MaterialCommunityIcons name={item.icon} size={18} color={GREEN} />
          <Text style={styles.healthLabel}>{item.label}</Text>
          <Text style={styles.healthValue}>{item.value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  healthRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 8,
  },
  healthCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  healthLabel: { fontSize: 9, color: '#999', textAlign: 'center' },
  healthValue: { fontSize: 12, fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
});

export default ProfileHealthRow;
