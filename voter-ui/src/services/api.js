/**
 * api.js
 * Base API client for the voter terminal.
 * All services import from here.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE !== 'false'

export { MOCK_MODE }

/**
 * Authenticated fetch wrapper.
 * Attaches the terminal JWT automatically if present in sessionStorage.
 */
export async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem('terminal_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `HTTP ${res.status}`)
  }

  return res.json()
}

/** Simulate network delay (mock mode only) */
export function mockDelay(ms = 1000) {
  return new Promise(r => setTimeout(r, ms + Math.random() * 400))
}
