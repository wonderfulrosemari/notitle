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
          <input v-model="ledger.state.search" type="search" placeholder="메모/카테고리" />
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
          <colgroup>
            <col class="select-col" />
            <col class="main-col" />
            <col class="main-col" />
            <col class="main-col" />
            <col class="main-col" />
            <col class="main-col" />
          </colgroup>
          <thead>
            <tr>
              <th class="select-col"></th>
              <th class="date-col">
                <button class="sort-trigger" type="button" @click="ledger.toggleSort('date')">
                  날짜 <span class="sort-mark">{{ ledger.sortMark('date') }}</span>
                </button>
              </th>
              <th class="category-col">
                <button class="sort-trigger" type="button" @click="ledger.toggleSort('category')">
                  카테고리 <span class="sort-mark">{{ ledger.sortMark('category') }}</span>
                </button>
              </th>
              <th class="amount-col">
                <button class="sort-trigger amount-sort" type="button" @click="ledger.toggleSort('amount')">
                  금액 <span class="sort-mark">{{ ledger.sortMark('amount') }}</span>
                </button>
              </th>
              <th class="memo-col">
                <button class="sort-trigger" type="button" @click="ledger.toggleSort('memo')">
                  메모 <span class="sort-mark">{{ ledger.sortMark('memo') }}</span>
                </button>
              </th>
              <th class="actions-col">수정</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in ledger.pagedTransactions" :key="item.id">
              <td class="select-col">
                <input
                  type="checkbox"
                  :checked="ledger.state.selectedIds.includes(item.id)"
                  @change="ledger.toggleSelection(item.id)"
                />
              </td>
              <td class="date-col">{{ item.date }}</td>
              <td class="category-col">
                <span class="category-cell">
                  <span :class="['badge', item.type]">
                    {{ item.type === 'income' ? '수입' : '지출' }}
                  </span>
                  <span>{{ item.category }}</span>
                </span>
              </td>
              <td class="amount-col" :class="item.type">
                {{ item.type === 'income' ? '+' : '-' }}{{ formatCurrency(item.amount) }}
              </td>
              <td class="memo-col">{{ item.memo || '-' }}</td>
              <td class="actions actions-col">
                <button class="table-btn" type="button" @click="openEdit(item)">편집</button>
                <button class="table-btn danger" type="button" @click="removeOne(item.id)">삭제</button>
              </td>
            </tr>
            <tr v-if="ledger.pagedTransactions.length === 0">
              <td colspan="6" class="empty-row">
                {{ ledger.loading ? '불러오는 중입니다...' : '데이터가 없습니다.' }}
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="ledger.totalPages > 1" class="pagination">
          <button
            class="page-btn"
            type="button"
            :disabled="ledger.state.page === 1"
            @click="ledger.prevPage"
          >
            이전
          </button>
          <button
            v-for="page in ledger.pageNumbers"
            :key="`page-${page}`"
            class="page-btn"
            :class="{ active: page === ledger.state.page }"
            type="button"
            @click="ledger.goToPage(page)"
          >
            {{ page }}
          </button>
          <button
            class="page-btn"
            type="button"
            :disabled="ledger.state.page === ledger.totalPages"
            @click="ledger.nextPage"
          >
            다음
          </button>
        </div>
      </section>
    </section>

    <div class="fab-stack">
      <button class="fab primary" type="button" @click="openCreate">+</button>
    </div>

    <section v-if="isModalOpen" class="modal-root" @click.self="closeModal">
      <form class="modal-card" @submit.prevent="submitForm">
        <div class="modal-head">
          <h2>{{ mode === 'create' ? '거래 추가' : '거래 수정' }}</h2>
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
            <input v-model="form.memo" type="text" placeholder="거래 메모" />
          </label>
        </div>

        <p class="form-status">{{ formStatus }}</p>

        <div class="modal-actions">
          <button class="plain-btn" type="button" @click="closeModal">취소</button>
          <button class="solid-btn" type="submit">{{ mode === 'create' ? '저장' : '수정 저장' }}</button>
        </div>
      </form>
    </section>

    <section v-if="isConfirmOpen" class="modal-root" @click.self="closeConfirmDialog">
      <div class="modal-card confirm-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div class="modal-head">
          <h2 id="confirm-title">{{ confirmTitle }}</h2>
        </div>

        <p class="confirm-message">{{ confirmMessage }}</p>

        <div class="modal-actions">
          <button class="plain-btn" type="button" :disabled="confirmLoading" @click="closeConfirmDialog">
            취소
          </button>
          <button class="danger-btn" type="button" :disabled="confirmLoading" @click="runConfirmAction">
            {{ confirmLoading ? '삭제 중...' : '삭제' }}
          </button>
        </div>
      </div>
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
const isConfirmOpen = ref(false)
const confirmTitle = ref('삭제 확인')
const confirmMessage = ref('')
const confirmLoading = ref(false)
const formStatus = ref('필수값을 입력한 뒤 저장하세요.')

let pendingConfirmAction = null

const form = reactive({
  date: '',
  type: 'expense',
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
  form.category = item.category
  form.amount = item.amount
  form.memo = item.memo
  formStatus.value = '거래를 수정합니다.'
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const openConfirmDialog = ({ title = '삭제 확인', message, onConfirm }) => {
  confirmTitle.value = title
  confirmMessage.value = message
  pendingConfirmAction = onConfirm
  isConfirmOpen.value = true
}

const closeConfirmDialog = () => {
  if (confirmLoading.value) return
  isConfirmOpen.value = false
  confirmTitle.value = '삭제 확인'
  confirmMessage.value = ''
  pendingConfirmAction = null
}

const runConfirmAction = async () => {
  if (!pendingConfirmAction) {
    closeConfirmDialog()
    return
  }

  confirmLoading.value = true
  let shouldClose = true

  try {
    shouldClose = (await pendingConfirmAction()) !== false
  } finally {
    confirmLoading.value = false
  }

  if (shouldClose && isConfirmOpen.value) {
    closeConfirmDialog()
  }
}

const validateForm = () => {
  if (!form.date) {
    formStatus.value = '날짜를 입력하세요.'
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

const removeOne = (id) => {
  openConfirmDialog({
    message: '이 내역을 삭제할까요?',
    onConfirm: async () => {
      try {
        await ledger.removeTransaction(id)
        return true
      } catch (error) {
        formStatus.value = `삭제 실패: ${error.message}`
        return false
      }
    },
  })
}

const removeSelected = () => {
  const count = ledger.selectedCount
  if (count === 0) return

  openConfirmDialog({
    message: `선택한 ${count}건을 삭제할까요?`,
    onConfirm: async () => {
      try {
        await ledger.removeSelected()
        return true
      } catch (error) {
        formStatus.value = `선택 삭제 실패: ${error.message}`
        return false
      }
    },
  })
}

const formatCurrency = (value) =>
  `${new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: 0,
  }).format(value || 0)}원`

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
