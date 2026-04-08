<template>
  <main class="ledger-page">
    <section class="ledger-shell">
      <header class="ledger-top">
        <div class="title-wrap">
          <p class="title">대시보드</p>
          <p class="subtitle">{{ ledger.statusMessage }}</p>
        </div>
      </header>

      <section class="summary-cards">
        <article class="metric">
          <p>전체(항목수)</p>
          <strong>{{ ledger.filteredTransactions.length }}건</strong>
        </article>
        <article class="metric">
          <p>수입</p>
          <strong class="income">{{ formatNumber(ledger.summary.income) }}</strong>
        </article>
        <article class="metric">
          <p>지출</p>
          <strong class="expense">{{ formatNumber(ledger.summary.expense) }}</strong>
        </article>
        <article class="metric">
          <p>여유</p>
          <strong :class="ledger.summary.balance >= 0 ? 'income' : 'expense'">
            {{ formatNumber(ledger.summary.balance) }}
          </strong>
        </article>
      </section>

      <section class="table-zone">
        <div class="table-tools">
          <span>최근 거래 내역</span>
          <button class="plain-btn" type="button" @click="ledger.fetchTransactions">새로고침</button>
        </div>

        <table class="ledger-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>자산</th>
              <th>분류</th>
              <th class="amount-col">금액</th>
              <th>내용</th>
              <th>동작</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in recentTransactions" :key="item.id">
              <td>{{ item.date }}</td>
              <td>{{ item.asset }}</td>
              <td>
                <span :class="['badge', item.type]">
                  {{ item.type === 'income' ? '수입' : '지출' }}
                </span>
                {{ item.category }}
              </td>
              <td class="amount-col" :class="item.type">
                {{ item.type === 'income' ? '+' : '-' }}{{ formatNumber(item.amount) }}
              </td>
              <td>{{ item.memo || '-' }}</td>
              <td class="actions">
                <button class="table-btn" type="button" @click="goLedgerEdit">편집</button>
                <button class="table-btn danger" type="button" @click="removeOne(item.id)">삭제</button>
              </td>
            </tr>

            <tr v-if="recentTransactions.length === 0">
              <td colspan="6" class="empty-row">
                {{ ledger.loading ? '불러오는 중입니다...' : '데이터가 없습니다.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLedger } from '../composables/useLedger'

const ledger = useLedger()
const router = useRouter()

const recentTransactions = computed(() => {
  return ledger.filteredTransactions.slice(0, 10)
})

const formatNumber = (value) =>
  new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: 0,
  }).format(value || 0)

const removeOne = async (id) => {
  try {
    await ledger.removeTransaction(id)
    await ledger.fetchTransactions()
  } catch (error) {
    console.error('삭제 실패:', error)
  }
}

const goLedgerEdit = () => {
  router.push('/ledger')
}

onMounted(async () => {
  await ledger.fetchTransactions()
})
</script>