<template>
  <main class="ledger-page">
    <section class="calendar-shell">
      <header class="calendar-top">
        <div class="title-wrap">
          <p class="title">캘린더</p>
        </div>

        <div class="month-controls">
          <button class="icon-btn" type="button" @click="moveMonth(-1)">&#60;</button>
          <div class="month-chip">{{ monthLabel }}</div>
          <button class="icon-btn" type="button" @click="moveMonth(1)">&#62;</button>
        </div>
      </header>

      <section class="calendar-grid-wrap">
        <div class="weekday-row">
          <span v-for="day in weekdays" :key="day">{{ day }}</span>
        </div>

        <div class="calendar-grid">
          <article v-for="cell in calendarCells" :key="cell.key" :class="['day-cell', cell.hasData ? 'has-data' : '', cell.isToday ? 'today' : '']">
            <template v-if="cell.day">
              <div class="day-head">{{ monthNumber }}/{{ cell.day }}</div>
              <div v-if="cell.hasData" class="amount-list">
                <p :class="['income', 'amount-row', { placeholder: cell.income <= 0 }]">
                  {{ cell.income > 0 ? `+${formatAmount(cell.income)}` : '\u00A0' }}
                </p>
                <p :class="['expense', 'amount-row', { placeholder: cell.expense <= 0 }]">
                  {{ cell.expense > 0 ? `-${formatAmount(cell.expense)}` : '\u00A0' }}
                </p>
                <p class="balance" :class="cell.balance >= 0 ? 'income' : 'expense'">
                  {{ cell.balance >= 0 ? '+' : '-' }}{{ formatAmount(Math.abs(cell.balance)) }}
                </p>
              </div>
            </template>
          </article>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useLedger } from '../composables/useLedger'

const ledger = useLedger()

const weekdays = ['월', '화', '수', '목', '금', '토', '일']

const monthNumber = computed(() => Number(ledger.state.monthCursor.split('-')[1]))

const monthLabel = computed(() => {
  const [year, month] = ledger.state.monthCursor.split('-')
  return `${year}-${month}`
})

const monthMeta = computed(() => {
  const [year, month] = ledger.state.monthCursor.split('-').map(Number)
  const first = new Date(year, month - 1, 1)
  const last = new Date(year, month, 0)
  const firstWeekday = (first.getDay() + 6) % 7

  return {
    year,
    month,
    firstWeekday,
    daysInMonth: last.getDate(),
  }
})

const totalsByDate = computed(() => {
  const map = new Map()
  const prefix = `${ledger.state.monthCursor}-`

  for (const item of ledger.transactions) {
    if (!item.date?.startsWith(prefix)) continue

    if (!map.has(item.date)) {
      map.set(item.date, { income: 0, expense: 0 })
    }

    const bucket = map.get(item.date)
    if (item.type === 'income') {
      bucket.income += Number(item.amount || 0)
    } else {
      bucket.expense += Number(item.amount || 0)
    }
  }

  return map
})

const calendarCells = computed(() => {
  const cells = []
  const { year, month, firstWeekday, daysInMonth } = monthMeta.value
  const today = new Date().toISOString().slice(0, 10)

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ key: `empty-${i}`, day: null })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const bucket = totalsByDate.value.get(date) || { income: 0, expense: 0 }
    const balance = bucket.income - bucket.expense

    cells.push({
      key: date,
      day,
      income: bucket.income,
      expense: bucket.expense,
      balance,
      hasData: bucket.income > 0 || bucket.expense > 0,
      isToday: date === today,
    })
  }

  const remain = cells.length % 7
  if (remain > 0) {
    for (let i = 0; i < 7 - remain; i += 1) {
      cells.push({ key: `tail-${i}`, day: null })
    }
  }

  return cells
})

function formatAmount(value) {
  return `${new Intl.NumberFormat('ko-KR').format(Number(value || 0))}원`
}

function moveMonth(offset) {
  ledger.moveMonth(offset)
}

onMounted(async () => {
  await ledger.fetchTransactions()
})
</script>
