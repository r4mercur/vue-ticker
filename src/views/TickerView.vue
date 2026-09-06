<script setup>
import axios from "axios";
import { api_v1_url } from "@/stores/index.js";
import { useRoute } from "vue-router";
import { computed, onMounted, onUnmounted, ref } from "vue";
import AppHeader from "@/components/general/AppHeader.vue";
import GoalModal from "@/components/events/GoalModal.vue";
import CardModal from "@/components/events/CardModal.vue";
import TextModal from "@/components/events/TextModal.vue";
import SubstitutionModal from "@/components/events/SubstitutionModal.vue";
import InjuryModal from "@/components/events/InjuryModal.vue";
import VarModal from "@/components/events/VarModal.vue";
import ExtraTimeModal from "@/components/events/ExtraTimeModal.vue";
import useUserStore from "@/stores/user_store.js";
import router from "@/router/index.js";
import {
  EventTypesEnum,
  GOAL_EVENT_TYPES,
  Stopwatch,
  teamLogoSrc,
  TEAM_LOGO_PLACEHOLDER,
  describeTickerEvent,
  withRunningScore,
} from "@/helpers/index.js";

const url = api_v1_url;
const route = useRoute();
const userStore = useUserStore();
const stopwatch = new Stopwatch();

const RUNNING_STATES = ["first_half", "second_half", "third_half", "fourth_half"];
const CARD_TYPES = [EventTypesEnum.YELLOW_CARD, EventTypesEnum.YELLOW_RED_CARD, EventTypesEnum.RED_CARD];
const GOALISH_TYPES = [...GOAL_EVENT_TYPES, EventTypesEnum.MISSED_PENALTY];
const STAT_FIELDS = [
  { key: "possession", label: "Ballbesitz %", max: 100 },
  { key: "shots", label: "Schüsse" },
  { key: "shots_on_target", label: "Davon aufs Tor" },
  { key: "corners", label: "Ecken" },
  { key: "fouls", label: "Fouls" },
];

// data
const ticker = ref(null);
const clockTime = ref("00:00");
const clockRunning = ref(false);
const commentDraft = ref("");
const linkCopied = ref(false);
let tickInterval = null;

const showGoalModal = ref(false);
const goalInitialType = ref(EventTypesEnum.GOAL);
const showCardModal = ref(false);
const cardInitialType = ref(EventTypesEnum.YELLOW_CARD);
const showTextModal = ref(false);
const showSubstitutionModal = ref(false);
const showInjuryModal = ref(false);
const showVarModal = ref(false);
const showExtraTimeModal = ref(false);
const editingEvent = ref(null);

// computed
const homeTeam = computed(() => ticker.value?.game?.team_home ?? null);
const awayTeam = computed(() => ticker.value?.game?.team_away ?? null);
const allPlayers = computed(() => [...(homeTeam.value?.players ?? []), ...(awayTeam.value?.players ?? [])]);
const score = computed(() => ({ home: ticker.value?.game?.goals_home ?? 0, away: ticker.value?.game?.goals_away ?? 0 }));

const publicLink = computed(() => ticker.value?.public_slug ? `${window.location.origin}/live/${ticker.value.public_slug}` : null);

const isLive = computed(() => RUNNING_STATES.includes(ticker.value?.ticker_state));
const isNotStarted = computed(() => ticker.value?.ticker_state === "not_started");
const isHalfTime = computed(() => ticker.value?.ticker_state === "half_time");
const isEnded = computed(() => ticker.value?.ticker_state === "ended");
const eventPanelEnabled = computed(() => !isNotStarted.value);

