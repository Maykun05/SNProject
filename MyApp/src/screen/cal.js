// hybrid
import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Keyboard,
  Alert
} from "react-native";

import ProgressRing from "../components/ProgressRing";
import { Ionicons } from "@expo/vector-icons";
import { sendToAI } from "../utils/openaiUtils";
import { API_URL } from "../config";
import { AuthContext } from "../context/AuthProvider";
import { useNavigation } from "@react-navigation/native";

export default function CalScreen() {

  const recommendedCal = 2100;

  const [foods, setFoods] = useState([]);
  const [text, setText] = useState("");
  const [previewFood, setPreviewFood] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userToken } = useContext(AuthContext);
  const consumedCal = foods.reduce((sum, f) => sum + f.calories, 0);

  const remaining = recommendedCal - consumedCal;
   const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      onDone: () => {
        // ✅ ทำงานที่ต้องการ เช่น markDone
        console.log('Calorie done!');
        // ถ้าอยากเรียก markDone จาก context/hook ก็ทำตรงนี้
      },
    });
  }, [navigation]);

  /* ===== search with AI ===== */

  const searchFood = async () => {

    if (!text.trim()) return;

    Keyboard.dismiss();

    setLoading(true);

    try {

      const res = await sendToAI(text);

      if (!res) {
        Alert.alert("ไม่พบเมนูอาหารนี้");
        setLoading(false);
        return;
      }

      setPreviewFood({
        name: res.name,
        calories: res.calories,
        protein: res.protein,
        carbs: res.carbs,
        fat: res.fat
      });

      setText("");

    } catch (err) {

      Alert.alert("ไม่สามารถวิเคราะห์อาหารได้");

    }

    setLoading(false);
  };

  const addFood = async () => {
    try {
      const res = await fetch(`${API_URL}/api/food`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}` 
        },
        body: JSON.stringify(previewFood)
      });
      const newFood = await res.json();
      setFoods(prev => [newFood, ...prev]);
      setPreviewFood(null);
    } catch (err) {
      Alert.alert("บันทึกอาหารไม่สำเร็จ");
    }
  };

  const getFoodsToday = async () => {
    try {
      const res = await fetch(`${API_URL}/api/food/today`, {
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      });
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      Alert.alert("โหลดรายการอาหารไม่สำเร็จ");
    }
  };

  useEffect(() => {
    getFoodsToday();
  }, []);

  const deleteFood = async (item) => {
    try {
      await fetch(`${API_URL}/api/food/${item.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      });
      setFoods(prev => prev.filter(f => f.id !== item.id));
    } catch (err) {
      Alert.alert("ลบอาหารไม่สำเร็จ");
    }
  };
  /* ===== render list ===== */

  const renderItem = ({ item }) => (

    <View style={styles.foodItem}>

      <View>
        <Text style={styles.foodName}>
          {item.name}
        </Text>

        <Text style={styles.foodCal}>
          {item.calories} kcal
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => deleteFood(item)}
      >
        <Ionicons
          name="trash-outline"
          size={22}
          color="#D32F2F"
        />
      </TouchableOpacity>

    </View>
  );

  return (
    <View style={styles.container}>

      {/* progress card */}

      <View style={styles.progressCard}>

        <Text style={styles.label}>
          ปริมาณแคลลอรี่ที่แนะนำ
        </Text>

        <Text style={styles.recommend}>
          {recommendedCal} kcal
        </Text>

        <ProgressRing
          consumed={consumedCal}
          recommended={recommendedCal}
        />

      </View>

      {/* search */}

      <View style={styles.searchRow}>

        <Ionicons
          name="search"
          size={20}
          color="#777"
        />

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="ค้นหาอาหาร"
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={searchFood}
        />

        <TouchableOpacity
          style={styles.searchBtn}
          onPress={searchFood}
        >
          <Text style={{ color: "#fff" }}>
            {loading ? "..." : "ค้นหา"}
          </Text>
        </TouchableOpacity>

      </View>

      {/* preview */}

      {previewFood && (

        <View style={styles.previewCard}>

          <Text style={styles.previewTitle}>
            ผลการค้นหา
          </Text>

          <Text style={styles.foodName}>
            {previewFood.name}
          </Text>

          <Text style={styles.foodCal}>
            {previewFood.calories} kcal
          </Text>

          {/* macro */}

          {previewFood.protein && (
            <Text style={styles.macro}>
              Protein {previewFood.protein}g  |  
              Carb {previewFood.carbs}g  |  
              Fat {previewFood.fat}g
            </Text>
          )}

          <View style={styles.previewBtns}>

            <TouchableOpacity
              style={styles.addBtn}
              onPress={addFood}
            >
              <Text style={styles.btnText}>
                เลือก
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() =>
                setPreviewFood(null)
              }
            >
              <Text>Cancel</Text>
            </TouchableOpacity>

          </View>

        </View>
      )}

      {/* today food */}

      <Text style={styles.sectionTitle}>
        รายการอาหาร
      </Text>

      <FlatList
        data={foods}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F7F7F7",
  },

  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },

  label: {
    fontSize: 14,
    color: "#777",
  },

  recommend: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },

  remaining: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 45,
    marginBottom: 20
  },

  input: {
    flex: 1,
    marginLeft: 8,
  },

  searchBtn: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6
  },

  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20
  },

  previewTitle: {
    fontSize: 13,
    color: "#777",
    marginBottom: 6
  },

  previewBtns: {
    flexDirection: "row",
    marginTop: 15,
  },

  addBtn: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },

  cancelBtn: {
    backgroundColor: "#EEE",
    padding: 10,
    borderRadius: 8,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#444"
  },

  foodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },

  foodName: {
    fontSize: 16,
  },

  foodCal: {
    fontWeight: "bold",
    color: "#444",
  },

  macro: {
    marginTop: 6,
    color: "#777",
    fontSize: 13
  }

});