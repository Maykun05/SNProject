import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const moods = [
  { id: '1', label: '😊 Happy', color: '#FFD700' },
  { id: '2', label: '😢 Sad', color: '#87CEFA' },
  { id: '3', label: '😠 Angry', color: '#FF6347' },
  { id: '4', label: '😌 Calm', color: '#98FB98' },
  { id: '5', label: '😕 Confused', color: '#DDA0DD' },
];

export default function MoodScreen() {
    console.log('MoodScreen loaded');

  const [selectedMood, setSelectedMood] = useState(null);

  const handleSelectMood = (mood) => {
    setSelectedMood(mood);
  };

  return (
    
    <View style={styles.container}>
      <Text style={styles.title}>วันนี้คุณรู้สึกยังไง?</Text>
      <FlatList
        data={moods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.moodButton,
              { backgroundColor: item.color },
              selectedMood?.id === item.id && styles.selected,
            ]}
            onPress={() => handleSelectMood(item)}
          >
            <Text style={styles.moodText}>{item.label}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
      {selectedMood && (
        <Text style={styles.feedback}>
          คุณเลือก: <Text style={{ fontWeight: 'bold' }}>{selectedMood.label}</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    alignItems: 'center',
  },
  moodButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginVertical: 8,
    width: '80%',
  },
  moodText: {
    fontSize: 18,
    textAlign: 'center',
  },
  selected: {
    borderWidth: 2,
    borderColor: '#333',
  },
  feedback: {
    marginTop: 24,
    fontSize: 18,
    textAlign: 'center',
  },
});