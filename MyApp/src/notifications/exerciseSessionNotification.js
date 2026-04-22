import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHANNELS = {
  exercise: 'exercise-session-complete',
  water: 'water-reminder',
  food: 'food-reminder',
  sleep: 'sleep-reminder',
  mood: 'mood-reminder',
  mission: 'mission-reminder',
  report: 'weekly-report',
  daily: 'daily-reminder',
};

let handlerRegistered = false;
const androidChannelsReady = {};

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

async function ensureAndroidChannel(channelId, name) {
  if (Platform.OS !== 'android' || androidChannelsReady[channelId]) return;
  await Notifications.setNotificationChannelAsync(channelId, {
    name,
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 100, 200],
  });
  androidChannelsReady[channelId] = true;
}

async function presentLocalNotification({ title, body, channelId = CHANNELS.daily }) {
  await ensureAndroidChannel(channelId, 'แจ้งเตือน');
  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') return;

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default' },
    trigger: Platform.OS === 'android' ? { channelId } : null,
  });
}

function notificationsGloballyOff(n) {
  if (n && typeof n === 'object' && !Array.isArray(n)) {
    const boolVals = Object.values(n).filter((v) => typeof v === 'boolean');
    if (boolVals.length > 0 && boolVals.every((v) => v === false)) return true;
  }
  return false;
}

function shouldShowNotification(settings, key) {
  const n = settings?.notifications;
  if (n === false) return false;
  if (n && typeof n === 'object' && !Array.isArray(n)) {
    if (n[key] === false) return false;
    if (notificationsGloballyOff(n)) return false;
  }
  return true;
}

// Exercise
export function shouldShowExerciseSessionSavedNotification(settings) {
  return shouldShowNotification(settings, 'exerciseSessionSaved');
}

export function shouldShowGoalAchievedNotification(settings) {
  return shouldShowNotification(settings, 'goalAchieved');
}

export async function showExerciseSessionSavedNotification({ title, body }) {
  try {
    await presentLocalNotification({ title, body, channelId: CHANNELS.exercise });
  } catch (e) {
    console.warn('showExerciseSessionSavedNotification:', e);
  }
}

export async function showExerciseGoalMilestoneNotification({ title, body }) {
  try {
    await presentLocalNotification({ title, body, channelId: CHANNELS.exercise });
  } catch (e) {
    console.warn('showExerciseGoalMilestoneNotification:', e);
  }
}

// Water
export function shouldShowWaterReminder(settings) {
  return shouldShowNotification(settings, 'waterReminder');
}

export async function showWaterReminder({ title = 'เตือนดื่มน้ำ', body = 'ถึงเวลาดื่มน้ำแล้ว ดื่มให้เพียงพอนะ' } = {}) {
  try {
    await presentLocalNotification({ title, body, channelId: CHANNELS.water });
  } catch (e) {
    console.warn('showWaterReminder:', e);
  }
}

// Food
export function shouldShowFoodReminder(settings) {
  return shouldShowNotification(settings, 'foodReminder');
}

export async function showFoodReminder({ title = 'เตือนบันทึกอาหาร', body = 'บันทึกมื้ออาหารของคุณเข้าแอปได้แล้ว' } = {}) {
  try {
    await presentLocalNotification({ title, body, channelId: CHANNELS.food });
  } catch (e) {
    console.warn('showFoodReminder:', e);
  }
}

// Sleep
export function shouldShowSleepReminder(settings) {
  return shouldShowNotification(settings, 'sleepReminder');
}

export async function showSleepReminder({ title = 'เตือนเวลานอน', body = 'ถึงเวลาดูแลการนอนของคุณแล้ว' } = {}) {
  try {
    await presentLocalNotification({ title, body, channelId: CHANNELS.sleep });
  } catch (e) {
    console.warn('showSleepReminder:', e);
  }
}

// Mood
export function shouldShowMoodReminder(settings) {
  return shouldShowNotification(settings, 'moodReminder');
}

export async function showMoodReminder({ title = 'บันทึกอารมณ์วันนี้', body = 'บันทึกอารมณ์ของคุณและตัวเองจะรู้จักคุณมากขึ้น' } = {}) {
  try {
    await presentLocalNotification({ title, body, channelId: CHANNELS.mood });
  } catch (e) {
    console.warn('showMoodReminder:', e);
  }
}

// Mission
export function shouldShowMissionReminder(settings) {
  return shouldShowNotification(settings, 'missionReminder');
}

export async function showMissionReminder({ title = 'ยังมี mission ที่รอคุณ', body = 'มี mission ใกล้หมดเวลาแล้ว' } = {}) {
  try {
    await presentLocalNotification({ title, body, channelId: CHANNELS.mission });
  } catch (e) {
    console.warn('showMissionReminder:', e);
  }
}

// Daily Reminder
export function shouldShowDailyReminder(settings) {
  return shouldShowNotification(settings, 'dailyReminder');
}

export async function showDailyReminder({ title = 'กิจกรรมประจำวัน', body = 'อย่าลืมบันทึกกิจกรรมวันนี้' } = {}) {
  try {
    await presentLocalNotification({ title, body, channelId: CHANNELS.daily });
  } catch (e) {
    console.warn('showDailyReminder:', e);
  }
}

// Weekly Report
export function shouldShowWeeklyReport(settings) {
  return shouldShowNotification(settings, 'weeklyReport');
}

