import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const CHANNEL_ID = 'exercise-session-complete';

let handlerRegistered = false;
let androidChannelReady = false;

/** เรียกครั้งเดียวตอนเปิดแอป — ให้โชว์แบนเนอร์ตอนแอปอยู่เบื้องหน้า */
export function registerLocalNotificationHandler() {
  if (handlerRegistered) return;
  handlerRegistered = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android' || androidChannelReady) return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'การออกกำลังกาย',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 100, 200],
  });
  androidChannelReady = true;
}

async function presentLocalNotification({ title, body }) {
  await ensureAndroidChannel();
  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
    },
    trigger: Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null,
  });
}

/**
 * อ่านจาก profile.settings.notifications — รองรับ boolean เดิมหรือ object จากหน้าตั้งค่า
 */
function notificationsGloballyOff(n) {
  if (n && typeof n === 'object' && !Array.isArray(n)) {
    const boolVals = Object.values(n).filter((v) => typeof v === 'boolean');
    if (boolVals.length > 0 && boolVals.every((v) => v === false)) return true;
  }
  return false;
}

export function shouldShowExerciseSessionSavedNotification(settings) {
  const n = settings?.notifications;
  if (n === false) return false;
  if (n && typeof n === 'object' && !Array.isArray(n)) {
    if (n.exerciseSessionSaved === false) return false;
    if (notificationsGloballyOff(n)) return false;
  }
  return true;
}

/** แจ้งเตือนเมื่อถึงเวลา / เกณฑ์ระหว่างออกกำลัง (ตั้งจากหน้าแจ้งเตือน: ถึงเป้าหมาย) */
export function shouldShowGoalAchievedNotification(settings) {
  const n = settings?.notifications;
  if (n === false) return false;
  if (n && typeof n === 'object' && !Array.isArray(n)) {
    if (n.goalAchieved === false) return false;
    if (notificationsGloballyOff(n)) return false;
  }
  return true;
}

/**
 * แจ้งเตือนหลังบันทึกเซสชันสำเร็จ (local notification)
 */
export async function showExerciseSessionSavedNotification({ title, body }) {
  try {
    await presentLocalNotification({ title, body });
  } catch (e) {
    console.warn('showExerciseSessionSavedNotification:', e);
  }
}

/** แจ้งเตือนเมื่อครบเกณฑ์เป้าหมายข้อใดข้อหนึ่งระหว่างเซสชัน */
export async function showExerciseGoalMilestoneNotification({ title, body }) {
  try {
    await presentLocalNotification({ title, body });
  } catch (e) {
    console.warn('showExerciseGoalMilestoneNotification:', e);
  }
}
