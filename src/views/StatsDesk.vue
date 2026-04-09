<template>
  <main class="ledger-page">
    <section class="ledger-shell">
      <header class="ledger-top">
        <div class="title-wrap">
          <p class="title">통계</p>
          <p class="subtitle">{{ statsStatus }}</p>
        </div>

        <div class="month-controls">
          <button class="icon-btn" type="button" @click="ledger.moveMonth(-1)">&#60;</button>
          <div class="month-chip">{{ monthLabel }}</div>
          <button class="icon-btn" type="button" @click="ledger.moveMonth(1)">&#62;</button>
          <button class="plain-btn" type="button" @click="ledger.focusCurrentMonth">이번 달</button>
        </div>
      </header>

      <section class="summary-cards stats-summary-cards">
        <article class="metric">
          <p>전체 ({{ monthTransactions.length }})</p>
          <strong>{{ formatWon(monthSummary.total) }}</strong>
        </article>
        <article class="metric">
          <p>수입</p>
          <strong class="income">{{ formatWon(monthSummary.income) }}</strong>
        </article>
        <article class="metric">
          <p>지출</p>
          <strong class="expense">{{ formatWon(monthSummary.expense) }}</strong>
        </article>
        <article class="metric">
          <p>여유</p>
          <strong :class="monthSummary.balance >= 0 ? 'income' : 'expense'">
            {{ formatWon(monthSummary.balance) }}
          </strong>
        </article>
      </section>

      <section class="stats-grid">
        <article class="stats-panel stats-panel-wide">
          <div class="stats-panel-head">
            <h3>{{ selectedYear }}년 월별 지출 추이</h3>
          </div>

          <div class="stats-chart-box stats-line-box">
            <Line :key="lineChartKey" :data="lineChartData" :options="lineChartOptions" />
          </div>
        </article>

        <article class="stats-panel">
          <div class="stats-panel-head">
            <h3>{{ monthLabel }} 지출 카테고리 비율</h3>
          </div>

          <div v-if="topCategoryBreakdown.length > 0" class="stats-pie-layout">
            <div class="stats-pie-canvas">
              <Pie :data="pieChartData" :options="pieChartOptions" />
            </div>

            <div class="stats-pie-legend">
              <button
                v-for="item in topCategoryBreakdown"
                :key="item.category"
                type="button"
                class="stats-pie-legend-row"
                :class="{ active: selectedCategory === item.category }"
                @click="toggleCategory(item.category)"
              >
                <div class="stats-pie-legend-left">
                  <span
                    class="stats-color-dot"
                    :style="{ backgroundColor: item.color }"
                  ></span>
                  <span class="stats-pie-label">{{ item.category }}</span>
                </div>
                <strong>{{ item.topPercent }}%</strong>
              </button>
            </div>
          </div>

          <div v-else class="stats-empty">
            이번 달 지출 데이터가 없습니다.
          </div>
        </article>

        <article class="stats-panel">
          <div class="stats-panel-head">
            <h3>상세 내역</h3>
            <select v-model="selectedCategory" class="stats-select">
              <option value="all">전체 카테고리</option>
              <option
                v-for="item in categoryBreakdown"
                :key="item.category"
                :value="item.category"
              >
                {{ item.category }}
              </option>
            </select>
          </div>

          <div v-if="detailRows.length > 0" class="stats-detail-list">
            <button
              v-for="item in detailRows"
              :key="item.category"
              type="button"
              class="stats-detail-row"
              :class="{ active: selectedCategory === item.category }"
              @click="toggleCategory(item.category)"
            >
              <div class="stats-detail-left">
                <span
                  class="stats-color-dot"
                  :style="{ backgroundColor: item.color }"
                ></span>

                <div class="stats-detail-text">
                  <strong>{{ item.category }}</strong>
                  <span>{{ item.count }}건 · {{ item.percent }}%</span>
                </div>
              </div>

              <strong class="stats-detail-amount">{{ formatWon(item.amount) }}</strong>
            </button>
          </div>

          <div v-else class="stats-empty">
            표시할 카테고리가 없습니다.
          </div>
        </article>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Line, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js'
import { useLedger } from '../composables/useLedger'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement
)

const ledger = useLedger()
const selectedCategory = ref('all')
const lineChartKey = ref(0)

let themeObserver = null

const pieColors = [
  '#f4d13d',
  '#ff6b6b',
  '#4da3ff',
  '#8b7cf8',
  '#43c59e',
  '#ff9f40',
  '#7fd1ff',
  '#f472b6'
]

const allTransactions = computed(() => {
  if (Array.isArray(ledger.transactions)) return ledger.transactions
  if (Array.isArray(ledger.state?.transactions)) return ledger.state.transactions
  if (Array.isArray(ledger.filteredTransactions)) return ledger.filteredTransactions
  return []
})

const monthLabels = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
]

const monthLabel = computed(() => {
  const [year, month] = ledger.state.monthCursor.split('-')
  return `${year}-${month}`
})

const selectedYear = computed(() => {
  return Number(ledger.state.monthCursor.split('-')[0])
})

const selectedMonthKey = computed(() => ledger.state.monthCursor)

const monthTransactions = computed(() => {
  return allTransactions.value.filter((item) => item.date?.startsWith(selectedMonthKey.value))
})

const monthIncomeTransactions = computed(() => {
  return monthTransactions.value.filter(
    (item) => String(item.type).toLowerCase() === 'income'
  )
})

const monthExpenseTransactions = computed(() => {
  return monthTransactions.value.filter(
    (item) => String(item.type).toLowerCase() === 'expense'
  )
})

