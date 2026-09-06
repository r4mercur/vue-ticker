<script setup>
import { computed, ref, watch } from "vue";
import axios from "axios";
import AppHeader from "@/components/general/AppHeader.vue";
import LeagueSelector from "@/components/games/LeagueSelector.vue";
import GameDaySelector from "@/components/games/GameDaySelector.vue";
import GameScheduleList from "@/components/games/GameScheduleList.vue";
import GameFormModal from "@/components/games/GameFormModal.vue";
import { api_v1_url } from "@/stores/index.js";
import useUserStore from "@/stores/user_store.js";
import { gameStatus } from "@/helpers/index.js";
import router from "@/router/index.js";

const url = api_v1_url;
const userStore = useUserStore();

// data
const games = ref([]);
const selectedCompetitionId = ref();
const selectedGameDay = ref(1);
const statusFilter = ref("all");
const showCreateModal = ref(false);

const statusFilters = [
  { key: "all", label: "Alle" },
  { key: "live", label: "Live" },
  { key: "planned", label: "Geplant" },
  { key: "ended", label: "Beendet" },
];

// computed
const filteredGames = computed(() => {
  if (statusFilter.value === "all") return games.value;
  return games.value.filter((game) => gameStatus(game) === statusFilter.value);
});

// methods
const fetchGames = () => {
  if (selectedCompetitionId.value === undefined || selectedGameDay.value === undefined) return;

  axios.get(url + `/competitions/${selectedCompetitionId.value}/games/${selectedGameDay.value}`).then((response) => {
    games.value = response.data;
  }).catch((error) => {
    console.log(error);
  });
};

const onCreateTicker = (game) => {
  axios.post(url + "/tickers", {
    ticker: {
      game_id: game.id,
      user_id: userStore.user.id,
      ticker_state: 0,
    },
  }).then((response) => {
    router.push(`/ticker/${response.data.id}`);
  }).catch((error) => {
    console.log(error);
  });
};

const onOpenTicker = (tickerId) => {
  router.push(`/ticker/${tickerId}`);
};

const onGameCreated = ({ game, ticker }) => {
  showCreateModal.value = false;

  if (ticker) {
    router.push(`/ticker/${ticker.id}`);
    return;
  }

  if (game.competition_id === Number(selectedCompetitionId.value) && game.match_day === Number(selectedGameDay.value)) {
    games.value.push(game);
  }
};

// watch
watch([selectedCompetitionId, selectedGameDay], fetchGames);
</script>

<template>
  <!-- navigation -->
  <app-header />

  <!-- content -->
  <div class="mt-16 px-6 py-6 sm:px-10">
    <div class="mb-5 flex items-end justify-between gap-4">
      <h1 class="text-2xl font-bold">Spielplan</h1>
      <button type="button" @click="showCreateModal = true" class="cursor-pointer rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600">
        Spiel anlegen
      </button>
    </div>

    <div class="mb-5 flex flex-wrap items-end gap-4">
      <div class="w-full sm:w-64">
        <LeagueSelector @changed_competition="(id) => selectedCompetitionId = id" />
      </div>
      <div class="w-full sm:w-40">
        <GameDaySelector @changed_game_day="(day) => selectedGameDay = day" />
      </div>

      <div class="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface p-1">
        <button
          v-for="filter in statusFilters"
          :key="filter.key"
          type="button"
          @click="statusFilter = filter.key"
          class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold transition-colors"
          :class="statusFilter === filter.key ? 'bg-primary text-white' : 'text-on-surface/65 hover:text-on-surface'"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <GameScheduleList :games="filteredGames" @create-ticker="onCreateTicker" @open-ticker="onOpenTicker" />
  </div>

  <GameFormModal
    v-if="showCreateModal"
    :initial-competition-id="selectedCompetitionId"
    :initial-match-day="selectedGameDay"
    @close="showCreateModal = false"
    @created="onGameCreated"
  />
</template>

<style scoped>

</style>
