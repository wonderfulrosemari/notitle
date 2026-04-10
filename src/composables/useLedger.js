import axios from 'axios';
import { computed, reactive, ref, watch } from 'vue';
import { useAuth } from './useAuth';

const transactions = ref([]);
const categories = ref([]);
const regulars = ref([]);
const loading = ref(false);
const fetchStatusMessage = ref('');

const state = reactive({
  monthCursor: new Date().toISOString().slice(0, 7),
  anchorDate: new Date().toISOString().slice(0, 10),
  period: 'month',
  type: 'all',
  category: 'all',
  search: '',
  sortBy: 'date',
  sortOrder: 'desc',
  customFrom: '',
  customTo: '',
  page: 1,
  selectedIds: [],
});

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 5000,
});

const defaultCategories = [
  '식비',
  '교통',
  '주거',
  '의료',
  '쇼핑',
  '문화',
  '기타',
];
const defaultIncomeCategories = ['급여', '부수입', '환급', '용돈', '기타'];
const PAGE_SIZE = 10;

const pad = (value) => String(value).padStart(2, '0');
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
};

const normalizeTransaction = (item) => ({
  id: String(item.id),
  date: item.date || formatDate(new Date()),
  type: item.type === 'income' ? 'income' : 'expense',
  category: item.category || '기타',
  amount: Number(item.amount || 0),
  memo: item.memo || '',
  createdAt: Number(item.createdAt || Date.now()),
  userId: String(item.userId || ''),
  emoji: item.emoji || '✨',
  regularId: item.regularId || null,
});

const getSignedAmount = (item) => {
  const amount = Number(item.amount || 0);
  return item.type === 'income' ? amount : -amount;
};

