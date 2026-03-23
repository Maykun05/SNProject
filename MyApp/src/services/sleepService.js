import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

export async function saveSleepToDB(hours) {
  const token = await AsyncStorage.getItem("token");
  const response = await fetch(`${API_URL}/api/sleep`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ hours }),
  });

  if (!response.ok) {
    throw new Error("Failed to save sleep record");
  }

  return await response.json();
}

export async function getLatestSleep() {
  const token = await AsyncStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/sleep`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch sleep data");
  const data = await res.json();
  return data[0]; // สมมติ API คืน array เรียงจากล่าสุด
}
