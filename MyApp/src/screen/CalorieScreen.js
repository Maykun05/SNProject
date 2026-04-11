// hybrid
import React, { useState, useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CalProgressRing from "../components/calorie/calProgressRing";
import CalorieGoalModal from "../components/calorie/CalorieGoalModal";
import { Ionicons } from "@expo/vector-icons";
import { sendToAI } from "../utils/openaiUtils";
import { fetchFoodToday, createFood, deleteFood } from "../services/foodService";
import { putProfileCalorieGoal } from "../services/profileApi";
import { AuthContext } from "../context/AuthProvider";
import { useProfile } from "../context/ProfileContext";
import { useGarden } from "../context/GardenContext";
import { useLevel } from "../context/LevelContext";
import StackScreenBackButton from "../components/StackScreenBackButton";

/** โทนเดียวกับการ์ดแคลอรี่ใน homepage.js */
const CAL = {
  main: "#B85C14",
  soft: "#FDF6EF",
  border: "rgba(30, 77, 43, 0.12)",
  accent: "#D9781C",
  track: "rgba(184, 92, 20, 0.12)",
  ink: "#5A3E26",
  muted: "#8D6E63",
  searchBorder: "rgba(184, 92, 20, 0.35)",
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CAL.soft },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 28 },
  loading: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  loadingTxt: { fontSize: 14, color: "#546E7A" },
  ringCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 14,
    marginTop: 105,
    marginBottom: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: CAL.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  searchWrap: { marginBottom: 16 },
  searchLabel: { fontSize: 13, fontWeight: "700", color: "#78909C", marginBottom: 10 },
  /** โครงสร้างเดียวกับ WaterQuickPick: กรอบเฉพาะช่องพิมพ์ + ปุ่มข้างนอก */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: CAL.searchBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 18,
    fontWeight: "700",
    color: CAL.main,
  },
  searchBtn: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: CAL.accent,
  },
  searchBtnText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
  previewCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CAL.border,
  },
  previewTitle: { fontSize: 13, fontWeight: "700", color: "#78909C", marginBottom: 8 },
  previewBtns: { flexDirection: "row", marginTop: 14, gap: 10 },
  addBtn: {
    flex: 1,
    backgroundColor: CAL.accent,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(184, 92, 20, 0.1)",
    justifyContent: "center",
  },
  btnText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  cancelBtnText: { color: CAL.main, fontWeight: "700", fontSize: 15 },
  logs: { marginTop: 8 },
  logHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  logTitle: { fontSize: 17, fontWeight: "800", color: CAL.ink },
  logSum: { fontSize: 14, color: CAL.muted, fontWeight: "600" },
  empty: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: CAL.border,
  },
  emptyTxt: { fontSize: 14, color: "#78909C", textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: CAL.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: CAL.accent, marginRight: 12 },
  foodMain: { flex: 1 },
  foodName: { fontSize: 15, fontWeight: "700", color: CAL.ink },
  foodCal: { fontSize: 13, fontWeight: "600", color: CAL.main, marginTop: 2 },
  macro: { marginTop: 8, color: "#78909C", fontSize: 13 },
  delBtn: { padding: 8, marginLeft: 4 },
});

function Empty({ icon, text }) {
  return (
    <View style={s.empty}>
      <Ionicons name={icon} size={32} color="#90A4AE" />
      <Text style={s.emptyTxt}>{text}</Text>
    </View>
  );
}

