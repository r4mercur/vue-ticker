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
  <div v-if="store.competitions.length > 0" class="">
    <div class="m-auto p-16 pb-0">
      <div class="relative h-10 w-100 min-w-[200px]">
        <select v-model="selected_competition" class="peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 empty:!bg-red-500 focus:border-2 focus:border-pink-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50">
          <option v-for="comp in store.competitions" :key="comp.id" :value="comp.id">
            {{ comp.name }}
          </option>
        </select>
        <label class="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-pink-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-pink-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-pink-500 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
          Wähle ein Wettbewerb
        </label>
      </div>

    </div>
  </div>

  <div v-else>
    <p>Keine Wettbewerbe vorhanden</p>
  </div>
</template>

<style scoped>

</style>