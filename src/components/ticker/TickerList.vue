<script setup>
import {formatDateToGermanTimeFormat, teamLogoSrc, TEAM_LOGO_PLACEHOLDER} from "../../helpers/index.js";
import { api_information } from "@/stores/index.js";
import router from "@/router/index.js";

const url = api_information.url;
const emit = defineEmits(['delete-ticker']);

defineProps({
  tickers: {
    type: Array,
    default: () => [],
  },
  teams: {
    type: Array,
    default: () => [],
  },
});

// methods
let pushToTicker = (ticker_id) => {
  router.push(`/ticker/${ticker_id}`);
};

let deleteTicker = (ticker_id) => {
  if (!confirm("Wollen Sie den Ticker wirklich löschen?")) {
    return;
  }

  emit("delete-ticker", ticker_id);
};
</script>

<template>
  <div class="flex flex-col">
    <div class="flex text-left">
      <h2 class="text-xl font-bold text-on-surface">Ticker</h2>
    </div>

    <div v-for="ticker in tickers" :key="ticker.id" class="basis-full shadow-md mt-6 p-6 cursor-pointer rounded-lg bg-surface-alt">
      <div class="grid grid-cols-4 gap-4">
        <div>
          <span class="text-center text-on-surface">{{ formatDateToGermanTimeFormat(ticker.game.date) }}</span>
        </div>

        <div class="col-span-2">
          <div class="flex items-center">
            <template v-for="team in teams" :key="team.id">
              <div v-if="team.id === ticker.game.team_home_id" class="flex items-center whitespace-nowrap">
                {{ team.name }}
                <img v-if="team.id === ticker.game.team_home_id" :src="teamLogoSrc(team.logo_url)" @error="(e) => e.target.src = TEAM_LOGO_PLACEHOLDER" class="w-8 h-8 mr-2 ml-2 object-contain" :alt="team.name">
              </div>
            </template>

            <span class="pl-2 pr-2">
              vs.
            </span>

            <template v-for="team in teams" :key="team.id">
              <div v-if="team.id === ticker.game.team_away_id" class="flex items-center whitespace-nowrap">
                <img v-if="team.id === ticker.game.team_away_id" :src="teamLogoSrc(team.logo_url)" @error="(e) => e.target.src = TEAM_LOGO_PLACEHOLDER" class="w-8 h-8 mr-2 ml-2 object-contain" :alt="team.name">
                {{ team.name }}
              </div>
            </template>
          </div>
        </div>

        <div>
          <button @click="pushToTicker(ticker.id)" class="cursor-pointer text-sm font-medium text-gray-900 rounded-lg bg-gradient-to-br from-teal-300 to-lime-300 hover:from-teal-400 hover:to-lime-400 transition-colors focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800 inline-flex items-center px-5 py-2.5">
            <img src="../../assets/ic_24_edit.svg" class="w-4 h-4 mr-2" alt="Edit" />
            Tickern
          </button>

          <button
              @click="deleteTicker(ticker.id)"
              class="delete-button"
              title="Ticker löschen"
          >
            <v-icon name="md-delete" scale="1.2" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.delete-button {
  padding: 4px 8px;
  margin-left: 10px;
  background-color: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  transition: color 0.2s;
  opacity: 0.7;
}

.delete-button:hover {
  opacity: 1;
}
</style>