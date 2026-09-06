<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { api_v1_url } from "@/stores/index.js";
import {
  describeTickerEvent,
  withRunningScore,
  teamLogoSrc,
  TEAM_LOGO_PLACEHOLDER,
  positionLabel,
} from "@/helpers/index.js";

const url = api_v1_url;
const route = useRoute();

const POLL_INTERVAL_MS = 15000;
const RUNNING_STATES = ["first_half", "second_half", "third_half", "fourth_half"];
const TICKER_STATE_LABELS = {
  not_started: "Vor Anpfiff",
  first_half: "1. Halbzeit",
  half_time: "Halbzeitpause",
  second_half: "2. Halbzeit",
  third_half: "3. Viertel",
  fourth_half: "4. Viertel",
  ended: "Beendet",
};

const TABS = [
  { key: "ticker", label: "Ticker" },
  { key: "lineup", label: "Aufstellung" },
  { key: "stats", label: "Statistik" },
  { key: "table", label: "Tabelle" },
];

// data
const ticker = ref(null);
const activeTab = ref("ticker");
const lastUpdated = ref(null);
const lineupTeam = ref("home");
const standings = ref(null);
const standingsLoading = ref(false);
let pollTimer = null;

// computed
const homeTeam = computed(() => ticker.value?.game?.team_home ?? null);
const awayTeam = computed(() => ticker.value?.game?.team_away ?? null);
const allPlayers = computed(() => [...(homeTeam.value?.players ?? []), ...(awayTeam.value?.players ?? [])]);
const score = computed(() => ({ home: ticker.value?.game?.goals_home ?? 0, away: ticker.value?.game?.goals_away ?? 0 }));
const isLive = computed(() => RUNNING_STATES.includes(ticker.value?.ticker_state));

