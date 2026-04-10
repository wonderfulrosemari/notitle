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
        <div class="form-container budget-form">
          <div class="field">
            <label>총 지출액</label>
            <input
              type="number"
              min="0"
              v-model.number="budgetDraft"
              :disabled="!isBudgetAlertEnabled"
              placeholder="0"
              @change="handleBudgetChange"
            />
          </div>

          <div class="budget-actions">
            <button
              type="button"
              class="budget-switch"
              :class="{ active: isBudgetAlertEnabled }"
              :aria-pressed="isBudgetAlertEnabled"
              @click="handleToggleBudgetAlert"
            >
              <span class="budget-switch-track">
                <span class="budget-switch-thumb"></span>
              </span>
              <span class="budget-switch-label">
                {{ isBudgetAlertEnabled ? 'ON' : 'OFF' }}
              </span>
            </button>
          </div>
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
          <span class="label">정기결제 관리</span>
        </div>
        <span class="arrow">{{ activeMenu === 'regular' ? '▲' : '▼' }}</span>
      </div>

      <div v-if="activeMenu === 'regular'" class="item-content">
        <div class="form-container">
          <div class="input-grid">
            <div class="field">
              <label>결제일</label>
              <input
                v-model.number="newRegular.payDay"
                type="number"
                min="1"
                max="31"
                step="1"
                placeholder="1~31"
              />
              <small class="field-hint">29~31일은 해당 월 말일로 자동 적용됩니다.</small>
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
                  v-for="cat in regularCategoryOptions"
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

          <div class="settings-group">
            <p class="section-caption">등록된 정기결제</p>

            <div class="settings-subgroup">
              <p class="group-caption">지출</p>
              <div class="regular-tags">
                <div
                  v-for="item in expenseRegulars"
                  :key="item.id"
                  class="regular-tag"
                >
                  <span class="cat-tag-copy">
                    <span class="badge expense">지출</span>
                    매월 {{ item.payDay }}일
                    · {{ item.emoji }} {{ item.category }}
                    · {{ formatWon(item.amount) }}
                  </span>
                  <button
                    class="del-cat-btn"
                    type="button"
                    @click="handleDeleteRegular(item)"
                  >
                    ✕
                  </button>
                </div>
                <p v-if="expenseRegulars.length === 0" class="helper-text">
                  등록된 지출 정기결제가 없습니다.
                </p>
              </div>
            </div>

            <div class="settings-subgroup">
              <p class="group-caption">수입</p>
              <div class="regular-tags">
                <div
                  v-for="item in incomeRegulars"
                  :key="item.id"
                  class="regular-tag"
                >
                  <span class="cat-tag-copy">
                    <span class="badge income">수입</span>
                    매월 {{ item.payDay }}일
                    · {{ item.emoji }} {{ item.category }}
                    · {{ formatWon(item.amount) }}
                  </span>
                  <button
                    class="del-cat-btn"
                    type="button"
                    @click="handleDeleteRegular(item)"
                  >
                    ✕
                  </button>
                </div>
                <p v-if="incomeRegulars.length === 0" class="helper-text">
                  등록된 수입 정기결제가 없습니다.
                </p>
              </div>
            </div>
          </div>
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
          <select v-model="newCategory.type" class="category-type-select">
            <option value="expense">지출</option>
            <option value="income">수입</option>
          </select>
          <button @click="handleAddCategory" class="solid-btn">추가</button>
        </div>

        <div class="settings-group">
          <div class="settings-subgroup">
            <p class="group-caption">지출 카테고리</p>
            <div class="category-tags">
              <span
                v-for="cat in expenseCategories"
                :key="cat.id"
                class="cat-tag"
              >
                {{ cat.emoji }} {{ cat.name }}
                <button
                  class="del-cat-btn"
                  type="button"
                  @click="handleDeleteCategory(cat.id, cat.name)"
                >
                  ✕
                </button>
              </span>
            </div>
          </div>

          <div class="settings-subgroup">
            <p class="group-caption">수입 카테고리</p>
            <div class="category-tags">
              <span
                v-for="cat in incomeCategories"
                :key="cat.id"
                class="cat-tag"
              >
                {{ cat.emoji }} {{ cat.name }}
                <button
                  class="del-cat-btn"
                  type="button"
                  @click="handleDeleteCategory(cat.id, cat.name)"
                >
                  ✕
                </button>
              </span>
            </div>
          </div>

          <div v-if="commonCategories.length > 0" class="settings-subgroup">
            <p class="group-caption">공통 카테고리</p>
            <div class="category-tags">
              <span
                v-for="cat in commonCategories"
                :key="cat.id"
                class="cat-tag"
              >
                {{ cat.emoji || '✨' }} {{ cat.name }}
                <button
                  class="del-cat-btn"
                  type="button"
                  @click="handleDeleteCategory(cat.id, cat.name)"
                >
                  ✕
                </button>
              </span>
            </div>
          </div>
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
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import { useLedger } from '../composables/useLedger';
import { useSettings } from '../composables/useSettings';
import { useAuth } from '../composables/useAuth';

const ledger = useLedger();
const auth = useAuth();
const {
  budget,
  budgetAlertEnabled,
  fetchUserBudget,
  updateUserBudget,
  updateBudgetAlertEnabled,
} = useSettings();

const activeMenu = ref(null);
const currentUserId = computed(() => auth.state.currentUser?.id);
const budgetDraft = ref(0);
const isBudgetAlertEnabled = computed(() => budgetAlertEnabled.value);

const toggleMenu = (menuName) => {
  activeMenu.value = activeMenu.value === menuName ? null : menuName;
};

const clearBudgetAlertSession = () => {
  if (typeof window === 'undefined' || !currentUserId.value) return;
  window.sessionStorage.removeItem(`kb-budget-alert:${currentUserId.value}`);
};