const chronologicalEvents = computed(() => {
  return [...(ticker.value?.ticker_events ?? [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
});

const feedEvents = computed(() => withRunningScore(chronologicalEvents.value, homeTeam.value?.id, awayTeam.value?.id));

const playerName = (id) => allPlayers.value.find((p) => p.id === id)?.name ?? "Unbekannt";
const teamShortname = (teamId) => (teamId === homeTeam.value?.id ? homeTeam.value?.shortname : teamId === awayTeam.value?.id ? awayTeam.value?.shortname : "");
const describeEvent = (event) => describeTickerEvent(event, { playerName, teamShortname });

// methods
const mmssToSeconds = (minute) => {
  if (!minute) return 0;
  const [m, s] = minute.split(":").map(Number);
  return m * 60 + s;
};

const fetchTicker = () => {
  axios.get(url + `/tickers/${route.params.id}`).then((response) => {
    ticker.value = response.data;
    syncClockToState();
  }).catch((error) => {
    console.log(error);
  });
};

const startTicking = () => {
  clearInterval(tickInterval);
  tickInterval = setInterval(() => {
    clockTime.value = stopwatch.getTime();
  }, 1000);
};

const syncClockToState = () => {
  clearInterval(tickInterval);
  if (!RUNNING_STATES.includes(ticker.value.ticker_state)) {
    clockRunning.value = false;
    clockTime.value = ticker.value.ticker_state === "half_time" || ticker.value.ticker_state === "ended"
      ? (chronologicalEvents.value.at(-1)?.minute ?? "00:00")
      : "00:00";
    return;
  }

  const lastEvent = chronologicalEvents.value.at(-1);
  const base = lastEvent ? mmssToSeconds(lastEvent.minute) : (ticker.value.ticker_state === "second_half" ? 45 * 60 : 0);
  stopwatch.setTime(base);
  stopwatch.start();
  clockRunning.value = true;
  clockTime.value = stopwatch.getTime();
  startTicking();
};

const pauseClock = () => {
  stopwatch.pause();
  clockRunning.value = false;
  clearInterval(tickInterval);
};

const resumeClock = () => {
  stopwatch.start();
  clockRunning.value = true;
  startTicking();
};

const updateTickerState = (state) => {
  axios.put(url + `/tickers/${ticker.value.id}`, { ticker: { ticker_state: state } }).then(() => {
    ticker.value.ticker_state = state;
  }).catch((error) => {
    console.log(error);
  });
};

const createSystemEvent = (eventType) => {
  axios.post(url + "/ticker_events", {
    ticker_event: { ticker_id: ticker.value.id, user_id: userStore.user.id, event_type: eventType, minute: clockTime.value },
  }).then(() => {
    fetchTicker();
  }).catch((error) => {
    console.log(error);
  });
};

const kickoffFirstHalf = () => {
  stopwatch.reset();
  stopwatch.start();
  clockRunning.value = true;
  clockTime.value = "00:00";
  startTicking();
  updateTickerState("first_half");
  createSystemEvent(EventTypesEnum.START_GAME);
};

const whistleHalftime = () => {
  pauseClock();
  updateTickerState("half_time");
  createSystemEvent(EventTypesEnum.START_HALFTIME);
};

const kickoffSecondHalf = () => {
  stopwatch.setTime(45 * 60);
  stopwatch.start();
  clockRunning.value = true;
  clockTime.value = stopwatch.getTime();
  startTicking();
  updateTickerState("second_half");
};

const finalWhistle = () => {
  pauseClock();
  updateTickerState("ended");
  createSystemEvent(EventTypesEnum.END_GAME);
};

const sendComment = () => {
  if (!commentDraft.value.trim()) return;

  axios.post(url + "/ticker_events", {
    ticker_event: { ticker_id: ticker.value.id, user_id: userStore.user.id, event_type: EventTypesEnum.TEXT, minute: clockTime.value, text: commentDraft.value.trim() },
  }).then(() => {
    commentDraft.value = "";
    fetchTicker();
  }).catch((error) => {
    console.log(error);
  });
};

const statValue = (key, side) => ticker.value?.[`${key}_${side}`] ?? 0;

const adjustStat = (key, side, delta, max) => {
  const field = `${key}_${side}`;
  const next = Math.max(0, Math.min(max ?? Infinity, statValue(key, side) + delta));
  // Update optimistically (and synchronously) so rapid clicks stack correctly
  // instead of each one reading the same stale value while its predecessor's
  // PATCH is still in flight.
  ticker.value[field] = next;

  axios.put(url + `/tickers/${ticker.value.id}`, { ticker: { [field]: next } }).catch((error) => {
    console.log(error);
  });
};

const copyPublicLink = () => {
  if (!publicLink.value) return;

  navigator.clipboard.writeText(publicLink.value).then(() => {
    linkCopied.value = true;
    setTimeout(() => { linkCopied.value = false; }, 2000);
  }).catch((error) => {
    console.log(error);
  });
};

const resetModals = () => {
  showGoalModal.value = false;
  showCardModal.value = false;
  showTextModal.value = false;
  showSubstitutionModal.value = false;
  showInjuryModal.value = false;
  showVarModal.value = false;
  showExtraTimeModal.value = false;
  editingEvent.value = null;
};

const openGoal = (initialType) => {
  editingEvent.value = null;
  goalInitialType.value = initialType;
  showGoalModal.value = true;
};

const openCard = (initialType) => {
  editingEvent.value = null;
  cardInitialType.value = initialType;
  showCardModal.value = true;
};

const openText = () => {
  editingEvent.value = null;
  showTextModal.value = true;
};

const openSubstitution = () => {
  editingEvent.value = null;
  showSubstitutionModal.value = true;
};

const openInjury = () => {
  editingEvent.value = null;
  showInjuryModal.value = true;
};

const openVar = () => {
  editingEvent.value = null;
  showVarModal.value = true;
};

const openExtraTime = () => {
  editingEvent.value = null;
  showExtraTimeModal.value = true;
};

const editEvent = (event) => {
  editingEvent.value = event;
  if (GOALISH_TYPES.includes(event.event_type)) {
    goalInitialType.value = event.event_type === EventTypesEnum.MISSED_PENALTY ? EventTypesEnum.PENALTY_GOAL : event.event_type;
    showGoalModal.value = true;
  } else if (CARD_TYPES.includes(event.event_type)) {
    cardInitialType.value = event.event_type;
    showCardModal.value = true;
  } else if (event.event_type === EventTypesEnum.TEXT) {
    showTextModal.value = true;
  } else if (event.event_type === EventTypesEnum.SUBSTITUTION) {
    showSubstitutionModal.value = true;
  } else if (event.event_type === EventTypesEnum.INJURY) {
    showInjuryModal.value = true;
  } else if (event.event_type === EventTypesEnum.VAR_DECISION) {
    showVarModal.value = true;
  } else if (event.event_type === EventTypesEnum.EXTRA_TIME) {
    showExtraTimeModal.value = true;
  } else {
    editingEvent.value = null;
    alert("Dieser Event-Typ kann noch nicht bearbeitet werden.");
  }
};

const saveEvent = (payload) => {
  const request = editingEvent.value
    ? axios.put(url + `/ticker_events/${editingEvent.value.id}`, { ticker_event: payload })
    : axios.post(url + "/ticker_events", { ticker_event: { ticker_id: ticker.value.id, user_id: userStore.user.id, ...payload } });

  request.then(() => {
    resetModals();
    fetchTicker();
  }).catch((error) => {
    console.log(error);
    alert("Event konnte nicht gespeichert werden.");
  });
};

const deleteEvent = (event) => {
  if (!confirm("Dieses Event wirklich löschen?")) return;

  axios.delete(url + `/ticker_events/${event.id}`).then((response) => {
    if (response.status === 204) fetchTicker();
  }).catch((error) => {
    console.log(error);
  });
};

onMounted(() => {
  fetchTicker();
});

onUnmounted(() => {
  clearInterval(tickInterval);
});
</script>

<template>
  <app-header />

  <div v-if="ticker" class="mt-16">
    <!-- meta row -->
    <div class="border-b border-border-subtle bg-surface px-6 pt-4 sm:px-10">
      <div class="mb-3.5 flex items-center gap-3">
        <router-link to="/games" class="flex items-center gap-1.5 text-sm font-semibold hover:underline">
          <v-icon name="md-chevronright" scale="0.9" class="rotate-180" />Alle Ticker
        </router-link>
        <span class="text-sm text-on-surface/55">{{ ticker.game.location }}</span>
        <div class="ml-auto flex items-center gap-2">
          <span v-if="isLive" class="flex items-center gap-1.5 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-bold text-orange-600 dark:text-orange-400">
            <span class="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span>LIVE
          </span>
          <button v-if="publicLink" type="button" @click="copyPublicLink" class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-semibold hover:border-secondary hover:text-secondary">
            <v-icon :name="linkCopied ? 'md-check' : 'md-contentcopy'" scale="0.8" />{{ linkCopied ? "Kopiert" : "Öffentlicher Link" }}
          </button>
        </div>
      </div>

      <!-- score header -->
      <div class="grid grid-cols-[minmax(0,1fr)_200px_minmax(0,1fr)] items-center gap-4 pb-4">
        <div class="flex items-center justify-end gap-3 text-right">
          <div>
            <div class="text-base font-semibold">{{ homeTeam?.name }}</div>
            <div class="mt-0.5 text-xs text-on-surface/55">Heim · {{ homeTeam?.shortname }}</div>
          </div>
          <img :src="teamLogoSrc(homeTeam?.logo_url)" @error="(e) => e.target.src = TEAM_LOGO_PLACEHOLDER" class="h-10 w-10 shrink-0 object-contain" alt="" />
        </div>
        <div class="text-center">
          <div class="font-mono text-4xl font-bold tabular-nums">{{ score.home }} : {{ score.away }}</div>
          <div class="mt-1.5 inline-flex items-center gap-2 rounded-full bg-surface-alt px-3 py-1 text-sm">
            <span class="font-mono font-bold tabular-nums">{{ isNotStarted ? "–" : clockTime }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <img :src="teamLogoSrc(awayTeam?.logo_url)" @error="(e) => e.target.src = TEAM_LOGO_PLACEHOLDER" class="h-10 w-10 shrink-0 object-contain" alt="" />
          <div>
            <div class="text-base font-semibold">{{ awayTeam?.name }}</div>
            <div class="mt-0.5 text-xs text-on-surface/55">Gast · {{ awayTeam?.shortname }}</div>
          </div>
        </div>
      </div>

      <!-- match control -->
      <div class="flex flex-wrap items-center gap-2 border-t border-border-subtle py-3">
        <span class="mr-1 text-xs font-semibold uppercase tracking-wide text-on-surface/50">Spielsteuerung</span>

        <button v-if="isNotStarted" type="button" @click="kickoffFirstHalf" class="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">
          1. Halbzeit anpfeifen
        </button>

        <template v-if="isLive">
          <button type="button" @click="clockRunning ? pauseClock() : resumeClock()" class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-2 text-sm font-semibold hover:border-secondary hover:text-secondary">
            <v-icon :name="clockRunning ? 'md-pause' : 'md-playarrow'" scale="0.9" />{{ clockRunning ? "Uhr anhalten" : "Uhr fortsetzen" }}
          </button>
          <button type="button" @click="openExtraTime" class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-2 text-sm font-semibold hover:border-secondary hover:text-secondary">
            <v-icon name="md-accesstime" scale="0.9" />Nachspielzeit
          </button>
          <button v-if="ticker.ticker_state === 'first_half'" type="button" @click="whistleHalftime" class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-black">
            Halbzeit pfeifen
          </button>
          <button v-else type="button" @click="finalWhistle" class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-500/45 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-500/10">
            Abpfiff
          </button>
        </template>

        <button v-if="isHalfTime" type="button" @click="kickoffSecondHalf" class="cursor-pointer rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-white hover:bg-indigo-600">
          2. Halbzeit anpfeifen
        </button>

        <span v-if="isEnded" class="rounded-lg bg-surface-alt px-3 py-2 text-sm font-semibold opacity-70">Ticker abgeschlossen — Korrekturen weiter möglich</span>
      </div>
    </div>

    <!-- workspace -->
    <div class="grid grid-cols-1 gap-0 bg-surface-alt lg:grid-cols-[minmax(0,1fr)_330px]">
      <div class="px-6 py-5 sm:px-10">
        <div v-if="!eventPanelEnabled" class="mb-4 rounded-lg border border-dashed border-border-subtle bg-surface px-4 py-3 text-sm text-on-surface/55">
          Die Event-Palette ist bis zum Anpfiff gesperrt.
        </div>

        <div v-else class="mb-4 flex items-center gap-2.5 rounded-lg border border-border-subtle bg-surface px-3 py-2">
          <span class="rounded-md bg-surface-alt px-2 py-1 font-mono text-sm font-bold">{{ clockTime }}</span>
          <input v-model="commentDraft" type="text" placeholder="Was passiert gerade? Enter sendet." @keyup.enter="sendComment" class="h-8 min-w-0 flex-1 border-0 bg-transparent text-sm outline-none" />
          <button type="button" @click="sendComment" class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-600">
            <v-icon name="md-send" scale="0.8" />Kommentar
          </button>
        </div>

        <div class="mb-2.5 flex items-center justify-between">
          <span class="text-sm font-semibold uppercase tracking-wide text-on-surface/65">Verlauf · {{ ticker.ticker_events.length }} Events</span>
          <span class="text-xs text-on-surface/50">Neueste oben</span>
        </div>

        <div v-if="feedEvents.length === 0" class="rounded-xl border border-dashed border-border-subtle bg-surface p-8 text-center text-sm text-on-surface/55">
          Noch keine Ereignisse.
        </div>

        <div class="flex flex-col gap-2">
          <div
            v-for="event in feedEvents"
            :key="event.id"
            class="grid grid-cols-[48px_28px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border bg-surface px-3.5 py-3"
            :class="describeEvent(event).system ? 'border-dashed border-border-subtle' : 'border-border-subtle'"
          >
            <span class="font-mono text-base font-bold tabular-nums opacity-70">{{ event.minute?.split(":")[0] }}'</span>

            <span v-if="describeEvent(event).card" class="h-5 w-4 rounded-sm" :class="{
              'bg-amber-400': describeEvent(event).card === EventTypesEnum.YELLOW_CARD,
              'bg-red-500': describeEvent(event).card === EventTypesEnum.RED_CARD,
            }" :style="describeEvent(event).card === EventTypesEnum.YELLOW_RED_CARD ? 'background:linear-gradient(160deg,#fbbf24 0 50%,#ef4444 50% 100%)' : ''"></span>
            <v-icon v-else-if="describeEvent(event).goal" name="md-sportssoccer" scale="1.1" class="text-secondary" />
            <v-icon v-else-if="describeEvent(event).text" name="bi-chat-text-fill" scale="1" class="opacity-60" />
            <v-icon v-else-if="describeEvent(event).substitution" name="md-swaphoriz" scale="1.1" class="text-emerald-600" />
            <v-icon v-else-if="describeEvent(event).injury" name="md-medicalservices" scale="1.1" class="text-pink-600" />
            <v-icon v-else-if="describeEvent(event).varDecision" name="md-sync" scale="1.1" class="text-violet-600" />
            <v-icon v-else-if="describeEvent(event).extraTime" name="md-accesstime" scale="1" class="opacity-60" />
            <span v-else></span>

            <span class="min-w-0">
              <span class="text-sm font-semibold">
                {{ describeEvent(event).title }}
                <span v-if="describeEvent(event).score" class="ml-1.5 rounded bg-secondary px-1.5 py-0.5 font-mono text-xs font-bold text-white">{{ describeEvent(event).score }}</span>
              </span>
              <span v-if="describeEvent(event).subtitle" class="block text-xs text-on-surface/60">{{ describeEvent(event).subtitle }}</span>
            </span>

            <div v-if="!describeEvent(event).system" class="flex gap-1">
              <button type="button" title="Bearbeiten" @click="editEvent(event)" class="cursor-pointer rounded-md p-1.5 opacity-50 hover:opacity-100 hover:text-secondary">
                <v-icon name="md-modeedit-outlined" scale="0.85" />
              </button>
              <button type="button" title="Löschen" @click="deleteEvent(event)" class="cursor-pointer rounded-md p-1.5 opacity-50 hover:opacity-100 hover:text-red-500">
                <v-icon name="md-delete-outlined" scale="0.85" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-border-subtle bg-surface px-6 py-5 lg:border-l lg:border-t-0" :class="{ 'pointer-events-none opacity-40': !eventPanelEnabled }">
        <div class="mb-2.5 text-sm font-semibold uppercase tracking-wide text-on-surface/65">Event anlegen</div>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" @click="openGoal(EventTypesEnum.GOAL)" class="flex cursor-pointer flex-col items-start gap-2 rounded-lg border border-secondary bg-secondary px-3 py-3.5 text-sm font-semibold text-white">
            <v-icon name="md-sportssoccer" scale="1.3" />Tor
          </button>
          <button type="button" @click="openCard(EventTypesEnum.YELLOW_CARD)" class="flex cursor-pointer flex-col items-start gap-2 rounded-lg border border-border-subtle px-3 py-3.5 text-sm font-semibold hover:border-secondary hover:text-secondary">
            <span class="h-5 w-4 rounded-sm bg-amber-400"></span>Karte
          </button>
          <button type="button" @click="openSubstitution" class="flex cursor-pointer flex-col items-start gap-2 rounded-lg border border-border-subtle px-3 py-3.5 text-sm font-semibold hover:border-secondary hover:text-secondary">
            <v-icon name="md-swaphoriz" scale="1.3" />Wechsel
          </button>
          <button type="button" @click="openText" class="flex cursor-pointer flex-col items-start gap-2 rounded-lg border border-border-subtle px-3 py-3.5 text-sm font-semibold hover:border-secondary hover:text-secondary">
            <v-icon name="bi-chat-text-fill" scale="1.3" />Text
          </button>
        </div>

        <div class="mb-2.5 mt-4 text-sm font-semibold uppercase tracking-wide text-on-surface/65">Seltener</div>
        <div class="flex flex-col gap-1.5">
          <button type="button" @click="openGoal(EventTypesEnum.PENALTY_GOAL)" class="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border-subtle px-3 py-2.5 text-sm font-semibold hover:border-secondary hover:text-secondary">
            <v-icon name="md-sportssoccer" scale="1" class="text-secondary" />Elfmeter
          </button>
          <button type="button" @click="openGoal(EventTypesEnum.OWN_GOAL)" class="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border-subtle px-3 py-2.5 text-sm font-semibold hover:border-secondary hover:text-secondary">
            <v-icon name="md-swaphoriz" scale="1" class="text-secondary" />Eigentor
          </button>
          <button type="button" @click="openInjury" class="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border-subtle px-3 py-2.5 text-sm font-semibold hover:border-secondary hover:text-secondary">
            <v-icon name="md-medicalservices" scale="1" />Verletzung
          </button>
          <button type="button" @click="openVar" class="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border-subtle px-3 py-2.5 text-sm font-semibold hover:border-secondary hover:text-secondary">
            <v-icon name="md-sync" scale="1" />VAR-Entscheidung
          </button>
        </div>

        <div class="mb-2.5 mt-4 text-sm font-semibold uppercase tracking-wide text-on-surface/65">Statistik</div>
        <div class="flex flex-col gap-3 text-sm">
          <div v-for="field in STAT_FIELDS" :key="field.key">
            <div class="mb-1 text-center text-xs text-on-surface/55">{{ field.label }}</div>
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5">
                <button type="button" @click="adjustStat(field.key, 'home', -1, field.max)" class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-border-subtle text-xs font-bold hover:border-secondary">–</button>
                <span class="w-6 text-center font-mono font-semibold tabular-nums">{{ statValue(field.key, "home") }}</span>
                <button type="button" @click="adjustStat(field.key, 'home', 1, field.max)" class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-border-subtle text-xs font-bold hover:border-secondary">+</button>
              </div>
              <div class="flex items-center gap-1.5">
                <button type="button" @click="adjustStat(field.key, 'away', -1, field.max)" class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-border-subtle text-xs font-bold hover:border-secondary">–</button>
                <span class="w-6 text-center font-mono font-semibold tabular-nums">{{ statValue(field.key, "away") }}</span>
                <button type="button" @click="adjustStat(field.key, 'away', 1, field.max)" class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-border-subtle text-xs font-bold hover:border-secondary">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <GoalModal
    v-if="showGoalModal && homeTeam"
    :home-team="homeTeam"
    :away-team="awayTeam"
    :current-minute="clockTime"
    :current-score="score"
    :initial-type="goalInitialType"
    :editing-event="editingEvent"
    @close="resetModals"
    @save="saveEvent"
  />
  <CardModal
    v-if="showCardModal && homeTeam"
    :home-team="homeTeam"
    :away-team="awayTeam"
    :current-minute="clockTime"
    :events="ticker.ticker_events"
    :initial-card-type="cardInitialType"
    :editing-event="editingEvent"
    @close="resetModals"
    @save="saveEvent"
  />
  <TextModal
    v-if="showTextModal"
    :current-minute="clockTime"
    :editing-event="editingEvent"
    @close="resetModals"
    @save="saveEvent"
  />
  <SubstitutionModal
    v-if="showSubstitutionModal && homeTeam"
    :home-team="homeTeam"
    :away-team="awayTeam"
    :current-minute="clockTime"
    :editing-event="editingEvent"
    @close="resetModals"
    @save="saveEvent"
  />
  <InjuryModal
    v-if="showInjuryModal && homeTeam"
    :home-team="homeTeam"
    :away-team="awayTeam"
    :current-minute="clockTime"
    :editing-event="editingEvent"
    @close="resetModals"
    @save="saveEvent"
  />
  <VarModal
    v-if="showVarModal && homeTeam"
    :home-team="homeTeam"
    :away-team="awayTeam"
    :current-minute="clockTime"
    :editing-event="editingEvent"
    @close="resetModals"
    @save="saveEvent"
  />
  <ExtraTimeModal
    v-if="showExtraTimeModal"
    :current-minute="clockTime"
    :editing-event="editingEvent"
    @close="resetModals"
    @save="saveEvent"
  />
</template>
