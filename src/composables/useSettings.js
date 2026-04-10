import { ref } from 'vue';
import axios from 'axios';

// 전역 상태로 관리하여 다른 컴포넌트와 데이터 동기화
const budget = ref(0);
const budgetAlertEnabled = ref(false);

const API_URL = 'http://localhost:3001/users';

export function useSettings() {
  const fetchUserBudget = async (userId) => {
    if (!userId) return;
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      budget.value = response.data.budget || 0;
      budgetAlertEnabled.value =
        typeof response.data.budgetAlertEnabled === 'boolean'
          ? response.data.budgetAlertEnabled
          : Number(response.data.budget || 0) > 0;
    } catch (error) {
      console.error('예산 로드 실패:', error);
    }
  };

  const updateUserBudget = async (userId, newBudget) => {
    if (!userId) return;
    try {
      await axios.patch(`${API_URL}/${userId}`, {
        budget: Number(newBudget),
      });
      budget.value = Number(newBudget);
    } catch (error) {
      console.error('예산 저장 실패:', error);
      throw error;
    }
  };

  const updateBudgetAlertEnabled = async (userId, enabled) => {
    if (!userId) return;
    try {
      await axios.patch(`${API_URL}/${userId}`, {
        budgetAlertEnabled: Boolean(enabled),
      });
      budgetAlertEnabled.value = Boolean(enabled);
    } catch (error) {
      console.error('예산 알림 설정 저장 실패:', error);
      throw error;
    }
  };

  return {
    budget,
    budgetAlertEnabled,
    fetchUserBudget,
    updateUserBudget,
    updateBudgetAlertEnabled,
  };
}
