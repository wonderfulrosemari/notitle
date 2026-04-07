<template>
  <section class="panel">
    <h2>{{ isEditMode ? '도서 수정' : '도서 추가' }}</h2>
    <p class="status">{{ status }}</p>

    <div class="form-grid">
      <label>
        ID
        <input v-model="form.id" type="text" :disabled="isEditMode" placeholder="예: bk-301" />
      </label>
      <label>
        제목
        <input v-model="form.title" type="text" placeholder="도서 제목" />
      </label>
      <label>
        저자
        <input v-model="form.author" type="text" placeholder="저자명" />
      </label>
      <label>
        가격
        <input v-model.number="form.price" type="number" min="0" />
      </label>
    </div>

    <div class="button-row">
      <button @click="submitBook">{{ isEditMode ? 'PUT 수정 저장' : 'POST 생성' }}</button>
      <RouterLink to="/books" class="button ghost">목록으로</RouterLink>
    </div>
  </section>
</template>

<script setup>
import axios from 'axios'
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 5000,
})

const route = useRoute()
const router = useRouter()

const status = ref('입력 후 저장하세요.')
const form = reactive({
  id: '',
  title: '',
  author: '',
  price: 0,
})

const isEditMode = computed(() => Boolean(route.params.id))

async function loadBook() {
  if (!isEditMode.value) return

  try {
    const id = String(route.params.id)
    const response = await api.get(`/books/${id}`)
    const book = response.data
    form.id = String(book.id)
    form.title = book.title
    form.author = book.author
    form.price = Number(book.price || 0)
    status.value = `GET 단건 성공: ${id}`
  } catch (error) {
    status.value = `GET 단건 실패: ${error.message}`
  }
}

async function submitBook() {
  if (!form.title || !form.author) {
    status.value = '제목/저자를 입력하세요.'
    return
  }

  const payload = {
    id: form.id || `bk-${Date.now()}`,
    title: form.title,
    author: form.author,
    price: Number(form.price || 0),
  }

  try {
    if (isEditMode.value) {
      await api.put(`/books/${payload.id}`, payload)
      status.value = `PUT 성공: ${payload.id}`
    } else {
      await api.post('/books', payload)
      status.value = `POST 성공: ${payload.id}`
    }

    setTimeout(() => {
      router.push('/books')
    }, 300)
  } catch (error) {
    status.value = `${isEditMode.value ? 'PUT' : 'POST'} 실패: ${error.message}`
  }
}

onMounted(loadBook)
</script>
