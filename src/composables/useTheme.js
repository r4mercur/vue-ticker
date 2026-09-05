import { ref } from "vue";

const THEME_KEY = "theme";
const isDark = ref(false);

const applyTheme = (dark) => {
  document.documentElement.classList.toggle("dark", dark);
};

const initTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  isDark.value = stored ? stored === "dark" : prefersDark;
  applyTheme(isDark.value);
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  applyTheme(isDark.value);
  localStorage.setItem(THEME_KEY, isDark.value ? "dark" : "light");
};

export function useTheme() {
  return { isDark, toggleTheme, initTheme };
}
