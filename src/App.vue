<template>
  <div v-if="showAppShell" class="app-layout">
    <aside class="side-nav">
      <p class="brand-title">KB 가계부</p>
      <nav class="menu-list">
        <RouterLink to="/ledger" class="menu-item">
          <span class="menu-icon">L</span>
          <span>내역</span>
        </RouterLink>
        <RouterLink to="/stats" class="menu-item">
          <span class="menu-icon">S</span>
          <span>통계</span>
        </RouterLink>
        <RouterLink to="/calendar" class="menu-item">
          <span class="menu-icon">C</span>
          <span>캘린더</span>
        </RouterLink>
        <RouterLink to="/profile" class="menu-item">
          <span class="menu-icon">P</span>
          <span>프로필</span>
        </RouterLink>
      </nav>
    </aside>

    <section class="app-content">
      <header class="app-toolbar">
        <button class="app-logout-btn" type="button" @click="handleLogout">로그아웃</button>
      </header>

      <RouterView />
    </section>
  </div>

  <RouterView v-else />
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'

const route = useRoute()
const router = useRouter()
const auth = useAuth()

const showAppShell = computed(() => !route.meta.authPage)

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>
