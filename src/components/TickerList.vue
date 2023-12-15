<script setup>
defineProps({
  tickers: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <div class="flex flex-col">
    <div v-for="ticker in tickers" :key="ticker.id" class="basis-full">
      {{ ticker }}
    </div>
  </div>
</template>

<style scoped>

</style>