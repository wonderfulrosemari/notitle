<template>
  <div class="stats-page">
    <div class="stats-card">
      <div class="stats-header">
        <div>
          <h1>통계</h1>
          <p>월별 수입과 지출 흐름을 확인할 수 있습니다.</p>
        </div>

        <div class="month-controls">
          <button class="nav-btn" @click="selectedYear--">&lt;</button>
          <div class="month-box">{{ selectedYear }}</div>
          <button class="nav-btn" @click="selectedYear++">&gt;</button>
          <button class="current-btn" @click="goCurrentYear">이번 달</button>
        </div>
      </div>

      <div class="summary-row">
        <div class="summary-item">
          <span>총 수입</span>
          <strong>{{ formatCurrency(totalIncome) }}</strong>
        </div>
        <div class="summary-item">
          <span>총 지출</span>
          <strong class="expense">{{ formatCurrency(totalExpense) }}</strong>
        </div>
        <div class="summary-item">
          <span>순이익</span>
          <strong>{{ formatCurrency(netIncome) }}</strong>
        </div>
      </div>

      <div class="chart-section">
        <div class="chart-box">
          <h2>월별 수입/지출 선 그래프</h2>
          <div class="real-chart-area">
            <Line :data="lineChartData" :options="lineChartOptions" />
          </div>
        </div>

        <div class="chart-box">
          <h2>카테고리별 지출 원 그래프</h2>
          <div class="real-chart-area pie-area">
            <Pie :data="pieChartData" :options="pieChartOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
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

const API_BASE = 'http://localhost:3000'
const budgetList = ref([])
const selectedYear = ref(new Date().getFullYear())

const monthLabels = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
]

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

const loadBudget = async () => {
  try {
    const response = await axios.get(`${API_BASE}/budget`)
    budgetList.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('budget 데이터를 불러오지 못했습니다.', error)
    budgetList.value = []
  }
}

const currentYearRows = computed(() => {
  return budgetList.value.filter((item) => {
    if (!item?.date) return false
    const date = new Date(item.date)
    if (Number.isNaN(date.getTime())) return false
    return date.getFullYear() === selectedYear.value
  })
})

const currentYearIncomeRows = computed(() => {
  return currentYearRows.value.filter(
    (item) => String(item.type).toLowerCase() === 'income'
  )
})

const currentYearExpenseRows = computed(() => {
  return currentYearRows.value.filter(
    (item) => String(item.type).toLowerCase() === 'expense'
  )
})

const totalIncome = computed(() => {
  return currentYearIncomeRows.value.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  )
})

const totalExpense = computed(() => {
  return currentYearExpenseRows.value.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  )
})

const netIncome = computed(() => {
  return totalIncome.value - totalExpense.value
})

const monthlyIncomeTotals = computed(() => {
  const totals = Array(12).fill(0)

  currentYearIncomeRows.value.forEach((item) => {
    const monthIndex = new Date(item.date).getMonth()
    totals[monthIndex] += Number(item.amount) || 0
  })

  return totals
})

const monthlyExpenseTotals = computed(() => {
  const totals = Array(12).fill(0)

  currentYearExpenseRows.value.forEach((item) => {
    const monthIndex = new Date(item.date).getMonth()
    totals[monthIndex] += Number(item.amount) || 0
  })

  return totals
})

const categoryExpenseSummary = computed(() => {
  const categoryMap = {}

  currentYearExpenseRows.value.forEach((item) => {
    const key = item.category || '기타'
    categoryMap[key] = (categoryMap[key] || 0) + (Number(item.amount) || 0)
  })

  return Object.entries(categoryMap).map(([name, amount], index) => ({
    name,
    amount,
    color: pieColors[index % pieColors.length]
  }))
})

const lineChartData = computed(() => {
  return {
    labels: monthLabels,
    datasets: [
      {
        label: '수입',
        data: monthlyIncomeTotals.value,
        borderColor: '#69b8ff',
        backgroundColor: '#69b8ff',
        pointBackgroundColor: '#69b8ff',
        pointBorderColor: '#69b8ff',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35
      },
      {
        label: '지출',
        data: monthlyExpenseTotals.value,
        borderColor: '#ff7c8e',
        backgroundColor: '#ff7c8e',
        pointBackgroundColor: '#ff7c8e',
        pointBorderColor: '#ff7c8e',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35
      }
    ]
  }
})

