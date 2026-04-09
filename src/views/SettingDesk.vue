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
          <input
            type="number"
            v-model="budget"
            placeholder="월 목표 예산 입력"
          />
          <button @click="handleSaveBudget" class="solid-btn">저장</button>
        </div>
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
                  v-for="cat in ledger.categories"
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
              placeholder="예: 넷플릭스 구독"
            />
          </div>
          <button @click="handleAddRegular" class="solid-btn full-width">
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
          <span class="icon">🏷️</span><span class="label">카테고리 관리</span>
        </div>
        <span class="arrow">{{ activeMenu === 'category' ? '▲' : '▼' }}</span>
      </div>
      <div v-if="activeMenu === 'category'" class="item-content">
        <div class="flex-row emoji-picker-container">
          <button
            type="button"
            class="emoji-select-btn"
            @click.stop="isEmojiPickerOpen = !isEmojiPickerOpen"
          >
            {{ newCategory.emoji }}
          </button>

          <div v-if="isEmojiPickerOpen" class="emoji-popover">
            <div class="emoji-grid">
              <span
                v-for="emoji in emojiList"
                :key="emoji"
                class="emoji-item"
                @click="selectEmoji(emoji)"
              >
                {{ emoji }}
              </span>
            </div>
          </div>

          <input
            v-model="newCategory.name"
            placeholder="새 카테고리 이름"
            @focus="isEmojiPickerOpen = false"
          />
          <button @click="handleAddCategory" class="solid-btn">추가</button>
        </div>

        <div class="category-tags" style="margin-top: 15px">
          <span v-for="cat in ledger.categories" :key="cat.id" class="cat-tag">
            {{ cat.emoji }} {{ cat.name }}
            <button
              class="del-cat-btn"
              @click="handleDeleteCategory(cat.id, cat.name)"
            >
              ✕
            </button>
          </span>
        </div>
      </div>
    </section>

    <section class="settings-item" :class="{ active: activeMenu === 'theme' }">
      <div class="item-header" @click="toggleMenu('theme')">
        <div class="header-left">
          <span class="icon">🎨</span><span class="label">테마 설정</span>
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
            다크 모드
          </div>
          <div
            class="theme-card"
            :class="{ active: currentTheme === 'kb' }"
            @click="setTheme('kb')"
          >
            라이트 모드
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useLedger } from '../composables/useLedger';
import { useSettings } from '../composables/useSettings';
import { useAuth } from '../composables/useAuth';

const ledger = useLedger();
const auth = useAuth();
const { budget, fetchUserBudget, updateUserBudget } = useSettings();

const activeMenu = ref(null);
const currentUserId = computed(() => auth.state.currentUser?.id);

const toggleMenu = (menuName) => {
  activeMenu.value = activeMenu.value === menuName ? null : menuName;
};

const handleSaveBudget = async () => {
  try {
    await updateUserBudget(currentUserId.value, budget.value);
    alert('목표 예산이 저장되었습니다!');
  } catch (error) {
    alert('저장에 실패했습니다.');
  }
};

const newRegular = ref({
  payDay: 1,
  type: 'expense',
  amount: 0,
  category: '식비',
  memo: '',
});

