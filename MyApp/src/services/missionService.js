import { ALL_MISSIONS } from '../constants/missions';

export const generateMissions = () => {
  const getRandom = (arr, n) => {
    let shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  };

  return [
    ...getRandom(ALL_MISSIONS.daily, 3).map(m => ({ ...m, type: 'Daily', current: 0 })),
    ...getRandom(ALL_MISSIONS.weekly, 2).map(m => ({ ...m, type: 'Weekly', current: 0 })),
    ...getRandom(ALL_MISSIONS.monthly, 1).map(m => ({ ...m, type: 'Monthly', current: 0 })),
  ];
};