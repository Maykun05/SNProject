export const calculateCalories = (weight, height, age, gender, activity) => {
  let bmr;

  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityMap = {
    low: 1.2,
    light: 1.375,
    moderate: 1.55,
    heavy: 1.725,
  };

  const multiplier = activityMap[activity] || 1.2;

  const tdee = bmr * multiplier;

  return Math.round(tdee);
};