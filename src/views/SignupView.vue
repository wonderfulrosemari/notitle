<template>
  <main class="auth-page auth-page-signup">
    <p class="auth-page-brand">KB IT'S YOUR LIFE</p>

    <section class="auth-panel auth-panel-centered">
      <div class="auth-card">
        <div class="auth-card-head">
          <p class="auth-kicker">Sign Up</p>
          <h2>회원가입</h2>
          <p>필수 정보를 입력해 계정을 생성하세요.</p>
        </div>

        <form class="auth-form" @submit.prevent="submitSignup">
          <label>
            이름
            <input v-model="form.name" type="text" placeholder="이름을 입력하세요" required />
          </label>

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

          <label>
            비밀번호 확인
            <input
              v-model="form.passwordConfirm"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </label>

          <p class="auth-status">{{ statusMessage }}</p>

          <button class="auth-submit" type="submit">회원가입</button>
        </form>

        <p class="auth-switch">
          이미 계정이 있나요?
          <RouterLink to="/">로그인으로 돌아가기</RouterLink>
        </p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const auth = useAuth()

const form = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
})

const statusMessage = ref('회원가입 정보를 입력해주세요.')

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.password = ''
  form.passwordConfirm = ''
}

async function submitSignup() {
  if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !form.passwordConfirm.trim()) {
    statusMessage.value = '모든 항목을 입력해주세요.'
    return
  }

  if (form.password !== form.passwordConfirm) {
    statusMessage.value = '비밀번호와 비밀번호 확인이 일치하지 않습니다.'
    return
  }

  try {
    await auth.signup({
      name: form.name,
      email: form.email,
      password: form.password,
    })

    resetForm()
    statusMessage.value = '회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.'
    router.push('/')
  } catch (error) {
    statusMessage.value = error.message
  }
}
</script>
