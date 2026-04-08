import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import LedgerDesk from '../views/LedgerDesk.vue'
import CalendarDesk from '../views/CalendarDesk.vue'

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
  },
  {
    path: '/calendar',
    name: 'calendar-desk',
    component: CalendarDesk,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