export async function showWeeklyReport({ title = 'รายงานสรุปสัปดาห์', body = 'ดูผลสรุปของคุณในสัปดาห์ที่ผ่านมา' } = {}) {
  try {
    await presentLocalNotification({ title, body, channelId: CHANNELS.report });
  } catch (e) {
    console.warn('showWeeklyReport:', e);
  }
}

// Scheduling
export async function scheduleRepeatingNotification({ title, body, hour, minute, weekday = null, channelId = CHANNELS.daily }) {
  try {
    await ensureAndroidChannel(channelId, 'แจ้งเตือน');
    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') {
      console.warn('scheduleRepeatingNotification: permissions not granted');
      return null;
    }

    const trigger = weekday !== null
      ? { type: 'calendar', weekday, hour, minute, repeats: true }
      : { type: 'daily', hour, minute, repeats: true };

    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: 'default', ...(Platform.OS === 'android' && { channelId }) },
      trigger,
    });
    console.log('Scheduled notification:', { title, hour, minute, id });
    return id;
  } catch (e) {
    console.warn('scheduleRepeatingNotification error:', e);
    return null;
  }
}

export async function cancelScheduledNotification(id) {
  try {
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  } catch (e) {
    console.warn('cancelScheduledNotification:', e);
  }
}

const NOTIFICATION_CONFIG = {
  dailyReminder: {
    title: 'กิจกรรมประจำวัน',
    body: 'อย่าลืมบันทึกกิจกรรมวันนี้',
    channel: CHANNELS.daily,
    key: 'dailyReminder',
    timeKey: 'dailyReminderTime',
  },
  waterReminder: {
    title: 'เตือนดื่มน้ำ',
    body: 'ถึงเวลาดื่มน้ำแล้ว ดื่มให้เพียงพอนะ',
    channel: CHANNELS.water,
    key: 'waterReminder',
    timeKey: 'waterReminderTime',
  },
  foodReminder: {
    title: 'เตือนบันทึกอาหาร',
    body: 'บันทึกมื้ออาหารของคุณเข้าแอปได้แล้ว',
    channel: CHANNELS.food,
    key: 'foodReminder',
    timeKey: 'foodReminderTimes',
    mealTypes: ['breakfast', 'lunch', 'dinner'],
  },
  exerciseReminder: {
    title: 'เตือนออกกำลังกาย',
    body: 'ถึงเวลาออกกำลังกายแล้ว',
    channel: CHANNELS.exercise,
    key: 'exerciseReminder',
    timeKey: 'exerciseReminderTime',
  },
  sleepReminder: {
    title: 'เตือนเวลานอน',
    body: 'ถึงเวลาดูแลการนอนของคุณแล้ว',
    channel: CHANNELS.sleep,
    key: 'sleepReminder',
    timeKey: 'sleepReminderTime',
  },
  moodReminder: {
    title: 'บันทึกอารมณ์วันนี้',
    body: 'บันทึกอารมณ์ของคุณและตัวเองจะรู้จักคุณมากขึ้น',
    channel: CHANNELS.mood,
    key: 'moodReminder',
    timeKey: 'moodReminderTime',
  },
  weeklyReport: {
    title: 'รายงานสรุปสัปดาห์',
    body: 'ดูผลสรุปของคุณในสัปดาห์ที่ผ่านมา',
    channel: CHANNELS.report,
    key: 'weeklyReport',
    timeKey: 'weeklyReportTime',
    weekday: 2,
  },
};

export async function applyNotificationSettings(settings) {
  try {
    const notiSettings = settings?.notifications || {};
    const savedIds = await AsyncStorage.getItem('SCHEDULED_NOTI_IDS');
    const idsMap = savedIds ? JSON.parse(savedIds) : {};
    console.log('applyNotificationSettings called with:', notiSettings);

    for (const [settingKey, config] of Object.entries(NOTIFICATION_CONFIG)) {
      const isEnabled = notiSettings[config.key] === true;

      if (config.mealTypes) {
        for (const mealType of config.mealTypes) {
          const idKey = `${settingKey}_${mealType}`;
          const oldId = idsMap[idKey];
          if (oldId) {
            await cancelScheduledNotification(oldId);
            delete idsMap[idKey];
          }

          if (isEnabled && notiSettings[config.timeKey]?.[mealType]) {
            const [h, m] = notiSettings[config.timeKey][mealType].split(':').map(Number);
            const newId = await scheduleRepeatingNotification({
              title: config.title,
              body: `${config.body} (${mealType === 'breakfast' ? 'เช้า' : mealType === 'lunch' ? 'เที่ยง' : 'เย็น'})`,
              hour: h,
              minute: m,
              channelId: config.channel,
            });
            if (newId) idsMap[idKey] = newId;
          }
        }
      } else {
        const idKey = settingKey;
        const oldId = idsMap[idKey];
        if (oldId) {
          await cancelScheduledNotification(oldId);
          delete idsMap[idKey];
        }

        if (isEnabled && notiSettings[config.timeKey]) {
          const [h, m] = notiSettings[config.timeKey].split(':').map(Number);
          const newId = await scheduleRepeatingNotification({
            title: config.title,
            body: config.body,
            hour: h,
            minute: m,
            weekday: config.weekday || undefined,
            channelId: config.channel,
          });
          if (newId) idsMap[idKey] = newId;
        }
      }
    }

    await AsyncStorage.setItem('SCHEDULED_NOTI_IDS', JSON.stringify(idsMap));
    console.log('applyNotificationSettings completed. Scheduled IDs:', idsMap);
  } catch (e) {
    console.warn('applyNotificationSettings error:', e);
  }
}
