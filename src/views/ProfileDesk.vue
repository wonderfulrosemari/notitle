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
          <span>현재 비밀번호</span>
          <input
            v-model="form.currentPassword"
            type="password"
            placeholder="현재 비밀번호를 입력해주세요"
            required
          />
        </label>

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
import { reactive, ref } from 'vue';
import { useAuth } from '../composables/useAuth';

const auth = useAuth();

const form = reactive({
  currentPassword: '',
  password: '',
  passwordConfirm: '',
});

const statusMessage = ref('');

function resetForm() {
  form.currentPassword = '';
  form.password = '';
  form.passwordConfirm = '';
}

async function submitPasswordChange() {
  if (
    !form.currentPassword.trim()
    || !form.password.trim()
    || !form.passwordConfirm.trim()
  ) {
    statusMessage.value = '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.';
    return;
  }

  if (form.password !== form.passwordConfirm) {
    statusMessage.value = '비밀번호와 비밀번호 확인이 일치하지 않습니다.';
    return;
  }

  try {
    await auth.updatePassword(form.currentPassword, form.password);
    resetForm();
    statusMessage.value = '비밀번호가 변경되었습니다.';
  } catch (error) {
    statusMessage.value = error.message;
  }
}
</script>
<style scoped>
.profile-page {
  padding: 40px 16px;
  display: flex;
  justify-content: center;
}

.profile-card {
  background-color: var(--bg-sub);
  border: 1px solid var(--border-color);
  padding: 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
}

.profile-card-head h1 {
  color: var(--text-title);
  font-size: 24px;
  margin-bottom: 24px;
}

.profile-info-row dt {
  color: var(--text-sub);
  font-weight: 600;
}

.profile-info-row dd {
  color: var(--text-main);
}

.profile-field span {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-sub);
}

input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-main);
  color: var(--text-main);
  margin-bottom: 20px;
  outline: none;
}

input:focus {
  border-color: var(--point-color);
}

.profile-divider {
  height: 1px;
  background-color: var(--border-light);
  margin: 24px 0;
}
</style>

<style>
body.theme-kb .profile-card {
  background-color: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

body.theme-kb .profile-card-head h1 {
  color: #111111;
}

body.theme-kb .profile-info-row dt,
body.theme-kb .profile-field span {
  color: #666666;
}

body.theme-kb .profile-info-row dd {
  color: #222222;
}

body.theme-kb .profile-card input {
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  color: #222222;
}

body.theme-kb .profile-card input::placeholder {
  color: #999999;
}
</style>
