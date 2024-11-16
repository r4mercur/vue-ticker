<script setup>
import {formatDateToGermanTimeFormat} from "../../helpers/index.js";
import { api_information } from "@/stores/index.js";
import router from "@/router/index.js";

const url = api_information.url;

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
</script>

<template>
  <div class="flex flex-col">
    <div class="flex text-left ml-6 mr-6">
      <h1 class="text-2xl font-bold text-primary">Ticker</h1>
    </div>

    <div v-for="ticker in tickers" :key="ticker.id" class="basis-full shadow-md m-6 mb-8 p-6 cursor-pointer rounded-lg">
      <div class="grid grid-cols-4 gap-4">
        <div>
          <span class="text-center text-primary">{{ formatDateToGermanTimeFormat(ticker.game.date) }}</span>
        </div>

        <div class="col-span-2">
          <div class="flex items-center">
            <template v-for="team in teams" :key="team.id">
              <div v-if="team.id === ticker.game.team_home_id" class="flex items-center whitespace-nowrap">
                {{ team.name }}
                <img v-if="team.id === ticker.game.team_home_id" :src="team.logo_url" class="w-8 h-8 mr-2 ml-2" :alt="team.name">
              </div>
            </template>

            <span class="pl-2 pr-2">
              vs.
            </span>

            <template v-for="team in teams" :key="team.id">
              <div v-if="team.id === ticker.game.team_away_id" class="flex items-center whitespace-nowrap">
                <img v-if="team.id === ticker.game.team_away_id" :src="team.logo_url" class="w-8 h-8 mr-2 ml-2" :alt="team.name">
                {{ team.name }}
              </div>
            </template>
          </div>
        </div>

        <div>
          <button @click="pushToTicker(ticker.id)" class="overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800 inline-flex items-center">
            <span class="relative flex items-center px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 hover:text-white">
              <img src="../../assets/ic_24_edit.svg" class="w-4 h-4 mr-2" alt="Edit" />
              Tickern
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>