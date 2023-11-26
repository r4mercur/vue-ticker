<script setup>
import { onMounted } from "vue";
import { useCompetitionStore } from "@/stores/competition_store.js";

const store = useCompetitionStore();

let setSelectedCompetition = (event) => {
  store.setCompetition(event.target.value);
};

onMounted(() => {
  if (store.competitions.length === 0) {
    store.fetchCompetitions();
  }
});
</script>

<template>
  <div v-if="store.competitions.length > 0" class="">
    <div>
      <select @change="setSelectedCompetition">
        <option v-for="comp in store.competitions" :key="comp.id" :value="comp">
          {{ comp.name }}
        </option>
      </select>
      <label>
        Wähle die Liga aus um einen Ticker anzulegen.
      </label>
    </div>
  </div>

  <div v-else>
    <p>Keine Wettbewerbe vorhanden</p>
  </div>
</template>

<style scoped>

</style>