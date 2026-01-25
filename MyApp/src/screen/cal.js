// screens/CalScreen.js
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Voice from '@react-native-voice/voice';
import { sendToAI } from '../utils/openaiUtils';
import FoodCard from '../components/FoodCard';

export default function CalScreen() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

  const handleVoice = () => {
    Voice.onSpeechResults = (event) => {
      const spoken = event.value[0];
      setText(spoken);
      sendToAI(spoken).then(setResult);
    };
    Voice.start('th-TH');
  };

  const handleSubmit = () => {
    sendToAI(text).then(setResult);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="พิมพ์หรือพูดว่า 'กินอะไร'"
          onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity onPress={handleVoice} style={styles.micButton}>
          <Text style={{ fontSize: 18 }}>🎤</Text>
        </TouchableOpacity>
      </View>

      {result && <FoodCard result={result} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: { flex: 1, height: 40 },
  micButton: { padding: 8 },
});