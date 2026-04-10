export const calculateBMI = (weightValue, heightValue) => {
  if (!weightValue || !heightValue) return '-';
  const weight = parseFloat(weightValue);
  const height = parseFloat(heightValue);
  if (Number.isNaN(weight) || Number.isNaN(height) || height <= 0) return '-';
  const bmiValue = weight / Math.pow(height / 100, 2);
  return Number.isNaN(bmiValue) ? '-' : bmiValue.toFixed(1);
};

export const parseBirthDate = (birthDateStr) => {
  if (!birthDateStr) return null;

  const isoDate = new Date(birthDateStr);
  if (!Number.isNaN(isoDate.getTime())) return isoDate;

  const [day, month, year] = String(birthDateStr).split('/').map(Number);
  if (!day || !month || !year) return null;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatBirthDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatBirthDateThai = (date) => {
  try {
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return formatBirthDate(date);
  }
};

export const calculateAge = (birthDate) => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

export const getProfileAge = (birthDateValue) => {
  const birthDate = parseBirthDate(birthDateValue);
  if (!birthDate) return null;
  const age = calculateAge(birthDate);
  return Number.isNaN(age) || age < 1 || age > 120 ? null : age;
};
