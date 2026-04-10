import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { AuthContext } from './AuthProvider';
import { ProfileContext } from './ProfileContext';
import { API_URL } from '../config';

const LevelContext = createContext();

const LEVEL_NAMES = [
  { min: 1, max: 3, emoji: '🌱', name: 'นักสำรวจมือใหม่', color: '#81C784' },
  { min: 4, max: 7, emoji: '🚶', name: 'ผู้เริ่มต้นสุขภาพ', color: '#4FC3F7' },
  { min: 8, max: 12, emoji: '💪', name: 'นักสะสมสุขภาพ', color: '#FFB74D' },
  { min: 13, max: 18, emoji: '🏃', name: 'นักวิ่งชีวิต', color: '#F06292' },
  { min: 19, max: 25, emoji: '⚡', name: 'ผู้เชี่ยวชาญสุขภาพ', color: '#BA68C8' },
  { min: 26, max: 35, emoji: '🔥', name: 'นักรบสุขภาพ', color: '#FF7043' },
  { min: 36, max: 50, emoji: '🌟', name: 'ผู้พิชิตร่างกาย', color: '#FFD700' },
  { min: 51, max: 75, emoji: '👑', name: 'เจ้าแห่งสุขภาพ', color: '#00BCD4' },
  { min: 76, max: 99, emoji: '🏆', name: 'ตำนานสุขภาพ', color: '#FF6F00' },
  { min: 100, max: 999, emoji: '✨', name: 'เทพสุขภาพ', color: '#E91E63' },
];

export const xpForLevel = (lvl) => Math.floor(100 * Math.pow(1.3, lvl - 1));

export const getLevelInfo = (lvl) => {
  const info =
    LEVEL_NAMES.find((l) => lvl >= l.min && lvl <= l.max) ?? LEVEL_NAMES[LEVEL_NAMES.length - 1];
  return { ...info, displayName: `${info.emoji} ${info.name}` };
};

export const XP_REWARDS = {
  dailyMission: 30,
  stepGoal: 40,
  waterGoal: 30,
  /** XP เมื่อทำฟีเจอร์บนโฮมครบเงื่อนไข (น้ำ / อาหาร / ออกกำลัง / นอน / อารมณ์) — ต้องสอดคล้องกับ useHomeState */
  homeFeatureComplete: 10,
  logCalorie: 20,
  logWeight: 15,
  weeklyMission: 80,
  monthlyMission: 150,
};

export const HOME_FEATURE_XP = XP_REWARDS.homeFeatureComplete;

export const LevelProvider = ({ children }) => {
  const { userToken, userId } = useContext(AuthContext);
  const { profile, loading: profileLoading, refreshProfile } = useContext(ProfileContext);

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [totalXp, setTotalXp] = useState(0);

  const levelRef = useRef(1);
  /** หลบฟังก์ชันออกจาก navigation params (serialize ได้) */
  const homeFeatureGoalHandlerRef = useRef(null);
  const stepSessionSavedHandlerRef = useRef(null);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  const registerHomeFeatureGoalHandler = useCallback((handler) => {
    homeFeatureGoalHandlerRef.current = handler;
    return () => {
      if (homeFeatureGoalHandlerRef.current === handler) {
        homeFeatureGoalHandlerRef.current = null;
      }
    };
  }, []);

  const notifyHomeFeatureGoalMet = useCallback(async (key) => {
    const h = homeFeatureGoalHandlerRef.current;
    if (h) await h(key);
  }, []);

  const setStepSessionSavedHandler = useCallback((handler) => {
    stepSessionSavedHandlerRef.current = handler;
  }, []);

  const notifyStepSessionSaved = useCallback((session) => {
    const h = stepSessionSavedHandlerRef.current;
    if (h) h(session);
    stepSessionSavedHandlerRef.current = null;
  }, []);

  useEffect(() => {
    if (!userToken || !userId) {
      setXp(0);
      setLevel(1);
      setTotalXp(0);
      levelRef.current = 1;
      homeFeatureGoalHandlerRef.current = null;
      stepSessionSavedHandlerRef.current = null;
      return;
    }
    if (profileLoading) return;
    if (profile?.id == null || String(profile.id) !== String(userId)) return;

    setXp(profile.xp ?? 0);
    setLevel(profile.level ?? 1);
    setTotalXp(profile.totalXp ?? 0);
    levelRef.current = profile.level ?? 1;
  }, [
    userToken,
    userId,
    profileLoading,
    profile?.id,
    profile?.xp,
    profile?.level,
    profile?.totalXp,
  ]);

  const addXp = useCallback(
    async (amount, onLevelUp) => {
      if (!userToken) return;
      const prevLevel = levelRef.current;
      try {
        const res = await fetch(`${API_URL}/api/user/xp/apply`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.message || 'xp apply failed');
        }
        const { xp: nx, level: nl, totalXp: nt } = json.data;
        setXp(nx);
        setLevel(nl);
        setTotalXp(nt);
        levelRef.current = nl;
        if (nl > prevLevel && onLevelUp) {
          setTimeout(() => onLevelUp(nl), 100);
        }
        await refreshProfile();
      } catch (e) {
        console.error('addXp error:', e);
      }
    },
    [userToken, refreshProfile]
  );

  const xpRequired = xpForLevel(level);
  const xpPercent =
    level > 0 && xpRequired > 0 ? Math.min(Math.round((xp / xpRequired) * 100), 100) : 0;
  const levelInfo = getLevelInfo(level);

  return (
    <LevelContext.Provider
      value={{
        xp,
        level,
        totalXp,
        xpRequired,
        xpPercent,
        levelInfo,
        addXp,
        registerHomeFeatureGoalHandler,
        notifyHomeFeatureGoalMet,
        setStepSessionSavedHandler,
        notifyStepSessionSaved,
      }}
    >
      {children}
    </LevelContext.Provider>
  );
};

export const useLevel = () => useContext(LevelContext);
