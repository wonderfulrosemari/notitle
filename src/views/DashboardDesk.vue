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
          <p>이번달 거래 건수</p>
          <strong>{{ currentMonthTransactions.length }}건</strong>
        </article>
        <article class="metric">
          <p>수입</p>
          <strong class="income">{{ formatWon(currentMonthIncome) }}</strong>
        </article>
        <article class="metric">
          <p>지출</p>
          <strong class="expense">{{ formatWon(currentMonthExpense) }}</strong>
        </article>
        <article class="metric">
          <p>잔액</p>
          <strong :class="currentMonthBalance >= 0 ? 'income' : 'expense'">
            {{ formatWon(currentMonthBalance) }}
          </strong>
        </article>
      </section>

      <section class="table-zone">
        <div class="table-tools">
          <span>최근 거래 내역</span>
          <button
            class="plain-btn"
            type="button"
            @click="ledger.fetchTransactions"
          >
            새로고침
          </button>
        </div>

        <table class="ledger-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>카테고리</th>
              <th class="amount-col">금액</th>
              <th>메모</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in recentTransactions" :key="item.id">
              <td>{{ item.date }}</td>
              <td>
                <span :class="['badge', item.type]">
                  {{ item.type === 'income' ? '수입' : '지출' }}
                </span>
                <span class="category-emoji">{{ item.emoji }}</span>
                {{ item.category }}
              </td>
              <td class="amount-col" :class="item.type">
                {{ item.type === 'income' ? '+' : '-' }}{{ formatWon(item.amount) }}
              </td>
              <td>{{ item.memo || '-' }}</td>
            </tr>

            <tr v-if="recentTransactions.length === 0">
              <td colspan="4" class="empty-row">
                {{
                  ledger.loading ? '불러오는 중입니다...' : '현재 월 데이터가 없습니다.'
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, nextTick } from 'vue';
import { useLedger } from '../composables/useLedger';
import { useSettings } from '../composables/useSettings';
import { useAuth } from '../composables/useAuth';

const ledger = useLedger();
const auth = useAuth();
const { budget, fetchUserBudget } = useSettings();

const normalizeDate = (value) => {
  if (!value) return '';
  return String(value).replace(/\./g, '-').slice(0, 10);
};

const getMonthKey = (dateValue) => {
  const normalized = normalizeDate(dateValue);
  if (!normalized) return '';

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const currentMonthKey = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
});

const allTransactions = computed(() => {
  if (Array.isArray(ledger.transactions)) return ledger.transactions;
  if (Array.isArray(ledger.transactions?.value)) return ledger.transactions.value;
  return [];
});

const currentMonthTransactions = computed(() => {
  return [...allTransactions.value]
    .filter((item) => getMonthKey(item.date) === currentMonthKey.value)
    .sort((a, b) => new Date(normalizeDate(b.date)) - new Date(normalizeDate(a.date)));
});

const recentTransactions = computed(() => {
  return currentMonthTransactions.value.slice(0, 10);
});

const currentMonthIncome = computed(() => {
  return currentMonthTransactions.value
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + Math.abs(Number(item.amount) || 0), 0);
});

const currentMonthExpense = computed(() => {
  return currentMonthTransactions.value
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + Math.abs(Number(item.amount) || 0), 0);
});

const currentMonthBalance = computed(() => {
  return currentMonthIncome.value - currentMonthExpense.value;
});

const dashboardStatus = computed(() => {
  return `${currentMonthKey.value} 기준 최근 ${recentTransactions.value.length}건을 표시 중입니다.`;
});

const checkBudgetExceeded = () => {
  if (budget.value > 0 && currentMonthExpense.value > budget.value) {
    setTimeout(() => {
      alert(
        `⚠️ 예산 초과 알림\n\n목표 예산(${budget.value.toLocaleString()}원)보다 ` +
          `현재 지출(${currentMonthExpense.value.toLocaleString()}원)이 더 많습니다.`,
      );
    }, 500);
  }
};

const formatNumber = (value) =>
  new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatWon = (value) => `${formatNumber(value)}원`;

onMounted(async () => {
  const userId = auth.state.currentUser?.id;
  if (!userId) return;

  try {
    await ledger.checkAndSyncRegulars();
    await Promise.all([ledger.fetchTransactions(), fetchUserBudget(userId)]);
    await nextTick();
    checkBudgetExceeded();
  } catch (error) {
    console.error('대시보드 로딩 중 오류:', error);
  }
});
</script>

<style scoped>
.category-emoji {
  margin-left: 4px;
  margin-right: 4px;
  font-size: 1.1em;
  vertical-align: middle;
}
</style>