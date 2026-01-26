import React, { useEffect, useState } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,FlatList,TextInput,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

/* ======================
   utils
====================== */

const todayKey = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const STORAGE_KEY = 'exercise_goals_';

/* ======================
   screen
====================== */

export default function ExerciseScreen() {
  const [goals, setGoals] = useState([]);
  const [text, setText] = useState('');

  const today = todayKey();

  /* ===== load / save ===== */

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

  /* ===== actions ===== */

  const addGoal = () => {
    if (!text.trim()) return;
    setGoals(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        done: false,
      },
    ]);
    setText('');
  };

  const toggleGoal = id => {
    setGoals(prev =>
      prev.map(g =>
        g.id === id ? { ...g, done: !g.done } : g
      )
    );
  };

  const deleteGoal = id => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  /* ===== progress ===== */

  const total = goals.length;
  const doneCount = goals.filter(g => g.done).length;
  const progress = total === 0 ? 0 : doneCount / total;

  /* ===== render goal ===== */

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.goalItem,
        item.done && styles.goalDone,
      ]}
    >
      <Text
        style={[
          styles.goalText,
          item.done && styles.goalTextDone,
        ]}
      >
        {item.text}
      </Text>

      <View style={styles.actionRow}>
        {/* tick */}
        <TouchableOpacity
          onPress={() => toggleGoal(item.id)}
          style={styles.iconBtn}
        >
          <Ionicons
            name={
              item.done
                ? 'checkmark-circle'
                : 'ellipse-outline'
            }
            size={22}
            color={item.done ? '#2E7D5B' : '#999'}
          />
        </TouchableOpacity>

        {/* delete */}
        <TouchableOpacity
          onPress={() => deleteGoal(item.id)}
          style={styles.iconBtn}
        >
          <Ionicons
            name="trash-outline"
            size={22}
            color="#D32F2F"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ===== progress ring ===== */}
      <View style={styles.ringWrapper}>
        <ProgressRing progress={progress} />
        <Text style={styles.ringText}>
          {doneCount}/{total || 0}
        </Text>
      </View>

      {/* ===== add goal ===== */}
      <View style={styles.addRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="เช่น วิ่ง 20 นาที"
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.addBtn}
          onPress={addGoal}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ===== list ===== */}
      <FlatList
        data={goals}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

/* ======================
   progress ring
====================== */

function ProgressRing({ progress }) {
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <Svg width={size} height={size}>
      <Circle
        stroke="#E0E0E0"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        stroke="#4CAF50"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={
          circumference * (1 - progress)
        }
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

/* ======================
   styles
====================== */

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
    flex: 1,
  },

  goalTextDone: {
    textDecorationLine: 'line-through',
    color: '#2E7D5B',
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBtn: {
    marginLeft: 10,
  },
});
