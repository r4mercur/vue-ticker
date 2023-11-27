<script setup>
import SideBar from "@/components/SideBar.vue";
import LeagueSelector from "@/components/LeagueSelector.vue";
import { useUserStore } from "@/stores/user_store.js";
import { useCompetitionStore } from "@/stores/competition_store.js";
import Modal from "@/components/Modal.vue";
import {ref} from "vue";

const competitionStore = useCompetitionStore();
const userStore = useUserStore();

// data
let show_modal = ref(false);
let matches = ref([
  {
    id: 1,
    team_home: {
      name: "Bayern"
    },
    team_away: {
      name: "Dortmund"
    }
  }
])

// methods
let openModal = () => {
  show_modal.value = true;
};
let retrieve_matches_from_competition = (competition_id) => {
  console.log("new competition ", competition_id);
};
let createTicker = () => {
  console.log("create ticker");
  show_modal.value = false;
};

</script>

<template>

  <side-bar />

  <!-- content -->
  <div class="mt-16 mx-4 space-y-4 flex flex-col">
    <LeagueSelector @changed_competition="retrieve_matches_from_competition" />

    <div class="m-auto">
      <button @click="openModal" type="button" class="text-white bg-gradient-to-r from-purple-500 via-purple-600
        to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg
        shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
        Ticker erstellen
      </button>
    </div>

    <!-- modal -->
    <Modal v-if="show_modal" @close="show_modal = false" @confirm="createTicker()" :text="'Ticker anlegen'">
      <template #header>
        <div class="flex flex-row items-center space-x-2">
          <span>Neuen Ticker erstellen</span>
          <span class="text-2xl">+</span>
        </div>
      </template>
      <template #body>
        <div class="flex flex-col space-y-2">
          <ul>
            <li v-for="match in matches" :key="match.id">
              {{ match.team_home.name }} - {{ match.team_away.name }}
            </li>
          </ul>
        </div>
      </template>
    </Modal>
  </div>

</template>

<style scoped>

</style>