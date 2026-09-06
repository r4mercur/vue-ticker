<script setup>
import { computed, onMounted, ref } from "vue";
import axios from "axios";
import AppHeader from "@/components/general/AppHeader.vue";
import GameScheduleList from "@/components/games/GameScheduleList.vue";
import GameFormModal from "@/components/games/GameFormModal.vue";
import useUserStore from "@/stores/user_store.js";
import { api_v1_url } from "@/stores/index.js";
import { gameStatus, teamLogoSrc, TEAM_LOGO_PLACEHOLDER } from "@/helpers/index.js";
import router from "@/router/index.js";

const url = api_v1_url;
const userStore = useUserStore();

// data
const todaysGames = ref([]);
const myTickers = ref([]);
const eventCount = ref(0);
const showCreateGameModal = ref(false);

const quickLinks = [
  { label: "Spiel anlegen", icon: "md-add", action: "create-game" },
  { label: "Kader pflegen", icon: "md-groups", action: "route", to: "/teams" },
  { label: "Team anlegen", icon: "md-groups", action: "route", to: "/teams" },
  { label: "Wettbewerb anlegen", icon: "md-emojievents", action: "route", to: "/competitions" },
];

// computed
const todayLabel = computed(() => new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()));

const liveTicker = computed(() => myTickers.value.find((t) => gameStatus({ ticker: t }) === "live"));

const openTickerCount = computed(() => myTickers.value.filter((t) => t.ticker_state === "not_started").length);

const liveScore = computed(() => {
  if (!liveTicker.value) return null;
  const { goals_home, goals_away } = liveTicker.value;
  if (goals_home === null && goals_away === null) return null;
  return `${goals_home ?? 0} : ${goals_away ?? 0}`;
});

const TICKER_STATE_LABELS = {
  not_started: "Vor Anpfiff",
  first_half: "1. Halbzeit",
  half_time: "Halbzeitpause",
  second_half: "2. Halbzeit",
  third_half: "3. Viertel",
  fourth_half: "4. Viertel",
  ended: "Beendet",
};

// methods
const isToday = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
};

const fetchTodaysGames = () => {
  axios.get(url + "/games").then((response) => {
    todaysGames.value = response.data.filter((game) => isToday(game.date));
  }).catch((error) => {
    console.log(error);
  });
};

const fetchMyTickers = () => {
  axios.get(url + `/users/${userStore.user.id}/tickers`).then((response) => {
    myTickers.value = response.data;
    fetchEventCount(response.data);
  }).catch((error) => {
    console.log(error);
  });
};

// N+1-per-ticker is an accepted MVP trade-off (see implementation plan) until
// a dedicated aggregate stats endpoint exists.
const fetchEventCount = (tickers) => {
  if (tickers.length === 0) {
    eventCount.value = 0;
    return;
  }

  Promise.all(tickers.map((ticker) => axios.get(url + `/tickers/${ticker.id}`))).then((responses) => {
    eventCount.value = responses.reduce((sum, response) => sum + (response.data.ticker_events?.length ?? 0), 0);
  }).catch((error) => {
    console.log(error);
  });
};

const onCreateTicker = (game) => {
  axios.post(url + "/tickers", {
    ticker: { game_id: game.id, user_id: userStore.user.id, ticker_state: 0 },
  }).then((response) => {
    router.push(`/ticker/${response.data.id}`);
  }).catch((error) => {
    console.log(error);
  });
};

const onOpenTicker = (tickerId) => {
  router.push(`/ticker/${tickerId}`);
};

const onQuickLink = (link) => {
  if (link.action === "create-game") {
    showCreateGameModal.value = true;
  } else {
    router.push(link.to);
  }
};

const onGameCreated = ({ ticker }) => {
  showCreateGameModal.value = false;
  if (ticker) {
    router.push(`/ticker/${ticker.id}`);
  } else {
    fetchTodaysGames();
  }
};

onMounted(() => {
  fetchTodaysGames();
  fetchMyTickers();
});
</script>

