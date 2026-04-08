<template>
  <main class="profile-page">
    <section class="profile-card">
      <header class="profile-card-head">
        <h1>프로필 관리</h1>
      </header>

      <dl class="profile-info-list">
        <div class="profile-info-row">
          <dt>이름</dt>
          <dd>{{ auth.state.currentUser?.name || '-' }}</dd>
        </div>
        <div class="profile-info-row">
          <dt>이메일</dt>
          <dd>{{ auth.state.currentUser?.email || '-' }}</dd>
        </div>
      </dl>

      <div class="profile-divider"></div>

      <form class="profile-form" @submit.prevent="submitPasswordChange">
        <label class="profile-field">
          <span>새 비밀번호</span>
          <input
            v-model="form.password"
            type="password"
            placeholder="새로운 비밀번호를 입력해주세요"
            required
          />
        </label>

        <label class="profile-field">
          <span>비밀번호 확인</span>
          <input
            v-model="form.passwordConfirm"
            type="password"
            placeholder="비밀번호를 다시 입력해주세요"
            required
          />
        </label>

        <p class="profile-status">{{ statusMessage }}</p>

        <div class="profile-actions">
          <button class="solid-btn" type="submit">저장</button>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const auth = useAuth()

const form = reactive({
  password: '',
  passwordConfirm: '',
})

const statusMessage = ref('')

function resetForm() {
  form.password = ''
  form.passwordConfirm = ''
}

async function submitPasswordChange() {
  if (!form.password.trim() || !form.passwordConfirm.trim()) {
    statusMessage.value = '새 비밀번호와 비밀번호 확인을 모두 입력해주세요.'
    return
  }

  if (form.password !== form.passwordConfirm) {
    statusMessage.value = '비밀번호와 비밀번호 확인이 일치하지 않습니다.'
    return
  }

  try {
    await auth.updatePassword(form.password)
    resetForm()
    statusMessage.value = '비밀번호가 변경되었습니다.'
  } catch (error) {
    statusMessage.value = error.message
  }
}
</script>
