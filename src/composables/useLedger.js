import axios from 'axios';
import { computed, reactive, ref, watch } from 'vue';
import { useAuth } from './useAuth';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    timeout: 5000,
});

const defaultCategories = ['식비', '교통', '주거', '의료', '쇼핑', '문화', '기타'];
const defaultIncomeCategories = ['급여', '부수입', '환급', '용돈', '기타'];
const PAGE_SIZE = 10;
const defaultAssets = ['현금', '체크카드', '신용카드', '계좌이체'];

const pad = (value) => String(value).padStart(2, '0');

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    return `${year}-${month}-${day}`;
};

const parseDate = (value) => {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
};

const shiftMonth = (yearMonth, offset) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const moved = new Date(year, month - 1 + offset, 1);
    return `${moved.getFullYear()}-${pad(moved.getMonth() + 1)}`;
};

const rangeByMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return {
        start: formatDate(start),
        end: formatDate(end),
    };
};

const rangeByWeek = (anchorDate) => {
    const anchor = parseDate(anchorDate) || new Date();
    const day = (anchor.getDay() + 6) % 7;
    const start = new Date(anchor);
    start.setDate(anchor.getDate() - day);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: formatDate(start), end: formatDate(end) };
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
});

const getSignedAmount = (item) => {
    const amount = Number(item.amount || 0);
    return item.type === 'income' ? amount : -amount;
};

