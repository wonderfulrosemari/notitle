import { createRouter, createWebHistory } from 'vue-router'
import BookList from '../views/BookList.vue'
import AddBook from '../views/AddBook.vue'

const routes = [
  {
    path: '/',
    redirect: '/books',
  },
  {
    path: '/books',
    name: 'book-list',
    component: BookList,
  },
  {
    path: '/books/add',
    name: 'book-add',
    component: AddBook,
  },
  {
    path: '/books/:id/edit',
    name: 'book-edit',
    component: AddBook,
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