const handleBudgetChange = async () => {
  if (!currentUserId.value) return;
  if (!isBudgetAlertEnabled.value) return;

  try {
    await updateUserBudget(
      currentUserId.value,
      Math.max(0, Number(budgetDraft.value) || 0),
    );
    clearBudgetAlertSession();
  } catch (error) {
    alert('저장에 실패했습니다.');
  }
};

const handleToggleBudgetAlert = async () => {
  if (!currentUserId.value) return;

  try {
    await updateUserBudget(
      currentUserId.value,
      Math.max(0, Number(budgetDraft.value) || 0),
    );
    await updateBudgetAlertEnabled(currentUserId.value, !isBudgetAlertEnabled.value);
    clearBudgetAlertSession();
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

const regularCategoryOptions = computed(() =>
  ledger.getCategoriesByType(newRegular.value.type),
);

const expenseRegulars = computed(() =>
  ledger.regulars.filter((item) => item.type === 'expense'),
);

const incomeRegulars = computed(() =>
  ledger.regulars.filter((item) => item.type === 'income'),
);

const expenseCategories = computed(() =>
  ledger.categories.filter((item) => item.type === 'expense'),
);

const incomeCategories = computed(() =>
  ledger.categories.filter((item) => item.type === 'income'),
);

const commonCategories = computed(() =>
  ledger.categories.filter((item) => item.type === 'common'),
);

const syncRegularCategory = () => {
  if (regularCategoryOptions.value.length === 0) {
    newRegular.value.category = '';
    return;
  }

  const hasCurrent = regularCategoryOptions.value.some(
    (item) => item.name === newRegular.value.category,
  );

  if (!hasCurrent) {
    newRegular.value.category = regularCategoryOptions.value[0].name;
  }
};

const formatWon = (value) =>
  `${new Intl.NumberFormat('ko-KR').format(Number(value || 0))}원`;

const handleAddRegular = async () => {
  if (newRegular.value.amount <= 0) return alert('금액을 입력하세요.');
  if (
    !Number.isInteger(Number(newRegular.value.payDay))
    || Number(newRegular.value.payDay) < 1
    || Number(newRegular.value.payDay) > 31
  ) {
    return alert('결제일은 1일부터 31일 사이로 입력하세요.');
  }
  try {
    const emoji =
      ledger.getEmojiByName(newRegular.value.category, newRegular.value.type)
      || '✨';
    const createdReg = await ledger.addRegular({
      ...newRegular.value,
      amount: Number(newRegular.value.amount),
      emoji: emoji,
    });

    const now = new Date();
    const targetDate = ledger.buildRegularTargetDate(
      now.getFullYear(),
      now.getMonth() + 1,
      newRegular.value.payDay,
    );

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

const handleDeleteRegular = async (item) => {
  if (!confirm(`'${item.category}' 정기결제를 삭제할까요?`)) return;

  try {
    await ledger.removeRegular(item.id);
  } catch (error) {
    alert(error.message || '정기결제 삭제 실패');
  }
};

const newCategory = ref({ name: '', emoji: '💰', type: 'expense' });
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
      type: newCategory.value.type,
    });
    newCategory.value.name = '';
    newCategory.value.emoji = '💰';
    newCategory.value.type = 'expense';
  } catch (error) {
    alert('카테고리 추가 실패');
  }
};

const handleDeleteCategory = async (id, name) => {
  if (confirm(`'${name}' 카테고리를 삭제할까요?`)) {
    try {
      await ledger.removeCategory(id);
    } catch (error) {
      alert(error.message || '삭제 실패');
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

watch(
  budget,
  (value) => {
    budgetDraft.value = Number(value) || 0;
  },
  { immediate: true },
);

watch(
  regularCategoryOptions,
  () => {
    syncRegularCategory();
  },
  { immediate: true },
);

onMounted(async () => {
  await Promise.all([ledger.fetchCategories(), ledger.fetchRegulars()]);
  if (currentUserId.value) await fetchUserBudget(currentUserId.value);

  const savedTheme = localStorage.getItem('app-theme') || 'dark';
  setTheme(savedTheme);

  syncRegularCategory();

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

.header-left {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.icon {
  display: inline-flex;
  align-items: center;
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

.field-hint {
  font-size: 11px;
  color: var(--text-sub);
}

.settings-group {
  display: grid;
  gap: 16px;
}

.settings-subgroup {
  display: grid;
  gap: 10px;
}

.section-caption,
.group-caption {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-title);
}

.helper-text {
  margin: 0;
  font-size: 12px;
  color: var(--text-sub);
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

input:disabled,
select:disabled {
  background: rgba(148, 163, 184, 0.12);
  color: var(--text-sub);
  border-color: var(--border-light);
  cursor: not-allowed;
  opacity: 0.7;
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

.category-type-select {
  flex: 0 0 110px;
}

.budget-form {
  gap: 16px;
}

.budget-actions {
  display: flex;
  justify-content: flex-end;
}

.budget-switch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-main);
  cursor: pointer;
  font-weight: 700;
}

.budget-switch-track {
  position: relative;
  width: 52px;
  height: 30px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.35);
  transition: background 0.2s ease;
}

.budget-switch-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.2);
  transition: transform 0.2s ease;
}

.budget-switch.active .budget-switch-track {
  background: var(--point-gradient);
}

.budget-switch.active .budget-switch-thumb {
  transform: translateX(22px);
}

.budget-switch-label {
  min-width: 34px;
  text-align: right;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.regular-tags {
  display: grid;
  gap: 8px;
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

.regular-tag {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--bg-sub);
  padding: 9px 12px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.cat-tag-copy {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
  color: var(--text-main);
  font-size: 13px;
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
