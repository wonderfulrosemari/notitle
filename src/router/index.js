import { createRouter, createWebHistory } from 'vue-router'
import LedgerDesk from '../views/LedgerDesk.vue'

const routes = [
  {
    path: '/',
    name: 'ledger-desk',
    component: LedgerDesk,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
