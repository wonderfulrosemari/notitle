import axios from 'axios';
import { computed, reactive, readonly } from 'vue';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 5000,
});

const SESSION_KEY = 'kb-auth-user';
const BUDGET_ALERT_KEY_PREFIX = 'kb-budget-alert:';

const readSavedUser = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const state = reactive({
  currentUser: readSavedUser(),
});

const persistUser = (user) => {
  state.currentUser = user;

  if (typeof window === 'undefined') return;

  if (user) {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return;
  }

  window.sessionStorage.removeItem(SESSION_KEY);
};

const clearBudgetAlertFlags = () => {
  if (typeof window === 'undefined') return;

  for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = window.sessionStorage.key(index);
    if (key?.startsWith(BUDGET_ALERT_KEY_PREFIX)) {
      window.sessionStorage.removeItem(key);
    }
  }
};

const normalizeUser = (user) => ({
  id: String(user.id),
  name: user.name?.trim() || '',
  email: user.email?.trim().toLowerCase() || '',
  password: String(user.password || ''),
  createdAt: Number(user.createdAt || Date.now()),
});

export function useAuth() {
  const isLoggedIn = computed(() => Boolean(state.currentUser));

  const signup = async ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const duplicated = await api.get('/users', {
      params: {
        email: normalizedEmail,
      },
    });

    if (duplicated.data.length > 0) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    const payload = {
      name: name.trim(),
      email: normalizedEmail,
      password: password.trim(),
      createdAt: Date.now(),
    };

    const response = await api.post('/users', payload);
    return normalizeUser(response.data);
  };

  const login = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const response = await api.get('/users', {
      params: {
        email: normalizedEmail,
      },
    });

    const matchedUser = response.data[0];
    if (!matchedUser) {
      throw new Error('가입된 이메일이 없습니다.');
    }

    if (String(matchedUser.password) !== password.trim()) {
      throw new Error('비밀번호가 일치하지 않습니다.');
    }

    const user = normalizeUser(matchedUser);
    persistUser(user);
    return user;
  };

  const updatePassword = async (nextPassword) => {
    if (!state.currentUser?.id) {
      throw new Error('로그인한 사용자 정보가 없습니다.');
    }

    const trimmedPassword = nextPassword.trim();
    if (!trimmedPassword) {
      throw new Error('새 비밀번호를 입력해주세요.');
    }

    const request = {
      ...state.currentUser,
      password: trimmedPassword,
    };

    const response = await api.put(`/users/${state.currentUser.id}`, request);
    const user = normalizeUser(response.data);
    persistUser(user);
    return user;
  };

  const logout = () => {
    clearBudgetAlertFlags();
    persistUser(null);

    // 260409 로그아웃할 때 기본 dark로 가게 수정했습니다.
    localStorage.removeItem('app-theme');

    document.body.classList.remove('theme-kb');
  };

  return {
    state: readonly(state),
    isLoggedIn,
    signup,
    login,
    updatePassword,
    logout,
  };
}
