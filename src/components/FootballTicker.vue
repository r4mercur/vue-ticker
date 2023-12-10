<script setup>
import SideBar from "@/components/SideBar.vue";
import LeagueSelector from "@/components/LeagueSelector.vue";
import Modal from "@/components/Modal.vue";
import {ref} from "vue";
import axios from "axios";
import { formatDateToGermanTimeFormat } from "@/helpers/index.js";
import user_store from "@/stores/user_store.js";
import { api_information } from "@/stores/index.js";

const user = user_store();
const url = api_information.url;

// data
let show_modal = ref(false);
let matches = ref([]);
let selected_matches = ref([]);
let selected_competition = ref();

// methods
let fetchGamesByCompetitionId = (competition_id) => {
  axios.get(url + `/api/competitions/${competition_id}/games`).then((response) => {
    matches.value = response.data;
  }).catch((error) => {
    console.log(error);
  });
};
let openModal = () => {
  if (selected_competition.value !== undefined) {
    show_modal.value = true;
    fetchGamesByCompetitionId(selected_competition.value);
  }
};
let retrieveCompetitionId = (competition_id) => {
  selected_competition.value = competition_id;
};
let createTicker = () => {
  console.log("create ticker");
  if (selected_matches.value.length === 0) {
    console.log("no matches selected");
    return;
  } else {
    selected_matches.value.forEach((match) => {
      axios.post(url + "/tickers", {
        "ticker": {
          "match_id": match.id,
          "user_id": user.user.id,
        }
      }).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.log(error);
      });
    })
  }
  show_modal.value = false;
};
let addOrRemoveToSelected = (match) => {
  if (selected_matches.value.includes(match)) {
    selected_matches.value = selected_matches.value.filter((m) => m.id !== match.id);
  } else {
    selected_matches.value.push(match);
  }
};

</script>

<template>

  <side-bar />

  <!-- content -->
  <div class="mt-16 mx-4 space-y-4 flex flex-col">
    <LeagueSelector @changed_competition="retrieveCompetitionId" />

    <div class="m-auto">
      <button @click="openModal" class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800">
        <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
          Ticker anlegen
        </span>
      </button>
    </div>

    <!-- modal -->
    <Modal v-if="show_modal" @close="show_modal = false" @confirm="createTicker()" :text="'Ticker anlegen'">
      <template #header>
        <div class="flex flex-row items-center space-x-2">
          <span>Neuen Ticker erstellen</span>
        </div>
      </template>
      <template #body>
        <!-- list of matches -->
        <div v-for="match in matches" :key="match.id" class="shadow-md m-6 mb-8 p-6 cursor-pointer">
          <!-- date -->
          <div class="text-center mb-0.5 p6">
            <span class="whitespace-nowrap text-center font-bold text-primary">
                {{ formatDateToGermanTimeFormat(match.date, true) }}
            </span>
          </div>

          <!-- grid -->
          <div class="grid grid-cols-7 pr-12 pl-12" @click="addOrRemoveToSelected(match)">
            <div class="col-span-2 m-auto text-center pt-4">
              <span class="text-primary">
                {{ match.team_home.name }}
              </span>
            </div>
            <div>
              <img :src="url + '/images/team_' + match.team_home_id + '.png'" class="w-18 h-18" :alt="match.team_home.name">
            </div>
            <div class="text-center m-auto">
              <span class="font-bold text-primary">
                vs.
              </span>
            </div>
            <div>
              <img :src="url + '/images/team_' + match.team_away_id + '.png'" class="w-18 h-18" :alt="match.team_away.name">
            </div>
            <div class="col-span-2 m-auto text-center">
              <span class="text-primary">
                {{ match.team_away.name }}
              </span>
            </div>
          </div>
        </div>



      </template>
    </Modal>
  </div>

</template>

<style scoped>

</style>