const chronologicalEvents = computed(() => [...(ticker.value?.ticker_events ?? [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
const feedEvents = computed(() => withRunningScore(chronologicalEvents.value, homeTeam.value?.id, awayTeam.value?.id));

const playerName = (id) => allPlayers.value.find((p) => p.id === id)?.name ?? "Unbekannt";
const teamShortname = (teamId) => (teamId === homeTeam.value?.id ? homeTeam.value?.shortname : teamId === awayTeam.value?.id ? awayTeam.value?.shortname : "");
const describeEvent = (event) => describeTickerEvent(event, { playerName, teamShortname });

const activeLineupTeam = computed(() => (lineupTeam.value === "home" ? homeTeam.value : awayTeam.value));
const startingLineup = computed(() => {
  const ids = new Set((ticker.value?.game?.lineups ?? []).filter((l) => l.starting).map((l) => l.player_id));
  return (activeLineupTeam.value?.players ?? []).filter((p) => ids.has(p.id));
});
const benchLineup = computed(() => {
  const ids = new Set((ticker.value?.game?.lineups ?? []).filter((l) => !l.starting).map((l) => l.player_id));
  return (activeLineupTeam.value?.players ?? []).filter((p) => ids.has(p.id));
});
const hasLineupData = computed(() => (ticker.value?.game?.lineups ?? []).length > 0);

const possessionHomePct = computed(() => {
  const h = ticker.value?.possession_home ?? 0;
  const a = ticker.value?.possession_away ?? 0;
  return h + a === 0 ? 50 : Math.round((h / (h + a)) * 100);
});

// methods
const fetchTicker = () => {
  axios.get(url + `/public/tickers/${route.params.slug}`).then((response) => {
    ticker.value = response.data;
    lastUpdated.value = new Date();
  }).catch((error) => {
    console.log(error);
  });
};

const fetchStandings = () => {
  if (!ticker.value?.game?.competition_id || standings.value) return;

  standingsLoading.value = true;
  axios.get(url + `/competitions/${ticker.value.game.competition_id}/standings`).then((response) => {
    standings.value = response.data;
  }).catch((error) => {
    console.log(error);
  }).finally(() => {
    standingsLoading.value = false;
  });
};

const selectTab = (key) => {
  activeTab.value = key;
  if (key === "table") fetchStandings();
};

const formattedTime = (date) => date ? date.toLocaleTimeString("de-DE") : "";

onMounted(() => {
  fetchTicker();
  pollTimer = setInterval(fetchTicker, POLL_INTERVAL_MS);
});

onUnmounted(() => {
  clearInterval(pollTimer);
});
</script>

<template>
  <div class="min-h-screen bg-surface-alt">
    <div v-if="ticker" class="mx-auto flex min-h-screen w-full max-w-[640px] flex-col bg-surface">
      <!-- header -->
      <div class="flex items-center gap-2.5 bg-primary px-4 py-3.5 text-white">
        <span class="text-sm font-bold tracking-widest">TICKER</span>
        <span v-if="isLive" class="ml-auto flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">
          <span class="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse"></span>LIVE
        </span>
      </div>

      <!-- match card -->
      <div class="border-b border-border-subtle px-4 py-4">
        <div class="mb-3.5 text-center text-xs text-on-surface/55">Wettbewerb · Spieltag {{ ticker.game.match_day }}</div>
        <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
          <div class="text-center">
            <img :src="teamLogoSrc(homeTeam?.logo_url)" @error="(e) => e.target.src = TEAM_LOGO_PLACEHOLDER" class="mx-auto h-11 w-11 object-contain" alt="" />
            <div class="mt-1.5 text-sm font-semibold leading-tight">{{ homeTeam?.name }}</div>
          </div>
          <div class="px-1 text-center">
            <div class="font-mono text-4xl font-bold tabular-nums">{{ score.home }}:{{ score.away }}</div>
            <div class="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-2.5 py-1 text-xs font-bold">
              <span v-if="isLive" class="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              {{ TICKER_STATE_LABELS[ticker.ticker_state] }}
            </div>
          </div>
          <div class="text-center">
            <img :src="teamLogoSrc(awayTeam?.logo_url)" @error="(e) => e.target.src = TEAM_LOGO_PLACEHOLDER" class="mx-auto h-11 w-11 object-contain" alt="" />
            <div class="mt-1.5 text-sm font-semibold leading-tight">{{ awayTeam?.name }}</div>
          </div>
        </div>
        <div class="mt-3.5 text-center text-xs text-on-surface/50">
          Aktualisiert automatisch{{ lastUpdated ? " · " + formattedTime(lastUpdated) : "" }}
        </div>
      </div>

      <!-- tabs -->
      <div class="flex border-b border-border-subtle">
        <button
          v-for="tab in TABS"
          :key="tab.key"
          type="button"
          @click="selectTab(tab.key)"
          class="flex-1 cursor-pointer py-3.5 text-sm font-semibold"
          :class="activeTab === tab.key ? 'text-secondary shadow-[inset_0_-2px_0_0_var(--color-secondary)]' : 'opacity-60'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Ticker tab -->
      <div v-if="activeTab === 'ticker'" class="flex flex-col gap-2 bg-surface-alt p-4">
        <div v-if="feedEvents.length === 0" class="rounded-xl border border-dashed border-border-subtle bg-surface p-8 text-center text-sm text-on-surface/55">
          Der Ticker startet in Kürze.
        </div>
        <div
          v-for="event in feedEvents"
          :key="event.id"
          class="rounded-xl p-3"
          :class="describeEvent(event).goal ? 'bg-secondary text-white' : 'bg-surface'"
        >
          <div class="grid grid-cols-[34px_22px_minmax(0,1fr)] items-start gap-2.5">
            <span class="font-mono text-sm font-bold tabular-nums opacity-80">{{ event.minute?.split(":")[0] }}'</span>
            <span v-if="describeEvent(event).card" class="mt-0.5 h-5 w-4 rounded-sm" :class="{ 'bg-amber-400': describeEvent(event).card === 5, 'bg-red-500': describeEvent(event).card === 6 }" :style="describeEvent(event).card === 11 ? 'background:linear-gradient(160deg,#fbbf24 0 50%,#ef4444 50% 100%)' : ''"></span>
            <v-icon v-else-if="describeEvent(event).goal" name="md-sportssoccer" scale="1" />
            <v-icon v-else-if="describeEvent(event).text" name="bi-chat-text-fill" scale="0.9" class="mt-0.5 opacity-70" />
            <span v-else></span>
            <span class="min-w-0 text-sm font-semibold">
              {{ describeEvent(event).title }}
              <span v-if="describeEvent(event).score" class="ml-1.5 rounded bg-white/20 px-1.5 py-0.5 font-mono text-xs">{{ describeEvent(event).score }}</span>
              <span v-if="describeEvent(event).subtitle" class="mt-0.5 block text-xs font-normal opacity-70">{{ describeEvent(event).subtitle }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Aufstellung tab -->
      <div v-else-if="activeTab === 'lineup'" class="p-4">
        <div class="mb-4 flex gap-0.5 rounded-lg bg-surface-alt p-0.5">
          <button type="button" @click="lineupTeam = 'home'" class="flex-1 cursor-pointer rounded-md py-2 text-sm font-semibold" :class="lineupTeam === 'home' ? 'bg-surface shadow-sm' : 'opacity-65'">{{ homeTeam?.name }}</button>
          <button type="button" @click="lineupTeam = 'away'" class="flex-1 cursor-pointer rounded-md py-2 text-sm font-semibold" :class="lineupTeam === 'away' ? 'bg-surface shadow-sm' : 'opacity-65'">{{ awayTeam?.name }}</button>
        </div>

        <div v-if="!hasLineupData">
          <p class="mb-5 text-sm text-on-surface/55">Für dieses Spiel wurde noch keine Aufstellung gepflegt.</p>
          <div class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Kompletter Kader</div>
          <div class="mt-2 flex flex-col">
            <div v-for="player in activeLineupTeam?.players" :key="player.id" class="flex items-center gap-3 border-b border-border-subtle py-2.5 text-sm">
              <span class="w-6 font-mono font-bold tabular-nums opacity-60">{{ player.number ?? "–" }}</span>
              <span class="font-semibold">{{ player.name }}</span>
              <span class="ml-auto text-xs opacity-55">{{ positionLabel(player.position) }}</span>
            </div>
          </div>
        </div>
        <template v-else>
          <div class="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface/55">Startelf</div>
          <div class="mb-5 flex flex-col">
            <div v-for="player in startingLineup" :key="player.id" class="flex items-center gap-3 border-b border-border-subtle py-2.5 text-sm">
              <span class="w-6 font-mono font-bold tabular-nums opacity-60">{{ player.number ?? "–" }}</span>
              <span class="font-semibold">{{ player.name }}</span>
              <span class="ml-auto text-xs opacity-55">{{ positionLabel(player.position) }}</span>
            </div>
          </div>
          <div v-if="benchLineup.length" class="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface/55">Bank</div>
          <div class="mb-5 flex flex-col">
            <div v-for="player in benchLineup" :key="player.id" class="flex items-center gap-3 border-b border-border-subtle py-2.5 text-sm">
              <span class="w-6 font-mono font-bold tabular-nums opacity-60">{{ player.number ?? "–" }}</span>
              <span>{{ player.name }}</span>
            </div>
          </div>
        </template>

        <div v-if="activeLineupTeam?.coach_name" class="rounded-lg bg-surface-alt px-3.5 py-3 text-sm">
          <span class="opacity-60">Trainer</span> <strong class="ml-1.5">{{ activeLineupTeam.coach_name }}</strong>
        </div>
      </div>

      <!-- Statistik tab -->
      <div v-else-if="activeTab === 'stats'" class="p-4">
        <div class="mb-4 flex items-center justify-between text-sm font-semibold">
          <span>{{ homeTeam?.shortname }}</span>
          <span class="text-xs font-normal opacity-50">Ballbesitz</span>
          <span>{{ awayTeam?.shortname }}</span>
        </div>
        <div class="mb-5 flex items-center gap-2.5">
          <span class="w-11 font-mono text-lg font-bold tabular-nums">{{ possessionHomePct }}%</span>
          <span class="flex h-2.5 flex-1 overflow-hidden rounded-full bg-surface-alt">
            <span class="bg-secondary" :style="{ width: possessionHomePct + '%' }"></span>
          </span>
          <span class="w-11 text-right font-mono text-lg font-bold tabular-nums">{{ 100 - possessionHomePct }}%</span>
        </div>

        <div class="flex flex-col gap-3.5">
          <div v-for="row in [
            ['shots_home', 'shots_away', 'Torschüsse'],
            ['shots_on_target_home', 'shots_on_target_away', 'Davon aufs Tor'],
            ['corners_home', 'corners_away', 'Ecken'],
            ['fouls_home', 'fouls_away', 'Fouls'],
          ]" :key="row[2]">
            <div class="mb-1.5 flex items-baseline justify-between text-sm">
              <span class="font-mono font-bold tabular-nums">{{ ticker[row[0]] }}</span>
              <span class="text-xs opacity-55">{{ row[2] }}</span>
              <span class="font-mono font-bold tabular-nums">{{ ticker[row[1]] }}</span>
            </div>
            <div class="flex h-1.5 gap-1">
              <span class="rounded-full bg-secondary" :style="{ flex: Math.max(ticker[row[0]], 1) }"></span>
              <span class="rounded-full bg-surface-alt" :style="{ flex: Math.max(ticker[row[1]], 1) }"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabelle tab -->
      <div v-else-if="activeTab === 'table'" class="p-4">
        <div v-if="standingsLoading" class="p-8 text-center text-sm text-on-surface/55">Lädt …</div>
        <div v-else-if="!standings || standings.length === 0" class="p-8 text-center text-sm text-on-surface/55">Noch keine Tabelle verfügbar.</div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs font-semibold uppercase tracking-wide text-on-surface/50">
              <th class="pb-2 pl-1">#</th>
              <th class="pb-2">Team</th>
              <th class="pb-2 text-center">Sp</th>
              <th class="pb-2 text-center">Tore</th>
              <th class="pb-2 pr-1 text-center">Pkt</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in standings"
              :key="row.team_id"
              class="border-t border-border-subtle"
              :class="(row.team_id === homeTeam?.id || row.team_id === awayTeam?.id) ? 'bg-secondary/10' : ''"
            >
              <td class="py-2.5 pl-1 font-mono font-bold tabular-nums opacity-60">{{ index + 1 }}</td>
              <td class="truncate py-2.5 font-semibold">{{ row.name }}</td>
              <td class="py-2.5 text-center tabular-nums">{{ row.played }}</td>
              <td class="py-2.5 text-center tabular-nums">{{ row.goals_for }}:{{ row.goals_against }}</td>
              <td class="py-2.5 pr-1 text-center font-bold tabular-nums">{{ row.points }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="flex min-h-screen items-center justify-center text-sm text-on-surface/55">
      Ticker wird geladen …
    </div>
  </div>
</template>