const handleAddRegular = async () => {
  if (newRegular.value.amount <= 0) return alert('금액을 입력하세요.');
  try {
    const emoji = ledger.getEmojiByName(newRegular.value.category) || '✨';
    const createdReg = await ledger.addRegular({
      ...newRegular.value,
      amount: Number(newRegular.value.amount),
      emoji: emoji,
    });

    const now = new Date();
    const targetDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(newRegular.value.payDay).padStart(2, '0')}`;

    await ledger.addTransaction({
      date: targetDate,
      type: newRegular.value.type,
      category: newRegular.value.category,
      amount: Number(newRegular.value.amount),
      memo: `[정기] ${newRegular.value.memo || newRegular.value.category}`,
      emoji: emoji,
      regularId: createdReg.id,
    });

    alert(`매월 ${newRegular.value.payDay}일자로 정기결제가 등록되었습니다.`);
    newRegular.value.amount = 0;
    newRegular.value.memo = '';
  } catch (error) {
    alert('등록 중 오류가 발생했습니다.');
  }
};

const newCategory = ref({ name: '', emoji: '💰' });
const isEmojiPickerOpen = ref(false);

const emojiList = [
  '💰',
  '💵',
  '💳',
  '🍕',
  '☕',
  '🍺',
  '🍱',
  '🚌',
  '🚗',
  '🏠',
  '🛒',
  '🛍️',
  '🎬',
  '🎮',
  '🏥',
  '💊',
  '🎁',
  '🔌',
  '📚',
  '🏋️',
  '💇',
  '🐈',
  '🐕',
  '✈️',
  '⛽',
  '💧',
  '🔥',
  '✨',
  '☁️',
  '🌈',
];

const selectEmoji = (emoji) => {
  newCategory.value.emoji = emoji;
  isEmojiPickerOpen.value = false;
};

const handleAddCategory = async () => {
  if (!newCategory.value.name.trim()) return alert('카테고리명을 입력하세요.');
  try {
    await ledger.addCategory({
      name: newCategory.value.name.trim(),
      emoji: newCategory.value.emoji,
      type: 'expense',
    });
    newCategory.value.name = '';
    newCategory.value.emoji = '💰';
  } catch (error) {
    alert('카테고리 추가 실패');
  }
};

const handleDeleteCategory = async (id, name) => {
  if (confirm(`'${name}' 카테고리를 삭제할까요?`)) {
    try {
      await ledger.removeCategory(id);
    } catch (error) {
      alert('삭제 실패');
    }
  }
};

// 바깥 클릭 시 피커 닫기
const handleGlobalClick = () => {
  isEmojiPickerOpen.value = false;
};

const currentTheme = ref('dark');
const setTheme = (theme) => {
  currentTheme.value = theme;
  if (theme === 'kb') document.body.classList.add('theme-kb');
  else document.body.classList.remove('theme-kb');
  localStorage.setItem('app-theme', theme);
};

onMounted(async () => {
  await ledger.fetchCategories();
  if (currentUserId.value) await fetchUserBudget(currentUserId.value);

  const savedTheme = localStorage.getItem('app-theme') || 'dark';
  setTheme(savedTheme);

  if (ledger.categories?.length > 0) {
    newRegular.value.category = ledger.categories[0].name;
  }

  window.addEventListener('click', handleGlobalClick);
});

onUnmounted(() => {
  window.removeEventListener('click', handleGlobalClick);
});
</script>

<style scoped>
/* 페이지 기본 설정 */
.settings-page {
  padding: 24px 16px;
  max-width: 700px;
  margin: 0 auto;
  color: var(--text-main);
}

.title {
  font-size: 24px;
  margin-bottom: 24px;
  font-weight: 700;
  color: var(--text-title);
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 설정 항목 카드 */
.settings-item {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-main);
  margin-bottom: 16px;
  /* overflow: hidden;  <-- 이 줄을 삭제하거나 주석 처리하세요! */
  position: relative; /* 추가 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.settings-item.active {
  border-color: var(--point-color);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  cursor: pointer;
  background: var(--bg-sub);
}

.label {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-title);
}

.item-content {
  padding: 24px 20px;
  background: var(--bg-main);
  border-top: 1px solid var(--border-light);
}

/* 정기결제 폼 */
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
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.field label {
  font-size: 13px;
  color: var(--text-sub);
  font-weight: 600;
}

input,
select {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-sub);
  color: var(--text-main);
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

input:focus,
select:focus {
  border-color: var(--point-color);
}

/* --- 이모지 피커 스타일 --- */
.emoji-picker-container {
  position: relative;
  display: flex;
  gap: 10px;
  width: 100%;
}

.emoji-select-btn {
  flex: 0 0 50px;
  height: 44px;
  background: var(--bg-sub);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
}

.emoji-popover {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  z-index: 999;
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);

  width: 550px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  max-height: 200px;

  overflow-x: hidden;
  overflow-y: auto;
}

.emoji-item {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.emoji-item:hover {
  background: var(--bg-sub);
  transform: scale(1.1);
}

.solid-btn {
  height: 44px;
  padding: 0 20px;
  background: var(--point-gradient);
  color: #111621;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.full-width {
  width: 100%;
  margin-top: 10px;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  position: relative;
  z-index: 1;
}
.cat-tag {
  display: inline-flex;
  align-items: center;
  background: var(--bg-sub);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  border: 1px solid var(--border-color);
}

.del-cat-btn {
  background: none;
  border: none;
  color: var(--text-sub);
  margin-left: 6px;
  cursor: pointer;
}

.theme-toggle-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.theme-card {
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  text-align: center;
  background: var(--bg-sub);
  cursor: pointer;
}
.theme-card.active {
  border-color: var(--point-color);
  background: var(--point-color-hover);
  color: #111621;
}

@media (max-width: 600px) {
  .input-grid {
    grid-template-columns: 1fr;
  }
  .emoji-popover {
    width: 220px;
  }
}
</style>