const pieChartData = computed(() => {
  return {
    labels: categoryExpenseSummary.value.map((item) => item.name),
    datasets: [
      {
        data: categoryExpenseSummary.value.map((item) => item.amount),
        backgroundColor: categoryExpenseSummary.value.map((item) => item.color),
        borderWidth: 0
      }
    ]
  }
})

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#dce6ff'
      }
    },
    tooltip: {
      callbacks: {
        label(context) {
          return `${context.dataset.label}: ${Number(context.raw).toLocaleString()}원`
        }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#b7c4e0'
      },
      grid: {
        color: 'rgba(255,255,255,0.08)'
      }
    },
    y: {
      ticks: {
        color: '#b7c4e0',
        callback(value) {
          return Number(value).toLocaleString()
        }
      },
      grid: {
        color: 'rgba(255,255,255,0.08)'
      }
    }
  }
}

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: '#dce6ff'
      }
    },
    tooltip: {
      callbacks: {
        label(context) {
          return `${context.label}: ${Number(context.raw).toLocaleString()}원`
        }
      }
    }
  }
}

const formatCurrency = (value) => {
  return `₩${Number(value || 0).toLocaleString()}`
}

const goCurrentYear = () => {
  selectedYear.value = new Date().getFullYear()
}

onMounted(() => {
  loadBudget()
})
</script>

<style scoped>
.stats-page {
  min-height: 100vh;
  padding: 20px;
  background: radial-gradient(circle at center, #1d2740 0%, #0b1020 70%);
  color: #e8eefc;
}

.stats-card {
  width: 100%;
  border: 1px solid rgba(112, 140, 196, 0.25);
  border-radius: 20px;
  background: rgba(7, 13, 28, 0.85);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
  overflow: hidden;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 24px 28px 20px;
  border-bottom: 1px solid rgba(112, 140, 196, 0.16);
}

.stats-header h1 {
  margin: 0 0 6px;
  font-size: 32px;
}

.stats-header p {
  margin: 0;
  color: #8fa1c7;
  font-size: 15px;
}

.month-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-btn,
.current-btn {
  height: 44px;
  padding: 0 16px;
  border: 1px solid rgba(112, 140, 196, 0.35);
  border-radius: 12px;
  background: #10182b;
  color: #eef4ff;
  cursor: pointer;
}

.month-box {
  height: 44px;
  padding: 0 22px;
  border: 1px solid rgba(112, 140, 196, 0.35);
  border-radius: 12px;
  display: flex;
  align-items: center;
  background: #10182b;
  font-weight: 600;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-bottom: 1px solid rgba(112, 140, 196, 0.16);
}

.summary-item {
  padding: 22px;
  text-align: center;
  border-right: 1px solid rgba(112, 140, 196, 0.12);
}

.summary-item:last-child {
  border-right: none;
}

.summary-item span {
  display: block;
  margin-bottom: 10px;
  color: #9aaad0;
  font-size: 14px;
}

.summary-item strong {
  font-size: 30px;
  color: #69b8ff;
}

.summary-item strong.expense {
  color: #ff7c8e;
}

.chart-section {
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.chart-box {
  border: 1px solid rgba(112, 140, 196, 0.2);
  border-radius: 18px;
  background: #0d1528;
  padding: 20px;
}

.chart-box h2 {
  margin: 0 0 16px;
  font-size: 20px;
}

.real-chart-area {
  height: 320px;
}

.pie-area {
  height: 360px;
}

@media (max-width: 900px) {
  .stats-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-row {
    grid-template-columns: 1fr;
  }

  .summary-item {
    border-right: none;
    border-bottom: 1px solid rgba(112, 140, 196, 0.12);
  }

  .summary-item:last-child {
    border-bottom: none;
  }
}
</style>