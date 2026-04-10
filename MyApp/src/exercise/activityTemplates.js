export const ACTIVITY_TEMPLATES = {
  walk: {
    key: 'walk',
    label: 'เดิน',
    icon: 'walk-outline',
    color: '#2E7D32',
    accent: '#4CAF50',
    tracking: { useAccelerometer: true, useGps: true },
    metrics: ['steps', 'distance', 'calories', 'duration'],
  },
  run: {
    key: 'run',
    label: 'วิ่ง',
    icon: 'body-outline',
    color: '#1565C0',
    accent: '#2196F3',
    tracking: { useAccelerometer: true, useGps: true },
    metrics: ['steps', 'distance', 'calories', 'duration'],
  },
  bike: {
    key: 'bike',
    label: 'จักรยาน',
    icon: 'bicycle-outline',
    color: '#E65100',
    accent: '#FF9800',
    tracking: { useAccelerometer: false, useGps: true },
    metrics: ['distance', 'calories', 'duration'],
  },
  gym: {
    key: 'gym',
    label: 'ยิม',
    icon: 'barbell-outline',
    color: '#BF360C',
    accent: '#FF5722',
    tracking: { useAccelerometer: false, useGps: false },
    metrics: ['sets', 'reps', 'calories', 'duration'],
  },
  custom: {
    key: 'custom',
    label: 'กำหนดเอง',
    icon: 'construct-outline',
    color: '#5D4037',
    accent: '#8D6E63',
    tracking: { useAccelerometer: false, useGps: false },
    metrics: ['duration'],
  },
};

export const ACTIVITY_KEYS = Object.keys(ACTIVITY_TEMPLATES);
export const DEFAULT_ACTIVITY_KEY = 'walk';
