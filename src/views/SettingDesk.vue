<template>
  <div class="settings-page">
    <h2 class="title">⚙️ 설정</h2>

    <section class="settings-item" :class="{ active: activeMenu === 'budget' }">
      <div class="item-header" @click="toggleMenu('budget')">
        <div class="header-left">
          <span class="icon">🔔</span>
          <span class="label">총 지출액 초과 알림 설정</span>
        </div>
        <span class="arrow">{{ activeMenu === 'budget' ? '▲' : '▼' }}</span>
      </div>

      <div v-if="activeMenu === 'budget'" class="item-content">
        <div class="flex-row">
          <input type="number" v-model="budget" placeholder="목표 예산 입력" />
          <button @click="saveBudget" class="solid-btn">저장</button>
        </div>
        <p class="hint">설정한 금액을 초과하면 알림창이 나타납니다.</p>
      </div>
    </section>

    <section
      class="settings-item"
      :class="{ active: activeMenu === 'regular' }"
    >
      <div class="item-header" @click="toggleMenu('regular')">
        <div class="header-left">
          <span class="icon">📅</span>
          <span class="label">정기결제(고정 지출) 추가</span>
        </div>
        <span class="arrow">{{ activeMenu === 'regular' ? '▲' : '▼' }}</span>
      </div>

      <div v-if="activeMenu === 'regular'" class="item-content">
        <div class="form-container">
          <div class="input-grid">
            <div class="field">
              <label>결제일</label>
              <select v-model.number="newRegular.payDay">
                <option v-for="d in 28" :key="d" :value="d">
                  매월 {{ d }}일
                </option>
              </select>
            </div>
            <div class="field">
              <label>유형</label>
              <select v-model="newRegular.type">
                <option value="expense">지출</option>
                <option value="income">수입</option>
              </select>
            </div>
          </div>

          <div class="input-grid">
            <div class="field">
              <label>금액</label>
              <input
                v-model.number="newRegular.amount"
                type="number"
                placeholder="금액 입력"
              />
            </div>
            <div class="field">
              <label>카테고리</label>
              <select v-model="newRegular.category">
                <option
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="cat.name"
                >
                  {{ cat.emoji }} {{ cat.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>메모</label>
            <input
              v-model="newRegular.memo"
              type="text"
              placeholder="간단한 메모 (예: 음식점 이름)"
            />
          </div>

          <button @click="addRegular" class="solid-btn full-width">
            정기 항목 등록
          </button>
        </div>
      </div>
    </section>

    <section
      class="settings-item"
      :class="{ active: activeMenu === 'category' }"
    >
      <div class="item-header" @click="toggleMenu('category')">
        <div class="header-left">
          <span class="icon">🏷️</span>
          <span class="label">카테고리 및 이모지 관리</span>
        </div>
        <span class="arrow">{{ activeMenu === 'category' ? '▲' : '▼' }}</span>
      </div>

      <div v-if="activeMenu === 'category'" class="item-content">
        <div class="flex-row">
          <button class="emoji-select-btn" @click="toggleEmojiPicker">
            {{ newCategory.emoji }}
          </button>
          <input v-model="newCategory.name" placeholder="새 카테고리 이름" />
          <button @click="addCategory" class="solid-btn">추가</button>
        </div>

        <div v-if="isEmojiPickerOpen" class="emoji-palette">
          <p class="palette-title">아이콘 선택</p>
          <div class="emoji-grid">
            <div
              v-for="emoji in emojiList"
              :key="emoji"
              class="emoji-item"
              :class="{ selected: newCategory.emoji === emoji }"
              @click="selectEmoji(emoji)"
            >
              {{ emoji }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="settings-item" :class="{ active: activeMenu === 'theme' }">
      <div class="item-header" @click="toggleMenu('theme')">
        <div class="header-left">
          <span class="icon">🎨</span>
          <span class="label">화면 테마 설정</span>
        </div>
        <span class="arrow">{{ activeMenu === 'theme' ? '▲' : '▼' }}</span>
      </div>

      <div v-if="activeMenu === 'theme'" class="item-content">
        <div class="theme-toggle-wrap">
          <div
            class="theme-card"
            :class="{ active: currentTheme === 'dark' }"
            @click="setTheme('dark')"
          >
            <div class="theme-preview dark-preview"></div>
            <span>다크 모드 (기본)</span>
          </div>

          <div
            class="theme-card"
            :class="{ active: currentTheme === 'kb' }"
            @click="setTheme('kb')"
          >
            <div class="theme-preview kb-preview"></div>
            <span>KB 테마 (라이트)</span>
          </div>
        </div>
        <p class="hint">선택한 테마는 다음 접속 시에도 유지됩니다.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// ---------------------------------
// 1. 공통 UI 상태 관리
// ---------------------------------
const activeMenu = ref(null);

const toggleMenu = (menuName) => {
  activeMenu.value = activeMenu.value === menuName ? null : menuName;
};

// ---------------------------------
// 2. 예산 설정
// ---------------------------------
const budget = ref(0);

const saveBudget = () => {
  alert('예산이 저장되었습니다.');
};

// ---------------------------------
// 3. 정기결제 설정
// ---------------------------------
const newRegular = ref({
  payDay: 1,
  type: 'expense',
  amount: 0,
  category: '식비',
  memo: '',
});

const addRegular = () => {
  alert('정기결제 항목이 추가되었습니다.');
};

// ---------------------------------
// 4. 카테고리 및 이모지 관리
// ---------------------------------
//test 용
const categories = ref([
  { id: 1, name: '식비', emoji: '🍴' },
  { id: 2, name: '교통', emoji: '🚌' },
  { id: 3, name: '구독료', emoji: '📺' },
]);

const newCategory = ref({
  name: '',
  emoji: '💰',
});

const isEmojiPickerOpen = ref(false);

const emojiList = [
  '💰',
  '🍴',
  '☕',
  '🚌',
  '🚕',
  '🛍️',
  '🏥',
  '💊',
  '🏠',
  '🎬',
  '🎮',
  '✈️',
  '📚',
  '👗',
  '💇‍♀️',
  '🐶',
  '🎁',
  '📱',
];

const toggleEmojiPicker = () => {
  isEmojiPickerOpen.value = !isEmojiPickerOpen.value;
};

const selectEmoji = (emoji) => {
  newCategory.value.emoji = emoji;
  isEmojiPickerOpen.value = false;
};

const addCategory = () => {
  if (!newCategory.value.name.trim()) {
    alert('카테고리 이름을 입력해주세요.');
    return;
  }
  alert(
    `[${newCategory.value.emoji} ${newCategory.value.name}] 카테고리 및 이모지 추가되었습니다.`,
  );
  newCategory.value.name = '';
  newCategory.value.emoji = '💰';
};

// ---------------------------------
// 5. 테마 설정 (다크/라이트)
// ---------------------------------
const currentTheme = ref('dark');

const setTheme = (theme) => {
  currentTheme.value = theme;

  if (theme === 'kb') {
    document.body.classList.add('theme-kb');
  } else {
    document.body.classList.remove('theme-kb');
  }

  localStorage.setItem('app-theme', theme);
};

onMounted(() => {
  const savedTheme = localStorage.getItem('app-theme');
  if (savedTheme === 'kb') {
    setTheme('kb');
  }
});
</script>

<style scoped>
.settings-page {
  padding: 24px 16px;
  max-width: 700px;
  margin: 0 auto;
  color: var(--text-main);
}

.title {
  font-size: 22px;
  margin-bottom: 24px;
  font-weight: 700;
  color: var(--text-title);
}

/* 아코디언 카드 영역 */
.settings-item {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-main);
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.settings-item.active {
  border-color: var(--point-color);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  background: var(--bg-sub);
  transition: background 0.3s ease;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon {
  font-size: 22px;
}

.label {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-title);
}

.active .label {
  color: var(--point-color);
}

.arrow {
  color: var(--text-sub);
}

.item-content {
  padding: 24px 20px;
  background: var(--bg-main);
  border-top: 1px solid var(--border-light);
}

/* 폼 레이아웃 */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.flex-row {
  display: flex;
  gap: 12px;
  align-items: stretch;
}

.flex-row input {
  flex: 1;
}

.flex-row button:not(.emoji-select-btn) {
  flex: 0 0 90px;
  margin: 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-size: 13px;
  color: var(--text-sub);
  font-weight: 600;
}

input,
select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-sub);
  color: var(--text-main);
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s;
}

input::placeholder {
  color: var(--text-sub);
  opacity: 0.7;
}

input:focus,
select:focus {
  border-color: var(--point-color);
}

.solid-btn {
  padding: 12px 16px;
  font-size: 14px;
}

.full-width {
  width: 100%;
  margin-top: 16px;
  padding: 14px;
  font-size: 15px;
}

.hint {
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 10px;
  line-height: 1.4;
}

.emoji-select-btn {
  flex: 0 0 48px;
  height: 48px;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: var(--bg-sub);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.emoji-select-btn:hover {
  border-color: var(--point-color);
  background: rgba(255, 188, 0, 0.05);
}

.emoji-palette {
  margin-top: 16px;
  padding: 16px;
  background: var(--bg-sub);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  animation: fadeIn 0.2s ease-out;
}

.palette-title {
  margin: 0 0 12px 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-sub);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
  gap: 8px;
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  font-size: 20px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.emoji-item:hover {
  background: var(--bg-hover);
  transform: scale(1.1);
}

.emoji-item.selected {
  background: rgba(255, 188, 0, 0.15);
  border-color: var(--point-color);
}

.theme-toggle-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.theme-card {
  border: 2px solid var(--border-color);
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-sub);
  color: var(--text-sub);
  font-weight: 600;
  font-size: 14px;
}

.theme-card.active {
  border-color: var(--point-color);
  color: var(--point-color);
  background: rgba(255, 188, 0, 0.08);
}

.theme-preview {
  height: 60px;
  border-radius: 6px;
  margin-bottom: 12px;
  border: 1px solid var(--border-color);
}

.dark-preview {
  background: #111621;
}

.kb-preview {
  background: linear-gradient(135deg, #ffbc00 0%, #f38b1a 100%);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .input-grid {
    grid-template-columns: 1fr;
  }
}
</style>
