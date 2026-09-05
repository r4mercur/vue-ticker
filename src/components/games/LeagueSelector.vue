<script setup>
import { onMounted, watch, ref } from "vue";
import { useCompetitionStore } from "@/stores/competition_store.js";

const store = useCompetitionStore();

// emit
const emit = defineEmits(["changed_competition"])

// data
let selected_competition = ref(-1);

// watch
watch(selected_competition, (newValue) => {
  emit("changed_competition", newValue);
  store.fetchTeamsByCompetitionId(newValue);
});

onMounted(() => {
  store.fetchCompetitions().then(() => {
    // set selected competition to first competition
    selected_competition.value = store.competitions[0].id;
  }).catch((error) => {
    console.log(error);
  })
});
</script>

<template>
  <div v-if="store.competitions.length > 0" class="w-full">
    <label for="competition" class="block mb-1 text-sm text-on-surface/70">Wähle ein Wettbewerb</label>
    <select id="competition" v-model="selected_competition" class="h-10 w-full rounded-[7px] border border-border-subtle bg-surface px-3 py-2.5 font-sans text-sm text-on-surface outline-none transition-all focus:border-2 focus:border-secondary">
      <option v-for="comp in store.competitions" :key="comp.id" :value="comp.id">
        {{ comp.name }}
      </option>
    </select>
  </div>

  <div v-else>
    <p class="text-on-surface">Keine Wettbewerbe vorhanden</p>
  </div>
</template>

<style scoped>

</style>