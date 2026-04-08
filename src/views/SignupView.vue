<template>
  <main class="auth-page auth-page-signup">
    <section class="auth-hero">
      <p class="auth-eyebrow">Create Account</p>
      <h1>회원가입 후 가계부를 시작해보세요</h1>
      <p class="auth-copy">
        이름, 이메일, 비밀번호, 비밀번호 확인을 입력할 수 있는 회원가입 화면입니다.
      </p>
      <ul class="auth-feature-list">
        <li>이름 입력 필드</li>
        <li>이메일 입력 필드</li>
        <li>비밀번호와 비밀번호 확인 필드</li>
      </ul>
    </section>

    <section class="auth-panel">
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

const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
})

const statusMessage = ref('회원가입 정보를 입력해주세요.')

function submitSignup() {
  if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !form.passwordConfirm.trim()) {
    statusMessage.value = '모든 항목을 입력해주세요.'
    return
  }

  if (form.password !== form.passwordConfirm) {
    statusMessage.value = '비밀번호와 비밀번호 확인이 일치하지 않습니다.'
    return
  }

  statusMessage.value = '회원가입이 완료되었다고 가정하고 로그인 화면으로 이동합니다.'
  router.push('/')
}
</script>
