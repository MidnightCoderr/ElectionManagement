import { api, setToken, clearToken } from './client.js';

/**
 * Register a new voter.
 * @param {{ aadharNumber, fullName, biometricTemplate, districtId }} payload
 */
export async function registerVoter(payload) {
  return api.post('/api/v1/auth/register-voter', payload);
}

/**
 * Authenticate voter via biometric hash. Stores JWT on success.
 * @param {{ biometricTemplate, terminalId }} payload
 */
export async function biometricLogin(payload) {
  const data = await api.post('/api/v1/auth/biometric', payload);
  if (data.token) {
    setToken(data.token);
    localStorage.setItem('voter_info', JSON.stringify(data.voter));
  }
  return data;
}

/**
 * Admin login with username + password. Stores JWT on success.
 * @param {{ username, password }} credentials
 */
export async function adminLogin(credentials) {
  const data = await api.post('/api/v1/auth/admin/login', credentials);
  if (data.token) {
    setToken(data.token);
    localStorage.setItem('admin_info', JSON.stringify(data.user));
  }
  return data;
}

/**
 * Check that the current token is still valid.
 */
export async function verifyToken() {
  return api.get('/api/v1/auth/verify');
}

/**
 * Log out — remove token and stored user info.
 */
export function logout() {
  clearToken();
}

export function getStoredVoter() {
  try { return JSON.parse(localStorage.getItem('voter_info')); } catch { return null; }
}

export function getStoredAdmin() {
  try { return JSON.parse(localStorage.getItem('admin_info')); } catch { return null; }
}
