import { API_URL } from '../config';

export const fetchUserInfo = async (token) => {
  const res = await fetch(`${API_URL}/api/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('fetch-user-failed');
  }

  return res.json();
};

export const updateUserInfo = async (token, payload) => {
  const res = await fetch(`${API_URL}/api/user`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('update-user-failed');
  }

  return res.json();
};

export const updateProfileInfo = async (token, payload) => {
  const res = await fetch(`${API_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('update-profile-failed');
  }

  return res.json();
};
