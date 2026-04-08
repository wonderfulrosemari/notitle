<template>
  <main class="ledger-page">
    <section class="ledger-shell">
      <header class="ledger-top">
        <div class="title-wrap">
          <p class="title">대시보드</p>
          <p class="subtitle">{{ dashboardStatus }}</p>
        </div>
      </header>

      <section class="summary-cards dashboard-summary-cards">
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
            </tr>
            <tr v-if="recentTransactions.length === 0">
              <td colspan="5" class="empty-row">
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
import { useLedger } from '../composables/useLedger'

const ledger = useLedger()

const recentTransactions = computed(() => {
  return ledger.filteredTransactions.slice(0, 10)
})

const dashboardStatus = computed(() => {
  return `총 ${ledger.filteredTransactions.length}건 중 최근 ${recentTransactions.value.length}건을 표시하고 있습니다.`
})

const formatNumber = (value) =>
  new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: 0,
  }).format(value || 0)

onMounted(async () => {
  await ledger.fetchTransactions()
})
</script>