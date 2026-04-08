import { ref, watch } from 'vue';

const currentTheme = ref(localStorage.getItem('app-theme') || 'dark');

watch(
  currentTheme,
  (newTheme) => {
    if (newTheme === 'kb') {
      document.body.classList.add('theme-kb');
    } else {
      document.body.classList.remove('theme-kb');
    }
    localStorage.setItem('app-theme', newTheme);
  },
  { immediate: true },
);

export function changeTheme() {
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'dark' ? 'kb' : 'dark';
  };

  return {
    currentTheme,
    toggleTheme,
  };
}
