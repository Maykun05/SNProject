import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { API_URL } from '../config';

export default function useFeatures() {
  const { userToken } = useContext(AuthContext);

  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== LOAD ===== */
  const loadFeatures = async () => {
    try {
      const res = await fetch(`${API_URL}/api/features/ids`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const data = await res.json();
      setSelectedFeatures(data);

    } catch (err) {
      console.log("LOAD FEATURES ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  /* ===== TOGGLE ===== */
  const toggleFeature = (id) => {
    if (selectedFeatures.includes(id)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== id));
    } else {
      setSelectedFeatures([...selectedFeatures, id]);
    }
  };

  /* ===== SAVE ===== */
  const saveFeatures = async () => {
    try {
        const res = await fetch(`${API_URL}/api/features`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
            features: selectedFeatures,
        }),
        });

        await loadFeatures();
    } catch (err) {
      console.log("SAVE FEATURES ERROR:", err);
    }
  };

  return {
    selectedFeatures,
    setSelectedFeatures,
    toggleFeature,
    saveFeatures,
    loading,
    reload: loadFeatures, // 👈 เผื่อใช้
  };
}