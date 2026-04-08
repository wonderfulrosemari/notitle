<template>
  <main class="ledger-page">
    <section class="ledger-shell">
      <header class="ledger-top">
        <div class="title-wrap">
          <p class="title">내역</p>
          <p class="subtitle">{{ ledger.statusMessage }}</p>
        </div>

        <div class="month-controls">
          <button class="icon-btn" type="button" @click="ledger.moveMonth(-1)">&#60;</button>
          <div class="month-chip">{{ monthLabel }}</div>
          <button class="icon-btn" type="button" @click="ledger.moveMonth(1)">&#62;</button>
        </div>
      </header>

      <section class="filters">
        <label class="search">
          검색
          <input v-model="ledger.state.search" type="search" placeholder="메모/분류/자산" />
        </label>
      </section>

      <section class="table-zone">
        <div class="table-tools">
          <label class="checkbox-wrap">
            <input
              type="checkbox"
              :checked="ledger.allSelected"
              @change="ledger.selectAllVisible($event.target.checked)"
            />
            전체 선택
          </label>
          <button
            class="danger-btn"
            type="button"
            :disabled="ledger.selectedCount === 0"
            @click="removeSelected"
          >
            선택 삭제 ({{ ledger.selectedCount }})
          </button>
          <span v-if="ledger.currentRange" class="range-text">
            {{ ledger.currentRange.start }} ~ {{ ledger.currentRange.end }}
          </span>
        </div>

        <table class="ledger-table">
          <thead>
            <tr>
              <th></th>
              <th>날짜</th>
              <th>자산</th>
              <th>분류</th>
              <th class="amount-col">금액</th>
              <th>내용</th>
              <th>동작</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in ledger.filteredTransactions" :key="item.id">
              <td>
                <input
                  type="checkbox"
                  :checked="ledger.state.selectedIds.includes(item.id)"
                  @change="ledger.toggleSelection(item.id)"
                />
              </td>
              <td>{{ item.date }}</td>
              <td>{{ item.asset }}</td>
              <td>
                <span :class="['badge', item.type]">
                  {{ item.type === 'income' ? '수입' : '지출' }}
                </span>
                {{ item.category }}
              </td>
              <td class="amount-col" :class="item.type">
                {{ item.type === 'income' ? '+' : '-' }}{{ formatCurrency(item.amount) }}
              </td>
              <td>{{ item.memo || '-' }}</td>
              <td class="actions">
                <button class="table-btn" type="button" @click="openEdit(item)">편집</button>
                <button class="table-btn danger" type="button" @click="removeOne(item.id)">삭제</button>
              </td>
            </tr>
            <tr v-if="ledger.filteredTransactions.length === 0">
              <td colspan="7" class="empty-row">
                {{ ledger.loading ? '불러오는 중입니다...' : '데이터가 없습니다.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>

    <div class="fab-stack">
      <button class="fab primary" type="button" @click="openCreate">+</button>
    </div>

    <section v-if="isModalOpen" class="modal-root" @click.self="closeModal">
      <form class="modal-card" @submit.prevent="submitForm">
        <div class="modal-head">
          <h2>{{ mode === 'create' ? '거래 추가' : '거래 수정' }}</h2>
          <button class="plain-btn" type="button" @click="closeModal">닫기</button>
        </div>

        <div class="form-grid">
          <label>
            날짜
            <input v-model="form.date" type="date" required />
          </label>
          <label>
            유형
            <select v-model="form.type">
              <option value="income">수입</option>
              <option value="expense">지출</option>
            </select>
          </label>
          <label>
            자산
            <input v-model="form.asset" type="text" placeholder="예: 체크카드" required />
          </label>
          <label>
            카테고리
            <select v-model="form.category">
              <option v-for="category in formCategoryOptions" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </label>
          <label>
            금액
            <input v-model.number="form.amount" type="number" min="1" required />
          </label>
          <label class="full-width">
            메모
            <input v-model="form.memo" type="text" placeholder="거래 내용 메모" />
          </label>
        </div>

        <p class="form-status">{{ formStatus }}</p>

        <div class="modal-actions">
          <button class="plain-btn" type="button" @click="closeModal">취소</button>
          <button class="solid-btn" type="submit">{{ mode === 'create' ? '저장' : '수정 저장' }}</button>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useLedger } from '../composables/useLedger'

const ledger = useLedger()

const mode = ref('create')
const editingId = ref('')
const isModalOpen = ref(false)
const formStatus = ref('필수값을 입력한 뒤 저장하세요.')

const form = reactive({
  date: '',
  type: 'expense',
  asset: '현금',
  category: '식비',
  amount: 0,
  memo: '',
})

const monthLabel = computed(() => {
  const [year, month] = ledger.state.monthCursor.split('-')
  return `${year}-${month}`
})

const formCategoryOptions = computed(() => {
  const defaults =
    form.type === 'income' ? ledger.defaultIncomeCategories : ledger.defaultCategories
  const fromData = ledger.categoryOptions.filter((category) => defaults.includes(category))
  return [...new Set([...defaults, ...fromData])]
})

const resetForm = () => {
  const today = new Date().toISOString().slice(0, 10)
  form.date = today
  form.type = 'expense'
  form.asset = '현금'
  form.category = '식비'
  form.amount = 0
  form.memo = ''
}

const openCreate = () => {
  mode.value = 'create'
  editingId.value = ''
  resetForm()
  formStatus.value = ''
  isModalOpen.value = true
}

const openEdit = (item) => {
  mode.value = 'edit'
  editingId.value = item.id
  form.date = item.date
  form.type = item.type
  form.asset = item.asset
  form.category = item.category
  form.amount = item.amount
  form.memo = item.memo
  formStatus.value = '거래를 수정합니다.'
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const validateForm = () => {
  if (!form.date) {
    formStatus.value = '날짜를 입력하세요.'
    return false
  }
  if (!form.asset.trim()) {
    formStatus.value = '자산 항목을 입력하세요.'
    return false
  }
  if (!form.category.trim()) {
    formStatus.value = '카테고리를 입력하세요.'
    return false
  }
  if (!Number(form.amount) || Number(form.amount) <= 0) {
    formStatus.value = '금액은 0보다 커야 합니다.'
    return false
  }
  return true
}

const submitForm = async () => {
  if (!validateForm()) return

  const payload = {
    date: form.date,
    type: form.type,
    asset: form.asset.trim(),
    category: form.category.trim(),
    amount: Number(form.amount),
    memo: form.memo.trim(),
  }

  try {
    if (mode.value === 'create') {
      await ledger.addTransaction(payload)
    } else {
      await ledger.updateTransaction(editingId.value, payload)
    }
    closeModal()
  } catch (error) {
    formStatus.value = `저장 실패: ${error.message}`
  }
}

const removeOne = async (id) => {
  try {
    await ledger.removeTransaction(id)
  } catch (error) {
    formStatus.value = `삭제 실패: ${error.message}`
  }
}

const removeSelected = async () => {
  try {
    await ledger.removeSelected()
  } catch (error) {
    formStatus.value = `선택 삭제 실패: ${error.message}`
  }
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value || 0)

watch(
  () => form.type,
  (type) => {
    if (type === 'income' && !ledger.defaultIncomeCategories.includes(form.category)) {
      form.category = ledger.defaultIncomeCategories[0]
    }
    if (type === 'expense' && !ledger.defaultCategories.includes(form.category)) {
      form.category = ledger.defaultCategories[0]
    }
  },
)

onMounted(async () => {
  resetForm()
  await ledger.fetchTransactions()
})
</script>