export default function FoodScreen({ route }) {
  const fromHomeFeature = route?.params?.fromHomeFeature === true;
  const { notifyHomeFeatureGoalMet } = useLevel();
  const [foods, setFoods] = useState([]);
  const [text, setText] = useState("");
  const [previewFood, setPreviewFood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const { userToken } = useContext(AuthContext);
  const { profile, updateProfile } = useProfile();
  const { logFeature } = useGarden();
  const [showCalorieModal, setShowCalorieModal] = useState(false);
  const foodGoalDoneLogged = useRef(false);

  const consumedCal = foods.reduce((sum, f) => sum + f.calories, 0);

  const getActivityFactor = (level) => {
    switch (level) {
      case 0:
        return 1.2;
      case 1:
        return 1.375;
      case 2:
        return 1.55;
      case 3:
        return 1.725;
      case 4:
        return 1.9;
      default:
        return 1.2;
    }
  };

  const getAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  /** คำนวณจากโปรไฟล์ (ข้อมูลเดียวกับ ProfileContext -> DB ผ่าน /api/user/profile) */
  const calculateCalories = (p) => {
    if (!p) return 2000;
    const weight = p.weight != null && p.weight !== "" ? Number(p.weight) : NaN;
    const height = p.height != null && p.height !== "" ? Number(p.height) : NaN;
    const { birthDate, gender, activityLevel } = p;
    if (!Number.isFinite(weight) || weight <= 0) return 2000;
    if (!Number.isFinite(height) || height <= 0) return 2000;
    if (!birthDate || !gender) return 2000;
    const age = getAge(birthDate);
    const factor = getActivityFactor(
      activityLevel != null && activityLevel !== "" ? Number(activityLevel) : null
    );
    let bmr;
    if (gender === "MALE") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    return Math.round(bmr * factor);
  };

  const autoCal = calculateCalories(profile);
  const customGoal =
    profile.calorieGoal != null && profile.calorieGoal !== ""
      ? Number(profile.calorieGoal)
      : null;
  const hasValidCustomGoal =
    customGoal != null && Number.isFinite(customGoal) && customGoal > 0;
  const recommendedCal = userToken
    ? hasValidCustomGoal
      ? customGoal
      : autoCal
    : 2000;

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
        fat: res.fat,
      });
      setText("");
    } catch (err) {
      Alert.alert("ไม่สามารถวิเคราะห์อาหารได้");
    }
    setLoading(false);
  };

  const addFood = async () => {
    try {
      const newFood = await createFood(userToken, previewFood);
      setFoods((prev) => [newFood, ...prev]);
      setPreviewFood(null);
    } catch (err) {
      Alert.alert("บันทึกอาหารไม่สำเร็จ");
    }
  };

  const getFoodsToday = async () => {
    if (!userToken) {
      setFoods([]);
      setListLoading(false);
      return;
    }
    setListLoading(true);
    try {
      const data = await fetchFoodToday(userToken);
      setFoods(data);
    } catch (err) {
      Alert.alert("โหลดรายการอาหารไม่สำเร็จ");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    getFoodsToday();
  }, [userToken]);

  useEffect(() => {
    if (consumedCal < recommendedCal) foodGoalDoneLogged.current = false;
  }, [consumedCal, recommendedCal]);

  useEffect(() => {
    if (!userToken || listLoading || recommendedCal <= 0) return;
    if (consumedCal < recommendedCal) return;
    if (foodGoalDoneLogged.current) return;
    foodGoalDoneLogged.current = true;
    logFeature("food").catch((err) => {
      console.error("logFeature food:", err);
      foodGoalDoneLogged.current = false;
    });
    if (fromHomeFeature) notifyHomeFeatureGoalMet("food");
  }, [userToken, listLoading, consumedCal, recommendedCal, logFeature, fromHomeFeature, notifyHomeFeatureGoalMet]);

  const deleteFoodItem = async (item) => {
    try {
      await deleteFood(userToken, item.id);
      setFoods((prev) => prev.filter((f) => f.id !== item.id));
    } catch (err) {
      Alert.alert("ลบอาหารไม่สำเร็จ");
    }
  };

  const handleSaveCalorieGoal = async (parsed) => {
    await putProfileCalorieGoal(userToken, parsed);
    updateProfile({ calorieGoal: parsed });
  };

  const handleUseFormulaCalorieGoal = async () => {
    await putProfileCalorieGoal(userToken, null);
    updateProfile({ calorieGoal: null });
  };

  return (
    <SafeAreaView style={s.safe} edges={["bottom"]}>
      <StackScreenBackButton tintColor={CAL.main} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {listLoading ? (
          <View style={s.loading}>
            <ActivityIndicator color={CAL.main} />
            <Text style={s.loadingTxt}>กำลังโหลด…</Text>
          </View>
        ) : null}

        <View style={s.ringCard}>
          <CalProgressRing
            consumed={consumedCal}
            recommended={recommendedCal}
            accentColor={CAL.accent}
            trackColor={CAL.track}
            themeColor={CAL.main}
            recommendedDaily={userToken ? autoCal : undefined}
            onEditGoal={userToken ? () => setShowCalorieModal(true) : undefined}
          />
        </View>

        <View style={s.searchWrap}>
          <Text style={s.searchLabel}>ค้นหาอาหาร</Text>
          <View style={s.searchRow}>
            <View style={s.searchField}>
              <Ionicons name="search" size={20} color="#78909C" />
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="พิมพ์ชื่อเมนูหรืออาหาร"
                placeholderTextColor="#B0BEC5"
                style={s.input}
                returnKeyType="search"
                onSubmitEditing={searchFood}
              />
            </View>
            <TouchableOpacity style={s.searchBtn} onPress={searchFood} activeOpacity={0.9}>
              <Text style={s.searchBtnText}>{loading ? "…" : "ค้นหา"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {previewFood ? (
          <View style={s.previewCard}>
            <Text style={s.previewTitle}>ผลการค้นหา</Text>
            <Text style={s.foodName}>{previewFood.name}</Text>
            <Text style={s.foodCal}>{previewFood.calories} กิโลแคลอรี่</Text>
            {previewFood.protein !== undefined && previewFood.protein !== null ? (
              <Text style={s.macro}>
                Protein {previewFood.protein}g · Carb {previewFood.carbs}g · Fat {previewFood.fat}g
              </Text>
            ) : null}
            <View style={s.previewBtns}>
              <TouchableOpacity style={s.addBtn} onPress={addFood} activeOpacity={0.9}>
                <Text style={s.btnText}>บันทึก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => setPreviewFood(null)}
                activeOpacity={0.85}
              >
                <Text style={s.cancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <View style={s.logs}>
          <View style={s.logHead}>
            <Text style={s.logTitle}>วันนี้</Text>
            <Text style={s.logSum}>{consumedCal} กิโลแคลอรี่</Text>
          </View>
          {!userToken ? (
            <Empty icon="cloud-offline-outline" text="ล็อกอินเพื่อบันทึกมื้ออาหาร" />
          ) : foods.length === 0 ? (
            <Empty icon="restaurant-outline" text="ยังไม่มีรายการ — ค้นหาและบันทึกเมนูด้านบน" />
          ) : (
            foods.map((item) => (
              <View key={item.id} style={s.row}>
                <View style={s.dot} />
                <View style={s.foodMain}>
                  <Text style={s.foodName}>{item.name}</Text>
                  <Text style={s.foodCal}>{item.calories} กิโลแคลอรี่</Text>
                </View>
                <TouchableOpacity
                  style={s.delBtn}
                  onPress={() => deleteFoodItem(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="ลบรายการ"
                >
                  <Ionicons name="trash-outline" size={20} color="#C62828" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <CalorieGoalModal
        visible={showCalorieModal}
        onClose={() => setShowCalorieModal(false)}
        recommendedDaily={autoCal}
        calorieGoal={recommendedCal}
        onSave={handleSaveCalorieGoal}
        onUseRecommended={handleUseFormulaCalorieGoal}
        hasCustomGoal={hasValidCustomGoal}
      />
    </SafeAreaView>
  );
}
