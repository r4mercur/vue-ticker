<script setup>
import {ref, watch} from "vue";

let selected_game_day = ref(1);

const emit = defineEmits(["changed_game_day"]);

watch(selected_game_day, (newValue) => {
  emit("changed_game_day", newValue);
});
</script>

<template>
  <div class="w-full">
    <label for="game_day" class="block mb-1 text-sm text-on-surface/70">Wähle ein Spieltag</label>
    <select id="game_day" v-model="selected_game_day" class="h-10 w-full rounded-[7px] border border-border-subtle bg-surface px-3 py-2.5 font-sans text-sm text-on-surface outline-none transition-all focus:border-2 focus:border-secondary">
      <option v-for="day in 100" :key="day" :value="day">
        {{ day }}
      </option>
    </select>
  </div>
</template>

<style scoped>

</style>