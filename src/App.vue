<template>
  <div class="layout">
    <header class="topbar">
      <h1>도서 CRUD 확인</h1>
      <nav class="nav">
        <RouterLink to="/books" class="link">도서 목록</RouterLink>
        <RouterLink to="/books/add" class="link">도서 추가</RouterLink>
      </nav>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>
