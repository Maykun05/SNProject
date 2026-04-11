/**
 * เป้าแคลอรี่รายวันจากโปรไฟล์ — logic เดียวกับ FoodScreen
 * @param {object|null|undefined} profile
 * @param {boolean} hasToken
 */
export function recommendedDailyCaloriesFromProfile(profile, hasToken) {
  if (!hasToken) return 2000;
  const custom =
    profile?.calorieGoal != null && profile?.calorieGoal !== ''
      ? Number(profile.calorieGoal)
      : null;
  const hasValidCustom =
    custom != null && Number.isFinite(custom) && custom > 0;
  if (hasValidCustom) return custom;
  return autoCaloriesFromProfile(profile);
}

function getActivityFactor(level) {
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
}

function getAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function autoCaloriesFromProfile(p) {
  if (!p) return 2000;
  const weight = p.weight != null && p.weight !== '' ? Number(p.weight) : NaN;
  const height = p.height != null && p.height !== '' ? Number(p.height) : NaN;
  const { birthDate, gender, activityLevel } = p;
  if (!Number.isFinite(weight) || weight <= 0) return 2000;
  if (!Number.isFinite(height) || height <= 0) return 2000;
  if (!birthDate || !gender) return 2000;
  const age = getAge(birthDate);
  const factor = getActivityFactor(
    activityLevel != null && activityLevel !== '' ? Number(activityLevel) : null
  );
  let bmr;
  if (gender === 'MALE') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  return Math.round(bmr * factor);
}
