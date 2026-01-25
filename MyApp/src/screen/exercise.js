import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

/* ===== utils ===== */
const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const STORAGE_KEY = `exercise_goals_`;

/* ===== main screen ===== */
export default function ExerciseScreen() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');

  const today = todayKey();

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    saveGoals();
  }, [goals]);

  const loadGoals = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY + today);
    if (saved) {
      setGoals(JSON.parse(saved));
    }
  };

  const saveGoals = async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY + today,
      JSON.stringify(goals)
    );
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals(prev => [
      ...prev,
      { id: Date.now().toString(), text: newGoal, done: false },
    ]);
    setNewGoal('');
  };

  const toggleGoal = id => {
    setGoals(prev =>
      prev.map(g =>
        g.id === id ? { ...g, done: !g.done } : g
      )
    );
  };

  /* ===== progress ===== */
  const total = goals.length;
  const doneCount = goals.filter(g => g.done).length;
  const progress = total === 0 ? 0 : doneCount / total;

  return (
    <View style={styles.container}>
      {/* ===== Progress Ring ===== */}
      <View style={styles.ringWrapper}>
        <ProgressRing progress={progress} />
        <Text style={styles.ringText}>เป้าหมาย</Text>
      </View>

      {/* ===== Add Goal ===== */}
      <View style={styles.addRow}>
        <TextInput
          value={newGoal}
          onChangeText={setNewGoal}
          placeholder="เช่น วิ่ง 20 นาที"
          style={styles.input}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addGoal}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ===== Goals List ===== */}
      <FlatList
        data={goals}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.goalItem,
              item.done && styles.goalDone,
            ]}
            onPress={() => toggleGoal(item.id)}
          >
            <Text
              style={[
                styles.goalText,
                item.done && styles.goalTextDone,
              ]}
            >
              {item.text}
            </Text>
            {item.done && (
              <Ionicons name="checkmark-circle" size={22} color="#2E7D5B" />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

/* ===== Progress Ring Component ===== */
function ProgressRing({ progress }) {
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <Svg width={size} height={size}>
      {/* background */}
      <Circle
        stroke="#E0E0E0"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* progress */}
      <Circle
        stroke="#4CAF50"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },

  ringWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },

  ringText: {
    position: 'absolute',
    top: '45%',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D5B',
  },

  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  input: {
    flex: 1,
    backgroundColor: '#EEE',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 44,
  },

  addBtn: {
    marginLeft: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },

  goalItem: {
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  goalDone: {
    backgroundColor: '#DFF3E6',
  },

  goalText: {
    fontSize: 16,
  },

  goalTextDone: {
    textDecorationLine: 'line-through',
    color: '#2E7D5B',
  },
});
