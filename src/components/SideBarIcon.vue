<script setup lang="ts">
import { defineProps } from "vue";

defineProps<{
  icon: string;
  text: string;
}>();
</script>

<template>
  <div class="sidebar-icon group">
    <v-icon :name="icon" />

    <span class="sidebar-tooltip group-hover:scale-100">
      {{ text }}
    </span>
  </div>
</template>