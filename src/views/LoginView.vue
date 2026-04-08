<template>
  <main class="auth-page">
    <p class="auth-page-brand">KB IT'S YOUR LIFE</p>

    <section class="auth-panel auth-panel-centered">
      <div class="auth-card">
        <div class="auth-card-head">
          <p class="auth-kicker">Login</p>
          <h2>로그인</h2>
          <p>이메일과 비밀번호를 입력해주세요.</p>
        </div>

        <form class="auth-form" @submit.prevent="submitLogin">
          <label>
            이메일
            <input v-model="form.email" type="email" placeholder="name@example.com" required />
          </label>

          <label>
            비밀번호
            <input
              v-model="form.password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </label>

          <p class="auth-status">{{ statusMessage }}</p>

          <button class="auth-submit" type="submit">로그인</button>
        </form>

        <p class="auth-switch">
          아직 계정이 없나요?
          <RouterLink to="/signup">회원가입</RouterLink>
        </p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()
const auth = useAuth()

const form = reactive({
  email: '',
  password: '',
})

const statusMessage = ref('로그인 정보를 입력하고 가계부로 이동하세요.')

async function submitLogin() {
  if (!form.email.trim() || !form.password.trim()) {
    statusMessage.value = '이메일과 비밀번호를 모두 입력해주세요.'
    return
  }

  try {
    await auth.login({
      email: form.email,
      password: form.password,
    })

    statusMessage.value = '로그인되었습니다. 가계부 화면으로 이동합니다.'
    router.push(route.query.redirect || '/dashboard')
  } catch (error) {
    statusMessage.value = error.message
  }
}
</script>