<template>
  <app-header />

  <div class="mt-16 px-6 py-6 sm:px-10">
    <div class="mb-6 flex items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-secondary">Dashboard</p>
        <h1 class="mt-1 text-3xl font-bold">Moin, {{ userStore.user?.username }}</h1>
      </div>
      <span class="text-sm text-on-surface/55">{{ todayLabel }}</span>
    </div>

    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
      <div class="flex flex-col gap-6">
        <div v-if="liveTicker">
          <div class="mb-2.5 flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span class="text-sm font-semibold uppercase tracking-wide">Jetzt live</span>
          </div>
          <div class="rounded-xl border border-border-subtle bg-surface p-5">
            <div class="flex items-center gap-4">
              <div class="flex min-w-0 flex-1 items-center gap-3">
                <img :src="teamLogoSrc(liveTicker.game.team_home?.logo_url)" @error="(e) => e.target.src = TEAM_LOGO_PLACEHOLDER" class="h-8 w-8 shrink-0 object-contain" alt="" />
                <span class="truncate text-sm font-semibold">{{ liveTicker.game.team_home?.name }}</span>
              </div>
              <div class="shrink-0 text-center">
                <div class="font-mono text-3xl font-bold tabular-nums">{{ liveScore ?? "– : –" }}</div>
                <div class="mt-1 text-xs font-semibold text-orange-600 dark:text-orange-400">{{ TICKER_STATE_LABELS[liveTicker.ticker_state] }}</div>
              </div>
              <div class="flex min-w-0 flex-1 items-center justify-end gap-3">
                <span class="truncate text-sm font-semibold">{{ liveTicker.game.team_away?.name }}</span>
                <img :src="teamLogoSrc(liveTicker.game.team_away?.logo_url)" @error="(e) => e.target.src = TEAM_LOGO_PLACEHOLDER" class="h-8 w-8 shrink-0 object-contain" alt="" />
              </div>
            </div>
            <div class="mt-4 flex items-center justify-end border-t border-border-subtle pt-4">
              <button type="button" @click="router.push(`/ticker/${liveTicker.id}`)" class="cursor-pointer rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600">
                Weiter tickern
              </button>
            </div>
          </div>
        </div>

        <div>
          <div class="mb-2.5 flex items-baseline justify-between">
            <span class="text-sm font-semibold uppercase tracking-wide">Heute angesetzt</span>
            <router-link to="/games" class="text-sm font-semibold text-secondary hover:underline">Ganzer Spielplan</router-link>
          </div>
          <GameScheduleList :games="todaysGames" @create-ticker="onCreateTicker" @open-ticker="onOpenTicker" />
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <div class="overflow-hidden rounded-xl border border-border-subtle bg-surface">
          <div class="border-b border-border-subtle px-4 py-3 text-sm font-semibold uppercase tracking-wide text-on-surface/70">Schnellzugriff</div>
          <button
            v-for="link in quickLinks"
            :key="link.label"
            type="button"
            @click="onQuickLink(link)"
            class="flex w-full cursor-pointer items-center gap-3 border-t border-border-subtle px-4 py-3 text-left text-sm font-semibold first:border-t-0 hover:bg-surface-alt"
          >
            <v-icon :name="link.icon" scale="1" class="text-secondary" />
            {{ link.label }}
            <v-icon name="md-chevronright" scale="0.9" class="ml-auto opacity-40" />
          </button>
        </div>

        <div class="rounded-xl border border-border-subtle bg-surface p-4">
          <div class="mb-3.5 text-sm font-semibold uppercase tracking-wide text-on-surface/70">Deine Saison</div>
          <div class="grid grid-cols-3 gap-3 text-center">
            <div>
              <div class="font-mono text-2xl font-bold tabular-nums">{{ myTickers.length }}</div>
              <div class="mt-1 text-xs text-on-surface/60">Ticker</div>
            </div>
            <div>
              <div class="font-mono text-2xl font-bold tabular-nums">{{ eventCount }}</div>
              <div class="mt-1 text-xs text-on-surface/60">Events</div>
            </div>
            <div>
              <div class="font-mono text-2xl font-bold tabular-nums">{{ openTickerCount }}</div>
              <div class="mt-1 text-xs text-on-surface/60">Offen</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <GameFormModal v-if="showCreateGameModal" @close="showCreateGameModal = false" @created="onGameCreated" />
</template>

<style scoped>

</style>
