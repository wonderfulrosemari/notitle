<template>
  <div v-if="showAppShell" class="app-layout">
    <aside class="side-nav">
      <p class="brand-title">KB 가계부</p>
      <nav class="menu-list">
        <RouterLink to="/ledger" class="menu-item">
          <span class="menu-icon">L</span>
          <span>내역</span>
        </RouterLink>
        <RouterLink to="/calendar" class="menu-item">
          <span class="menu-icon">C</span>
          <span>캘린더</span>
        </RouterLink>
        <RouterLink to="/profile" class="menu-item">
          <span class="menu-icon">◎</span>
          <span>프로필</span>
        </RouterLink>
      </nav>
    </aside>

    <section class="app-content">
      <RouterView />
    </section>
  </div>

  <RouterView v-else />
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

const showAppShell = computed(() => !route.meta.authPage)
</script>
