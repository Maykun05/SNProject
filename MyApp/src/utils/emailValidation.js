const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {string} value - ควรส่งค่าที่ trim แล้ว
 */
export function isValidEmail(value) {
  if (typeof value !== 'string' || !value) return false;
  if (value.length > 254) return false;
  return EMAIL_RE.test(value);
}
