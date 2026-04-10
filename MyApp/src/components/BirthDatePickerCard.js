import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const BirthDatePickerCard = ({
  label = 'วันเกิด',
  textValue,
  isPlaceholder = false,
  selectedDate,
  isOpen,
  onToggle,
  onChangeDate,
  accentColor = '#2D4F45',
}) => {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.inputBox} onPress={onToggle}>
        <Text style={{ color: isPlaceholder ? '#999' : '#333' }}>{textValue}</Text>
        <Ionicons name="calendar-outline" size={20} color={accentColor} />
      </TouchableOpacity>

      {Boolean(isOpen) && (
        <View style={styles.datePickerWrapper}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            maximumDate={new Date()}
            themeVariant="light"
            accentColor={accentColor}
            locale={Platform.OS === 'ios' ? 'th-TH' : undefined}
            onChange={(_, date) => {
              if (date) onChangeDate(date);
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: 'bold', color: '#2D4F45', marginTop: 15, marginBottom: 8 },
  inputBox: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerWrapper: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});

export default BirthDatePickerCard;
