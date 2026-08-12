import { User, LoginSessionLog, AdminSystemStats, AuthProvider } from '../types';

const AUTH_USER_KEY = 'databeta_auth_user_v1';
const LOGIN_LOGS_KEY = 'databeta_login_logs_v1';
const USER_DB_KEY = 'databeta_user_db_v1';

// Hash function using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface LocalUserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  createdAt: string;
}

function getLocalUserDb(): Record<string, LocalUserRecord> {
  try {
    const raw = localStorage.getItem(USER_DB_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalUserDb(db: Record<string, LocalUserRecord>): void {
  try {
    localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
  } catch {}
}

export const GOOGLE_PROFILES = [
  {
    name: 'Yogiraj Kapoor (Google Workspace)',
    email: 'yogiraj@databeta.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    role: 'admin' as const,
  },
  {
    name: 'Sarah Chen (Personal Gmail)',
    email: 'sarah.chen@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    role: 'user' as const,
  },
  {
    name: 'Alex Rivera (Growth Account)',
    email: 'alex.rivera@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    role: 'user' as const,
  },
];

export const APPLE_PROFILES = [
  {
    name: 'Helena Mcneil (Apple ID)',
    email: 'h.mcneil@privaterelay.appleid.com',
    role: 'user' as const,
  },
  {
    name: 'Marcus Vance (Apple ID)',
    email: 'm.vance@privaterelay.appleid.com',
    role: 'user' as const,
  },
];

export const INITIAL_LOGIN_LOGS: LoginSessionLog[] = [
  {
    id: 'log-1',
    userId: 'usr-admin-01',
    userName: 'Yogiraj Kapoor (Website Owner)',
    userEmail: 'yogiraj@databeta.io',
    timestamp: '2026-08-12 14:30:15',
    ipLocation: 'San Francisco, CA (192.168.1.1)',
    provider: 'google',
  },
  {
    id: 'log-2',
    userId: 'usr-user-02',
    userName: 'Helena Mcneil',
    userEmail: 'h.mcneil@privaterelay.appleid.com',
    timestamp: '2026-08-12 13:15:40',
    ipLocation: 'New York, NY (172.16.0.4)',
    provider: 'apple',
  },
  {
    id: 'log-3',
    userId: 'usr-user-03',
    userName: 'Alex Rivera',
    userEmail: 'alex.r@growthcapital.co',
    timestamp: '2026-08-12 11:05:22',
    ipLocation: 'London, UK (86.12.3.99)',
    provider: 'email',
  },
];

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch {
    // LocalStorage fallback
  }
}

export function getStoredLogs(): LoginSessionLog[] {
  try {
    const raw = localStorage.getItem(LOGIN_LOGS_KEY);
    if (!raw) return INITIAL_LOGIN_LOGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_LOGIN_LOGS;
  } catch {
    return INITIAL_LOGIN_LOGS;
  }
}

export function logSession(user: User): void {
  const logs = getStoredLogs();
  const newLog: LoginSessionLog = {
    id: `log-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    timestamp: new Date().toLocaleString(),
    ipLocation: 'Local Client Session (127.0.0.1)',
    provider: user.authProvider,
  };

  const updatedLogs = [newLog, ...logs];
  try {
    localStorage.setItem(LOGIN_LOGS_KEY, JSON.stringify(updatedLogs));
  } catch {
    // LocalStorage fallback
  }
}

export function authenticateWithGoogleProfile(selectedEmail?: string): User {
  const matched = GOOGLE_PROFILES.find((p) => p.email === selectedEmail) || GOOGLE_PROFILES[0];

  const user: User = {
    id: `usr-google-${Date.now()}`,
    name: matched.name,
    email: matched.email,
    avatar: matched.avatar,
    role: matched.role,
    authProvider: 'google',
    createdAt: '2026-01-15',
    lastLogin: new Date().toLocaleString(),
    isFirstTimeUser: false,
  };

  saveStoredUser(user);
  logSession(user);
  return user;
}

export function authenticateWithAppleProfile(selectedEmail?: string): User {
  const matched = APPLE_PROFILES.find((p) => p.email === selectedEmail) || APPLE_PROFILES[0];

  const user: User = {
    id: `usr-apple-${Date.now()}`,
    name: matched.name,
    email: matched.email,
    role: matched.role,
    authProvider: 'apple',
    createdAt: '2026-02-01',
    lastLogin: new Date().toLocaleString(),
    isFirstTimeUser: false,
  };

  saveStoredUser(user);
  logSession(user);
  return user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const db = getLocalUserDb();
  const record = db[email.toLowerCase()];

  if (!record) {
    throw new Error('No user found with this email.');
  }

  const hash = await hashPassword(pass);
  if (record.passwordHash !== hash) {
    throw new Error('Incorrect password.');
  }

  const user: User = {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
    authProvider: 'email',
    createdAt: record.createdAt,
    lastLogin: new Date().toLocaleString(),
    isFirstTimeUser: false,
  };

  saveStoredUser(user);
  logSession(user);
  return user;
}

export async function signUpWithEmail(name: string, email: string, pass: string): Promise<User> {
  const db = getLocalUserDb();
  const normalizedEmail = email.toLowerCase();

  if (db[normalizedEmail]) {
    throw new Error('A user with this email already exists.');
  }

  const isAdmin = normalizedEmail.includes('admin') || normalizedEmail.includes('owner') || normalizedEmail.includes('yogiraj');
  const hash = await hashPassword(pass);

  const newRecord: LocalUserRecord = {
    id: `usr-email-${Date.now()}`,
    name,
    email: normalizedEmail,
    passwordHash: hash,
    role: isAdmin ? 'admin' : 'user',
    createdAt: new Date().toISOString().split('T')[0],
  };

  db[normalizedEmail] = newRecord;
  saveLocalUserDb(db);

  const user: User = {
    id: newRecord.id,
    name: newRecord.name,
    email: newRecord.email,
    role: newRecord.role,
    authProvider: 'email',
    createdAt: newRecord.createdAt,
    lastLogin: new Date().toLocaleString(),
    isFirstTimeUser: true,
  };

  saveStoredUser(user);
  logSession(user);
  return user;
}

export function logoutUser(): void {
  saveStoredUser(null);
}

export function markTourCompleted(user: User): User {
  const updatedUser: User = {
    ...user,
    isFirstTimeUser: false,
  };
  saveStoredUser(updatedUser);
  return updatedUser;
}

export function getAdminStats(datasetRecordsCount: number = 0, crmDealsCount: number = 0): AdminSystemStats {
  const logs = getStoredLogs();
  const uniqueUsers = new Set(logs.map(l => l.userEmail)).size;
  return {
    totalUsers: uniqueUsers,
    totalLogins: logs.length,
    totalDatasetsUploaded: datasetRecordsCount > 0 ? 1 : 0, // Using 1 as a proxy if we have records
    totalAIQueriesExecuted: 0, // AI is simulated, so no queries actually executed against an API
    totalCRMDealsCreated: crmDealsCount,
    systemUptimePct: 100.0, // Local app is always up when running
  };
}
