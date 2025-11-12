/**
 * PUBLIC_INTERFACE
 * Local user and session store utilities using localStorage only.
 * No backend calls. Used by Login, ForgotPin, SignUp, and TopNav avatar.
 *
 * Notes:
 * - Users are stored as objects: { username, pin, phone, password? }
 * - PIN is a 4-digit string and is the primary credential for TV login.
 * - Password remains optional/backward-compatible for legacy flows.
 */
const USERS_KEY = "mytv_user"; // array of { username, pin, phone, password? }
const SESSION_KEY = "mytv_session"; // { username }

/**
 * Safely parse JSON from localStorage.
 */
function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Load users array. If missing, returns an empty array.
 */
export function loadUsers() {
  const raw = window.localStorage.getItem(USERS_KEY);
  const users = safeParse(raw, []);
  if (!Array.isArray(users)) return [];
  return users;
}

/**
 * Save entire users array.
 */
export function saveUsers(users) {
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(Array.isArray(users) ? users : []));
  } catch {
    // ignore
  }
}

/**
 * PUBLIC_INTERFACE
 * upsertUser
 * Add a new user or update an existing one by username.
 */
export function upsertUser(user) {
  const users = loadUsers();
  const idx = users.findIndex((u) => (u.username || "").toLowerCase() === (user.username || "").toLowerCase());
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...user };
  } else {
    users.push(user);
  }
  saveUsers(users);
  return user;
}

/**
 * PUBLIC_INTERFACE
 * findUser
 * Get a user by username (case-insensitive). Returns null if not found.
 */
export function findUser(username) {
  const users = loadUsers();
  const u = users.find((x) => (x.username || "").toLowerCase() === (username || "").toLowerCase());
  return u || null;
}

/**
 * PUBLIC_INTERFACE
 * validateCredentials
 * Accepts username + pin or username + password.
 * Returns the matched user on success, otherwise null.
 */
export function validateCredentials({ username, pin, password }) {
  const user = findUser(username);
  if (!user) return null;
  if (pin && String(pin) === String(user.pin)) return user;
  if (password && String(password) === String(user.password)) return user;
  return null;
}

/**
 * PUBLIC_INTERFACE
 * createSession
 * Creates a session for a username.
 */
export function createSession(username) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ username }));
  } catch {}
}

/**
 * PUBLIC_INTERFACE
 * getSession
 * Returns the current session object or null.
 */
export function getSession() {
  const raw = window.localStorage.getItem(SESSION_KEY);
  const sess = safeParse(raw, null);
  return sess && sess.username ? sess : null;
}

/**
 * PUBLIC_INTERFACE
 * clearSession
 * Clears the current session.
 */
export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {}
}

/**
 * PUBLIC_INTERFACE
 * generatePin
 * Creates a 4-digit PIN as a string (leading zeros allowed).
 */
export function generatePin() {
  return String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}
