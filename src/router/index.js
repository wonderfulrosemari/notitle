import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import LoginView from '../views/LoginView.vue';
import SignupView from '../views/SignupView.vue';
import LedgerDesk from '../views/LedgerDesk.vue';
import StatsDesk from '../views/StatsDesk.vue';
import CalendarDesk from '../views/CalendarDesk.vue';
import ProfileDesk from '../views/ProfileDesk.vue';

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView,
    meta: {
      authPage: true,
    },
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignupView,
    meta: {
      authPage: true,
    },
  },
  {
    path: '/ledger',
    name: 'ledger-desk',
    component: LedgerDesk,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/stats',
    name: 'stats-desk',
    component: StatsDesk,
  },
  {
    path: '/calendar',
    name: 'calendar-desk',
    component: CalendarDesk,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/profile',
    name: 'profile-desk',
    component: ProfileDesk,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/setting',
    name: 'setting-desk',
    component: () => import('../views/SettingDesk.vue'),
    meta: {
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuth();

  if (to.meta.requiresAuth && !auth.isLoggedIn.value) {
    return {
      path: '/',
      query: {
        redirect: to.fullPath,
      },
    };
  }

  if (to.meta.authPage && auth.isLoggedIn.value) {
    return '/ledger';
  }

  return true;
});

export default router;
