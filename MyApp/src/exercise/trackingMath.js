/** Haversine ระยะทาง (km) */
export function haversineKm(coord1, coord2) {
  const R = 6371;
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
    Math.cos((coord2.latitude * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const DURATION_CALORIE_PER_MIN = {
  walk: 4.5,
  run: 8,
  bike: 6,
  gym: 5.5,
  custom: 5,
};

export const STEP_THRESHOLD = 1.2;
export const STEP_DELAY_MS = 300;
