import { createRouter, createWebHistory } from 'vue-router'
import LedgerDesk from '../views/LedgerDesk.vue'
import CalendarDesk from '../views/CalendarDesk.vue'

const routes = [
  {
    path: '/',
    redirect: '/ledger',
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