export function useLedger() {
    const auth = useAuth();
    const today = formatDate(new Date());

    const state = reactive({
        monthCursor: today.slice(0, 7),
        anchorDate: today,
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

    const transactions = ref([]);
    const loading = ref(false);
    const statusMessage = ref('데이터를 불러오는 중입니다.');

    const currentUserId = computed(() => auth.state.currentUser?.id || '');

    const currentRange = computed(() => {
        if (state.period === 'day') {
            return { start: state.anchorDate, end: state.anchorDate };
        }
        if (state.period === 'week') {
            return rangeByWeek(state.anchorDate);
        }
        if (state.period === 'custom') {
            if (!state.customFrom && !state.customTo) return null;
            const fallback = state.anchorDate;
            return {
                start: state.customFrom || fallback,
                end: state.customTo || fallback,
            };
        }
        return rangeByMonth(state.monthCursor);
    });

    const scopedByRange = computed(() => {
        const range = currentRange.value;
        if (!range) return transactions.value;
        return transactions.value.filter((item) => item.date >= range.start && item.date <= range.end);
    });

    const filteredTransactions = computed(() => {
        const keyword = state.search.trim().toLowerCase();
        return scopedByRange.value
            .filter((item) => {
                if (state.type !== 'all' && item.type !== state.type) return false;
                if (state.category !== 'all' && item.category !== state.category) return false;
                if (!keyword) return true;
                return [item.memo, item.category].join(' ').toLowerCase().includes(keyword);
            })
            .sort((a, b) => {
                let compare = 0;

                if (state.sortBy === 'date') {
                    compare = a.date.localeCompare(b.date);
                } else if (state.sortBy === 'category') {
                    compare = a.category.localeCompare(b.category, 'ko-KR');
                } else if (state.sortBy === 'amount') {
                    compare = getSignedAmount(a) - getSignedAmount(b);
                } else if (state.sortBy === 'memo') {
                    compare = (a.memo || '').localeCompare(b.memo || '', 'ko-KR');
                }

                if (compare === 0) {
                    if (a.date === b.date) return b.createdAt - a.createdAt;
                    return b.date.localeCompare(a.date);
                }

                return state.sortOrder === 'asc' ? compare : -compare;
            });
    });

    const totalPages = computed(() => {
        const pages = Math.ceil(filteredTransactions.value.length / PAGE_SIZE);
        return pages > 0 ? pages : 1;
    });

    const pagedTransactions = computed(() => {
        const start = (state.page - 1) * PAGE_SIZE;
        return filteredTransactions.value.slice(start, start + PAGE_SIZE);
    });

    const pageNumbers = computed(() => {
        const total = totalPages.value;
        if (total <= 7) {
            return Array.from({ length: total }, (_, index) => index + 1);
        }
        const start = Math.max(1, Math.min(state.page - 2, total - 4));
        return Array.from({ length: 5 }, (_, index) => start + index);
    });

    const summary = computed(() => {
        return filteredTransactions.value.reduce(
            (acc, item) => {
                if (item.type === 'income') {
                    acc.income += item.amount;
                } else {
                    acc.expense += item.amount;
                }
                acc.total += item.amount;
                acc.balance = acc.income - acc.expense;
                return acc;
            },
            { total: 0, income: 0, expense: 0, balance: 0 }
        );
    });

    const categoryOptions = computed(() => {
        const fromData = transactions.value.map((item) => item.category);
        return [...new Set([...defaultCategories, ...defaultIncomeCategories, ...fromData])].sort();
    });

    const visibleIds = computed(() => pagedTransactions.value.map((item) => item.id));
    const allSelected = computed(
        () => visibleIds.value.length > 0 && visibleIds.value.every((id) => state.selectedIds.includes(id))
    );

    const selectedCount = computed(() => state.selectedIds.length);

    const selectAllVisible = (checked) => {
        state.selectedIds = checked ? [...visibleIds.value] : [];
    };

    const toggleSelection = (id) => {
        if (state.selectedIds.includes(id)) {
            state.selectedIds = state.selectedIds.filter((selectedId) => selectedId !== id);
            return;
        }
        state.selectedIds = [...state.selectedIds, id];
    };

    const clearSelection = () => {
        state.selectedIds = [];
    };

    const goToPage = (page) => {
        const target = Math.max(1, Math.min(totalPages.value, Number(page) || 1));
        state.page = target;
        clearSelection();
    };

    const toggleSort = (key) => {
        if (state.sortBy === key) {
            state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            state.sortBy = key;
            state.sortOrder = 'asc';
        }
        state.page = 1;
        clearSelection();
    };

    const sortMark = (key) => {
        if (state.sortBy !== key) return '↕';
        return state.sortOrder === 'asc' ? '▲' : '▼';
    };

    const nextPage = () => {
        goToPage(state.page + 1);
    };

    const prevPage = () => {
        goToPage(state.page - 1);
    };

    const updateStatus = (message) => {
        statusMessage.value = message;
    };

    const requireUserId = () => {
        if (!currentUserId.value) {
            throw new Error('로그인한 사용자 정보가 없습니다.');
        }

        return currentUserId.value;
    };

    const fetchTransactions = async () => {
        loading.value = true;
        try {
            const userId = requireUserId();
            const response = await api.get('/transactions', {
                params: {
                    userId,
                },
            });
            transactions.value = response.data.map(normalizeTransaction);
            state.page = 1;
            updateStatus(`총 ${transactions.value.length}건의 내역을 불러왔습니다.`);
        } catch (error) {
            transactions.value = [];
            updateStatus(`조회 실패: ${error.message}`);
        } finally {
            loading.value = false;
            clearSelection();
        }
    };

    const addTransaction = async (payload) => {
        const userId = requireUserId();
        const request = {
            date: payload.date,
            type: payload.type,
            category: payload.category,
            amount: Number(payload.amount),
            memo: payload.memo?.trim() || '',
            createdAt: Date.now(),
            userId,
        };
        const response = await api.post('/transactions', request);
        transactions.value = [normalizeTransaction(response.data), ...transactions.value];
        state.page = 1;
        updateStatus('거래를 추가했습니다.');
    };

    const updateTransaction = async (id, payload) => {
        const target = transactions.value.find((item) => item.id === id);
        if (!target) return;

        const request = {
            ...target,
            date: payload.date,
            type: payload.type,
            category: payload.category,
            amount: Number(payload.amount),
            memo: payload.memo?.trim() || '',
            userId: target.userId || requireUserId(),
        };
        const response = await api.put(`/transactions/${id}`, request);
        transactions.value = transactions.value.map((item) =>
            item.id === id ? normalizeTransaction(response.data) : item
        );
        updateStatus('거래를 수정했습니다.');
    };

    const removeTransaction = async (id) => {
        await api.delete(`/transactions/${id}`);
        transactions.value = transactions.value.filter((item) => item.id !== id);
        state.selectedIds = state.selectedIds.filter((selectedId) => selectedId !== id);
        updateStatus('거래를 삭제했습니다.');
    };

    const removeSelected = async () => {
        if (state.selectedIds.length === 0) return;
        const ids = [...state.selectedIds];
        await Promise.all(ids.map((id) => api.delete(`/transactions/${id}`)));
        transactions.value = transactions.value.filter((item) => !ids.includes(item.id));
        clearSelection();
        updateStatus('선택한 거래를 삭제했습니다.');
    };

    const moveMonth = (offset) => {
        state.monthCursor = shiftMonth(state.monthCursor, offset);
    };

    const focusCurrentMonth = () => {
        state.monthCursor = formatDate(new Date()).slice(0, 7);
        state.anchorDate = formatDate(new Date());
    };

    watch(
        () => [
            state.search,
            state.type,
            state.category,
            state.monthCursor,
            state.anchorDate,
            state.period,
            state.customFrom,
            state.customTo,
        ],
        () => {
            state.page = 1;
        }
    );

    watch(filteredTransactions, (items) => {
        if (state.page > totalPages.value) {
            state.page = totalPages.value;
        }
        const ids = new Set(items.map((item) => item.id));
        state.selectedIds = state.selectedIds.filter((id) => ids.has(id));
    });

    return reactive({
        state,
        transactions,
        loading,
        statusMessage,
        filteredTransactions,
        pagedTransactions,
        totalPages,
        pageNumbers,
        perPage: PAGE_SIZE,
        summary,
        categoryOptions,
        visibleIds,
        allSelected,
        selectedCount,
        currentRange,
        defaultCategories,
        defaultIncomeCategories,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        removeTransaction,
        removeSelected,
        goToPage,
        nextPage,
        prevPage,
        toggleSort,
        sortMark,
        selectAllVisible,
        toggleSelection,
        moveMonth,
        focusCurrentMonth,
    });
}
