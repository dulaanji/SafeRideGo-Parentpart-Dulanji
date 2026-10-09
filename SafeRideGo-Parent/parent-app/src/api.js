import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

let token = null;
export const setToken = async (t) => {
  token = t;
  if (t) await AsyncStorage.setItem('token', t);
  else await AsyncStorage.removeItem('token');
};
export const loadToken = async () => (token = await AsyncStorage.getItem('token'));

async function req(method, path, body) {
  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running? Check API_URL in src/config.js');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.data = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get: (p) => req('GET', p),
  post: (p, b) => req('POST', p, b || {}),
  put: (p, b) => req('PUT', p, b || {}),
  del: (p) => req('DELETE', p),
};