export function useLedger() {
  const auth = useAuth();
  const currentUserId = computed(() => auth.state.currentUser?.id || '');

  const requireUserId = () => {
    if (!currentUserId.value) throw new Error('로그인 정보가 없습니다.');
    return currentUserId.value;
  };

  const currentRange = computed(() => {
    const [year, month] = state.monthCursor.split('-').map(Number);
    const start = formatDate(new Date(year, month - 1, 1));
    const end = formatDate(new Date(year, month, 0));
    return { start, end };
  });

  const scopedByRange = computed(() => {
    const range = currentRange.value;
    return transactions.value.filter(
      (item) => item.date >= range.start && item.date <= range.end,
    );
  });

  const filteredTransactions = computed(() => {
    const keyword = state.search.trim().toLowerCase();
    return scopedByRange.value
      .filter((item) => {
        if (state.type !== 'all' && item.type !== state.type) return false;
        if (state.category !== 'all' && item.category !== state.category)
          return false;
        if (!keyword) return true;
        return [item.memo, item.category]
          .join(' ')
          .toLowerCase()
          .includes(keyword);
      })
      .sort((a, b) => {
        let compare = 0;
        if (state.sortBy === 'date') compare = a.date.localeCompare(b.date);
        else if (state.sortBy === 'category')
          compare = a.category.localeCompare(b.category, 'ko');
        else if (state.sortBy === 'amount')
          compare = getSignedAmount(a) - getSignedAmount(b);

        if (compare === 0) return b.createdAt - a.createdAt;
        return state.sortOrder === 'asc' ? compare : -compare;
      });
  });

  const summary = computed(() => {
    return filteredTransactions.value.reduce(
      (acc, item) => {
        if (item.type === 'income') acc.income += item.amount;
        else acc.expense += item.amount;
        acc.balance = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, balance: 0 },
    );
  });

  const pagedTransactions = computed(() => {
    const start = (state.page - 1) * PAGE_SIZE;
    return filteredTransactions.value.slice(start, start + PAGE_SIZE);
  });

  const totalPages = computed(
    () => Math.ceil(filteredTransactions.value.length / PAGE_SIZE) || 1,
  );

  const pageNumbers = computed(() =>
    Array.from({ length: totalPages.value }, (_, index) => index + 1),
  );

  const statusMessage = computed(() => {
    if (loading.value) return '불러오는 중입니다.';
    if (fetchStatusMessage.value.startsWith('조회 실패')) {
      return fetchStatusMessage.value;
    }

    return `${state.monthCursor} 기준 거래 ${scopedByRange.value.length}건을 집계했습니다.`;
  });

  const selectedTransactions = computed(() =>
    transactions.value.filter((item) => state.selectedIds.includes(item.id)),
  );

  const selectedCount = computed(() => selectedTransactions.value.length);

  const allSelected = computed(() => {
    return (
      pagedTransactions.value.length > 0 &&
      pagedTransactions.value.every((item) =>
        state.selectedIds.includes(item.id),
      )
    );
  });

  const fetchTransactions = async () => {
    try {
      const userId = requireUserId();
      loading.value = true;
      const response = await api.get('/transactions', { params: { userId } });
      transactions.value = response.data.map(normalizeTransaction);
      fetchStatusMessage.value = '';
    } catch (error) {
      fetchStatusMessage.value = `조회 실패: ${error.message}`;
    } finally {
      loading.value = false;
    }
  };

  const addTransaction = async (payload) => {
    const userId = requireUserId();
    const emoji = getEmojiByName(payload.category);
    const response = await api.post('/transactions', {
      ...payload,
      userId,
      emoji,
      createdAt: Date.now(),
    });
    transactions.value = [
      normalizeTransaction(response.data),
      ...transactions.value,
    ];
  };

  const removeTransaction = async (item) => {
    if (!item) return;
    const tId = item.id;
    const rId = item.regularId;

    try {
      if (rId) {
        await api
          .delete(`/regulars/${rId}`)
          .catch(() => console.log('이미 처리된 규칙'));
      }
      await api.delete(`/transactions/${tId}`);

      if (rId) {
        transactions.value = transactions.value.filter(
          (t) => t.regularId !== rId,
        );
      } else {
        transactions.value = transactions.value.filter((t) => t.id !== tId);
      }
    } catch (e) {
      console.error('삭제 에러:', e);
    }
  };

  const toggleSelection = (id) => {
    if (state.selectedIds.includes(id)) {
      state.selectedIds = state.selectedIds.filter(
        (selectedId) => selectedId !== id,
      );
    } else {
      state.selectedIds = [...state.selectedIds, id];
    }
  };

  const selectAllVisible = (checked) => {
    const visibleIds = pagedTransactions.value.map((item) => item.id);

    if (checked) {
      state.selectedIds = Array.from(
        new Set([...state.selectedIds, ...visibleIds]),
      );
      return;
    }

    state.selectedIds = state.selectedIds.filter(
      (id) => !visibleIds.includes(id),
    );
  };

  const removeSelected = async () => {
    const targets = [...selectedTransactions.value];

    for (const item of targets) {
      await removeTransaction(item);
    }

    state.selectedIds = [];
  };

  const checkAndSyncRegulars = async () => {
    if (!currentUserId.value) return;
    try {
      // 최신 규칙과 내역을 서버에서 다시 한 번 확인 (교차 검증)
      const [regRes, transRes] = await Promise.all([
        api.get('/regulars', { params: { userId: currentUserId.value } }),
        api.get('/transactions', { params: { userId: currentUserId.value } }),
      ]);

      const targetYM = state.monthCursor;

      for (const reg of regRes.data) {
        const targetDate = `${targetYM}-${String(reg.payDay).padStart(2, '0')}`;

        const isExist = transRes.data.some(
          (t) => t.date === targetDate && t.regularId === reg.id,
        );

        if (!isExist) {
          const response = await api.post('/transactions', {
            ...reg,
            id: undefined, // 서버 새 ID 생성을 위해 제거
            date: targetDate,
            memo: `[정기] ${reg.memo || reg.category}`,
            regularId: reg.id,
            userId: currentUserId.value,
            createdAt: Date.now(),
          });
          transactions.value.push(response.data);
        }
      }
    } catch (e) {
      console.error('동기화 실패:', e);
    }
  };

  const fetchCategories = async () => {
    const response = await api.get('/categories');
    categories.value = response.data;
  };

  const getEmojiByName = (name) => {
    const found = categories.value.find((c) => c.name === name);
    return found ? found.emoji : '✨';
  };

  const addRegular = async (payload) => {
    const userId = requireUserId();
    const response = await api.post('/regulars', {
      ...payload,
      userId,
      createdAt: Date.now(),
    });
    return response.data;
  };

  const moveMonth = (offset) => {
    const [year, month] = state.monthCursor.split('-').map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    state.monthCursor = `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
  };
  const addCategory = async (payload) => {
    try {
      const response = await api.post('/categories', {
        ...payload,
        id: `cat-${Date.now()}`,
      });

      categories.value.push(response.data);
      return response.data;
    } catch (error) {
      console.error('카테고리 추가 실패:', error);
      throw error;
    }
  };

  const removeCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);

      categories.value = categories.value.filter((cat) => cat.id !== id);
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      throw error;
    }
  };

  watch(
    () => state.monthCursor,
    () => {
      state.page = 1;

      checkAndSyncRegulars();

      if (state.selectedIds) state.selectedIds = [];
    },
  );

  return reactive({
    state,
    transactions,
    loading,
    statusMessage,
    filteredTransactions,
    pagedTransactions,
    totalPages,
    pageNumbers,
    summary,
    selectedCount,
    allSelected,
    categories,
    fetchTransactions,
    addTransaction,
    removeTransaction,
    removeSelected,
    toggleSelection,
    selectAllVisible,
    checkAndSyncRegulars,
    fetchCategories,
    getEmojiByName,
    addRegular,
    moveMonth,
    addCategory,
    removeCategory,
    goToPage: (p) => {
      state.page = p;
    },
    prevPage: () => {
      if (state.page > 1) state.page--;
    },
    nextPage: () => {
      if (state.page < totalPages.value) state.page++;
    },
    toggleSort: (key) => {
      if (state.sortBy === key)
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      else {
        state.sortBy = key;
        state.sortOrder = 'desc';
      }
    },
    sortMark: (key) => {
      if (state.sortBy !== key) return '▼';
      return state.sortOrder === 'asc' ? '▲' : '▼';
    },
  });
}
