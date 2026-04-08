<template>
  <div class="profile-desk">
    <h1>프로필</h1>
    <p v-if="auth.state.currentUser">
      {{ auth.state.currentUser.name }} 님으로 로그인되어 있습니다.
    </p>
    <p v-else>로그인된 사용자 정보가 없습니다.</p>
    <button class="logout-button" type="button" @click="handleLogout">로그아웃</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const auth = useAuth()

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.profile-desk {
  padding: 24px;
  color: #ffffff;
}

.logout-button {
  margin-top: 16px;
  border: 0;
  border-radius: 10px;
  padding: 10px 14px;
  background: #ffbc00;
  color: #1a1605;
  font-weight: 700;
  cursor: pointer;
}
</style>
