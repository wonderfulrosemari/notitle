<template>
  <div class="app-layout">
    <aside class="side-nav">
      <p class="brand-title">KB 가계부</p>
      <nav class="menu-list">
        <RouterLink to="/ledger" class="menu-item">
          <span class="menu-icon">▦</span>
          <span>내역</span>
        </RouterLink>
        <RouterLink to="/calendar" class="menu-item">
          <span class="menu-icon">◷</span>
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
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>
