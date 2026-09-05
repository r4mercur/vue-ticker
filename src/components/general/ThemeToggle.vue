<script setup>
import { useTheme } from "@/composables/useTheme.js";

const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="isDark"
    aria-label="Theme wechseln"
    title="Theme wechseln"
    @click="toggleTheme"
    class="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full my-2 shadow-lg
           bg-gray-300 dark:bg-gray-700 transition-colors duration-200 ease-linear cursor-pointer"
  >
    <span
      class="inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md
             transition-transform duration-200 ease-linear"
      :class="isDark ? 'translate-x-7' : 'translate-x-1'"
    >
      <span v-if="isDark">🌙</span>
      <span v-else>☀️</span>
    </span>
  </button>
</template>
