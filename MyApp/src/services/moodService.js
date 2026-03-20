const API_URL = "http://192.168.1.48:3000";

/* =========================
   GET ALL (calendar)
========================= */
export const getAllMoods = async (month, year, token) => {
  const res = await fetch(
    `${API_URL}/mood/month?month=${month}&year=${year}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch moods");

  const data = await res.json();

  // 🔥 แปลง array → object เหมือน AsyncStorage
  const mapped = {};
  data.forEach((item) => {
    const dateKey = item.date.split("T")[0];
    mapped[dateKey] = item.mood;
  });

  return mapped;
};

export const getMoodByDate = async (dateKey) => {
  const res = await fetch(`${API_URL}/api/mood/today`);
  const data = await res.json();

  return data?.mood || null;
};

export const setMoodByDate = async (dateKey, mood) => {
  console.log("CALL API:", dateKey, mood); // debug

  const res = await fetch(`${API_URL}/api/mood`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mood,
      date: dateKey,
    }),
  });

  const data = await res.json();
  console.log("RESPONSE:", data);

  return data;
};