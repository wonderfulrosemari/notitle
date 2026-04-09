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
          <strong class="income">{{ formatWon(ledger.summary.income) }}</strong>
        </article>
        <article class="metric">
          <p>지출</p>
          <strong class="expense">{{
            formatWon(ledger.summary.expense)
          }}</strong>
        </article>
        <article class="metric">
          <p>여유</p>
          <strong :class="ledger.summary.balance >= 0 ? 'income' : 'expense'">
            {{ formatWon(ledger.summary.balance) }}
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
                {{ item.type === 'income' ? '+' : '-'
                }}{{ formatWon(item.amount) }}
              </td>
              <td>{{ item.memo || '-' }}</td>
            </tr>
            <tr v-if="recentTransactions.length === 0">
              <td colspan="4" class="empty-row">
                {{
                  ledger.loading ? '불러오는 중입니다...' : '데이터가 없습니다.'
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

// 예산 초과 체크 로직
const checkBudgetExceeded = () => {
  if (budget.value > 0 && ledger.summary.expense > budget.value) {
    setTimeout(() => {
      alert(
        `⚠️ 예산 초과 알림\n\n목표 예산(${budget.value.toLocaleString()}원)보다 ` +
          `현재 지출(${ledger.summary.expense.toLocaleString()}원)이 더 많습니다.`,
      );
    }, 500);
  }
};

const recentTransactions = computed(() => {
  return ledger.filteredTransactions.slice(0, 10);
});

// 대시보드 상태 메시지 (필요시 사용)
const dashboardStatus = computed(() => {
  return `최근 ${recentTransactions.value.length}건을 표시 중입니다.`;
});

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