const monthSummary = computed(() => {
  const income = monthIncomeTransactions.value.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  )

  const expense = monthExpenseTransactions.value.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  )

  return {
    total: income + expense,
    income,
    expense,
    balance: income - expense
  }
})

const categoryBreakdown = computed(() => {
  const grouped = {}

  monthExpenseTransactions.value.forEach((item) => {
    const key = item.category || '기타'

    if (!grouped[key]) {
      grouped[key] = {
        category: key,
        amount: 0,
        count: 0
      }
    }

    grouped[key].amount += Number(item.amount) || 0
    grouped[key].count += 1
  })

  const totalExpense = monthSummary.value.expense || 0

  return Object.values(grouped)
    .sort((a, b) => b.amount - a.amount)
    .map((item, index) => ({
      ...item,
      color: pieColors[index % pieColors.length],
      percent: totalExpense === 0
        ? 0
        : Number(((item.amount / totalExpense) * 100).toFixed(1))
    }))
})

const topCategoryBreakdown = computed(() => {
  const top3 = categoryBreakdown.value.slice(0, 3)
  const top3Total = top3.reduce((sum, item) => sum + item.amount, 0)

  return top3.map((item) => ({
    ...item,
    topPercent: top3Total === 0
      ? 0
      : Number(((item.amount / top3Total) * 100).toFixed(1))
  }))
})

const detailRows = computed(() => {
  if (selectedCategory.value === 'all') {
    return categoryBreakdown.value
  }

  return categoryBreakdown.value.filter(
    (item) => item.category === selectedCategory.value
  )
})

const yearlyExpenseTotals = computed(() => {
  const totals = Array(12).fill(0)

  allTransactions.value.forEach((item) => {
    if (!item?.date) return

    const date = new Date(item.date)
    if (Number.isNaN(date.getTime())) return
    if (date.getFullYear() !== selectedYear.value) return
    if (String(item.type).toLowerCase() !== 'expense') return

    const monthIndex = date.getMonth()
    totals[monthIndex] += Number(item.amount) || 0
  })

  return totals
})

const lineChartData = computed(() => {
  return {
    labels: monthLabels,
    datasets: [
      {
        label: '지출',
        data: yearlyExpenseTotals.value,
        borderColor: '#ff7c8e',
        backgroundColor: '#ff7c8e',
        pointBackgroundColor: '#ff7c8e',
        pointBorderColor: '#ff7c8e',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
        fill: false
      }
    ]
  }
})

const pieChartData = computed(() => {
  return {
    labels: topCategoryBreakdown.value.map((item) => item.category),
    datasets: [
      {
        data: topCategoryBreakdown.value.map((item) => item.amount),
        backgroundColor: topCategoryBreakdown.value.map((item) => item.color),
        borderColor: topCategoryBreakdown.value.map((item) =>
          selectedCategory.value === item.category ? '#ffffff' : '#111621'
        ),
        borderWidth: topCategoryBreakdown.value.map((item) =>
          selectedCategory.value === item.category ? 3 : 0
        ),
        offset: topCategoryBreakdown.value.map((item) =>
          selectedCategory.value === item.category ? 12 : 0
        )
      }
    ]
  }
})

const lineChartOptions = computed(() => {
  lineChartKey.value

  const isLightMode = document.body.classList.contains('theme-kb')

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isLightMode ? '#0f172a' : '#dce6ff'
        }
      },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.dataset.label}: ${formatWon(context.raw)}`
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: isLightMode ? '#0f172a' : '#b7c4e0'
        },
        grid: {
          color: isLightMode
            ? 'rgba(15, 23, 42, 0.08)'
            : 'rgba(255,255,255,0.08)'
        }
      },
      y: {
        ticks: {
          color: isLightMode ? '#0f172a' : '#b7c4e0',
          callback(value) {
            return formatNumber(value)
          }
        },
        grid: {
          color: isLightMode
            ? 'rgba(15, 23, 42, 0.08)'
            : 'rgba(255,255,255,0.08)'
        }
      }
    }
  }
})

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label(context) {
          const raw = Number(context.raw || 0)
          const total = topCategoryBreakdown.value.reduce(
            (sum, item) => sum + item.amount,
            0
          )
          const percent = total === 0 ? 0 : ((raw / total) * 100).toFixed(1)
          return `${context.label}: ${formatWon(raw)} (${percent}%)`
        }
      }
    }
  },
  onClick(_, elements) {
    if (!elements.length) return

    const index = elements[0].index
    const target = topCategoryBreakdown.value[index]
    if (!target) return

    toggleCategory(target.category)
  }
}

const toggleCategory = (category) => {
  selectedCategory.value =
    selectedCategory.value === category ? 'all' : category
}

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString('ko-KR')
}

const formatWon = (value) => {
  return `${formatNumber(value)}원`
}

const statsStatus = computed(() => {
  return `${monthLabel.value} 기준 거래 ${monthTransactions.value.length}건을 집계했습니다.`
})

watch(
  categoryBreakdown,
  (items) => {
    if (selectedCategory.value === 'all') return

    const exists = items.some((item) => item.category === selectedCategory.value)
    if (!exists) {
      selectedCategory.value = 'all'
    }
  },
  { immediate: true }
)

onMounted(async () => {
  await ledger.fetchTransactions()

  lineChartKey.value += 1

  themeObserver = new MutationObserver(() => {
    lineChartKey.value += 1
  })

  themeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  })
})

onBeforeUnmount(() => {
  if (themeObserver) {
    themeObserver.disconnect()
  }
})
</script>