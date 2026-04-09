import { ref } from 'vue';
import axios from 'axios';

// 전역 상태로 관리하여 다른 컴포넌트와 데이터 동기화
const budget = ref(0);

const API_URL = 'http://localhost:3001/users';

export function useSettings() {
  const fetchUserBudget = async (userId) => {
    if (!userId) return;
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      budget.value = response.data.budget || 0;
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
      budget.value = newBudget;
    } catch (error) {
      console.error('예산 저장 실패:', error);
      throw error;
    }
  };

  return {
    budget,
    fetchUserBudget,
    updateUserBudget,
  };
}
