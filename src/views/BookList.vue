<template>
  <section class="panel">
    <div class="panel-head">
      <h2>도서 목록</h2>
      <RouterLink to="/books/add" class="button">새 도서 추가</RouterLink>
    </div>

    <p class="status">{{ status }}</p>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>제목</th>
          <th>저자</th>
          <th>가격</th>
          <th>동작</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="book in books" :key="book.id">
          <td>{{ book.id }}</td>
          <td>{{ book.title }}</td>
          <td>{{ book.author }}</td>
          <td>{{ formatPrice(book.price) }}</td>
          <td class="row-actions">
            <RouterLink :to="`/books/${book.id}/edit`" class="button ghost">수정</RouterLink>
            <button class="danger" @click="removeBook(book.id)">삭제</button>
          </td>
        </tr>
        <tr v-if="books.length === 0">
          <td colspan="5">데이터가 없습니다.</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 5000,
})

const books = ref([])
const status = ref('목록을 불러오는 중...')

function formatPrice(value) {
  return new Intl.NumberFormat('ko-KR').format(Number(value || 0))
}

async function fetchBooks() {
  try {
    const response = await api.get('/books')
    books.value = [...response.data].sort((a, b) =>
      String(a.id).localeCompare(String(b.id), undefined, { numeric: true }),
    )
    status.value = `GET 성공: ${books.value.length}건`
  } catch (error) {
    status.value = `GET 실패: ${error.message}`
  }
}

async function removeBook(id) {
  try {
    await api.delete(`/books/${id}`)
    status.value = `DELETE 성공: ${id}`
    await fetchBooks()
  } catch (error) {
    status.value = `DELETE 실패: ${error.message}`
  }
}

onMounted(fetchBooks)
</script>
