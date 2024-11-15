<script setup>
import SideBar from "@/components/general/SideBar.vue";
import LeagueSelector from "@/components/games/LeagueSelector.vue";
import Modal from "@/components/general/Modal.vue";
import {ref, watch, onMounted} from "vue";
import axios from "axios";
import { formatDateToGermanTimeFormat } from "@/helpers/index.js";
import user_store from "@/stores/user_store.js";
import { useCompetitionStore } from "@/stores/competition_store.js";
import { api_information } from "@/stores/index.js";
import TickerList from "@/components/ticker/TickerList.vue";
import GameDaySelector from "@/components/games/GameDaySelector.vue";

const user = user_store();
const competition_store = useCompetitionStore();
const url = api_information.url;

// data
let show_modal = ref(false);
let matches = ref([]);
let livetickers = ref([]);
let selected_matches = ref([]);
let selected_competition = ref();
let selected_game_day = ref(1);

// methods
let fetchGamesByCompetitionId = (competition_id, gameday) => {
  if (competition_id === undefined || gameday === undefined) {
    return;
  }

  axios.get(url + `/api/competitions/${competition_id}/games/${gameday}`).then((response) => {
    matches.value = response.data;
  }).catch((error) => {
    console.log(error);
  });
};
let fetchLivetickersByUserId = (user_id) => {
  axios.get(url + `/api/users/${user_id}/tickers`).then((response) => {
    livetickers.value = response.data;
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
let retrieveGameDay = (game_day) => {
  selected_game_day.value = game_day;
};
let createTicker = () => {
  console.log("create ticker");
  if (selected_matches.value.length === 0) {
    alert("Bitte wählen Sie mindestens ein Spiel aus.")
    return;
  } else {
    selected_matches.value.forEach((match) => {
      axios.post(url + "/tickers", {
        "ticker": {
          "game_id": match.id,
          "user_id": user.user.id,
        }
      }).then((response) => {
        console.log(response);
        livetickers.value.push(response.data);
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
let setCSSClass = (match) => {
  if (selected_matches.value.includes(match)) {
    return "shadow-md m-6 mb-8 p-6 cursor-pointer rounded-lg checked";
  } else {
    return "shadow-md m-6 mb-8 p-6 cursor-pointer rounded-lg";
  }
};

// watch
watch(() => selected_competition.value, (new_value) => {
  if (new_value !== undefined && selected_game_day.value !== undefined) {
    fetchGamesByCompetitionId(new_value, selected_game_day.value);
  }
});

watch(() => selected_game_day.value, (new_value) => {
  if (selected_competition.value !== undefined && new_value !== undefined) {
    fetchGamesByCompetitionId(selected_competition.value, new_value);
  }
});

onMounted(() => {
  fetchLivetickersByUserId(user.user.id);
});
</script>

<template>

  <side-bar class="custom-v-index"/>

  <!-- content -->
  <div class="mt-16 mx-4 space-y-4 flex flex-col z-1 custom-z-index">
    <LeagueSelector @changed_competition="retrieveCompetitionId" />

    <GameDaySelector @changed_game_day="retrieveGameDay" />

    <div class="m-auto">
      <button v-if="matches.length > 0" @click="openModal" class="text-gray-900 hover:text-white border border-primary hover:bg-primary focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-primary dark:text-primary">
        <span class="relative px-5 py-2.5 transition-all ease-in duration-75 hover:bg-primary hover:text-white dark:bg-primary rounded-md">
          Ticker anlegen
        </span>
      </button>

      <div v-if="matches.length === 0">
        <p>
          Hier können Sie Ticker erstellen, um Spiele live zu verfolgen. <br />
          Bitte lege erst ein Spiel an, bevor du einen Ticker erstellst. <br /><br />

          <router-link to="/matches" class="text-primary underline">
            Hier geht es zu den Spielen.
          </router-link>
        </p>
      </div>
    </div>

    <!-- list component -->
    <TickerList v-if="matches.length > 0" :tickers="livetickers" :teams="competition_store.teams" />

    <!-- modal -->
    <Modal v-if="show_modal" @close="show_modal = false" @confirm="createTicker" :text="'Ticker anlegen'">
      <template #header>
        <div class="flex flex-row items-center space-x-2">
          <span>Neuen Ticker erstellen</span>
        </div>
      </template>
      <template #body>
        <!-- list of games -->
        <div v-for="match in matches" :key="match.id" :class="setCSSClass(match)">
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
              <img :src="match.team_home.logo_url" class="w-18 h-18" :alt="match.team_home.name">
            </div>
            <div class="text-center m-auto">
              <span class="font-bold text-primary">
                vs.
              </span>
            </div>
            <div>
              <img :src="match.team_away.logo_url" class="w-18 h-18" :alt="match.team_away.name">
            </div>
            <div class="col-span-2 m-auto text-center">
              <span class="text-primary">
                {{ match.team_away.name }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="matches.length === 0">
          <p>
            Es sind keine Spiele vorhanden.
          </p>
        </div>
      </template>
    </Modal>
  </div>

</template>

<style scoped>
.checked {
  border: 1px solid #dc2626;
  position: relative;
}
.checked:after {
  content: "";
  position: absolute;
  top: 5%;
  left: 95%;
  transform: translate(40%, 0);
  width: 20px;
  height: 20px;
  background: url("../../assets/check.svg") no-repeat center/cover;
  color: #dc2626;
}

@media only screen and (max-width: 565px) {
  .checked:after {
    left: 90%;
  }
}

.custom-v-index {
  @apply overflow-visible;
  @apply fixed z-50;
}
.custom-z-index {
  @apply relative z-10;
  @apply overflow-hidden;
}
</style>