const API_URL = "http://localhost:3000";

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

export const getMoodByDate = async (dateKey, token) => {
  const res = await fetch(`${API_URL}/mood/today`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch mood");

  const data = await res.json();

  return data?.mood || null;
};

export const setMoodByDate = async (dateKey, mood, token) => {
  const res = await fetch(`${API_URL}/mood`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      mood,
      date: dateKey,
    }),
  });

  if (!res.ok) throw new Error("Failed to set mood");

  return await res.json();
};
