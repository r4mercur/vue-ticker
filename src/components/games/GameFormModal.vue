<script setup>
import { computed, onMounted, ref, watch } from "vue";
import axios from "axios";
import Modal from "@/components/general/Modal.vue";
import { useCompetitionStore } from "@/stores/competition_store.js";
import useUserStore from "@/stores/user_store.js";
import { api_v1_url } from "@/stores/index.js";
import { teamLogoSrc, TEAM_LOGO_PLACEHOLDER } from "@/helpers/index.js";

const url = api_v1_url;
const competitionStore = useCompetitionStore();
const userStore = useUserStore();

const props = defineProps({
  initialCompetitionId: {
    type: [Number, String],
    default: null,
  },
  initialMatchDay: {
    type: [Number, String],
    default: 1,
  },
});

const emit = defineEmits(["close", "created"]);

const teams = ref([]);
const errorMessage = ref("");
const submitting = ref(false);

const form = ref({
  competition_id: props.initialCompetitionId ?? "",
  match_day: props.initialMatchDay ?? 1,
  date: "",
  time: "15:00",
  team_home_id: "",
  team_away_id: "",
  location: "",
  create_ticker: true,
});

const homeTeam = computed(() => teams.value.find((t) => t.id === Number(form.value.team_home_id)));
const awayTeam = computed(() => teams.value.find((t) => t.id === Number(form.value.team_away_id)));

const canSubmit = computed(() => {
  return form.value.competition_id && form.value.match_day && form.value.date && form.value.time
    && form.value.team_home_id && form.value.team_away_id
    && form.value.team_home_id !== form.value.team_away_id
    && form.value.location.trim() !== "";
});

const fetchTeams = (competitionId) => {
  if (!competitionId) {
    teams.value = [];
    return;
  }
  axios.get(url + `/competitions/${competitionId}/teams`).then((response) => {
    teams.value = response.data;
  }).catch((error) => {
    console.log(error);
  });
};

// `date`/`time` inputs give local wall-clock values with no timezone info;
// build a real Date from the local parts so it converts to the correct UTC
// instant instead of being misread as UTC by the backend.
const kickoffAsIsoString = () => {
  const [year, month, day] = form.value.date.split("-").map(Number);
  const [hours, minutes] = form.value.time.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
};

const swapTeams = () => {
  const home = form.value.team_home_id;
  form.value.team_home_id = form.value.team_away_id;
  form.value.team_away_id = home;
};

const submit = () => {
  if (submitting.value) return;
  if (!canSubmit.value) {
    alert("Bitte Wettbewerb, Spieltag, Datum, Anstoß, Spielort und beide Teams (unterschiedlich) angeben.");
    return;
  }
  errorMessage.value = "";
  submitting.value = true;

  axios.post(url + "/games", {
    game: {
      competition_id: form.value.competition_id,
      team_home_id: form.value.team_home_id,
      team_away_id: form.value.team_away_id,
      match_day: form.value.match_day,
      location: form.value.location,
      date: kickoffAsIsoString(),
    },
  }).then((response) => {
    const game = response.data;

    if (!form.value.create_ticker) {
      emit("created", { game, ticker: null });
      return;
    }

    return axios.post(url + "/tickers", {
      ticker: {
        game_id: game.id,
        user_id: userStore.user.id,
        ticker_state: 0,
      },
    }).then((tickerResponse) => {
      emit("created", { game, ticker: tickerResponse.data });
    }).catch((error) => {
      console.log(error);
      emit("created", { game, ticker: null });
    });
  }).catch((error) => {
    errorMessage.value = formatErrors(error.response?.data);
    console.log(error);
  }).finally(() => {
    submitting.value = false;
  });
};

const formatErrors = (errors) => {
  if (!errors || typeof errors !== "object") return "Spiel konnte nicht angelegt werden. Bitte Eingaben prüfen.";
  return Object.entries(errors).map(([field, messages]) => `${field} ${[].concat(messages).join(", ")}`).join(" · ");
};

watch(() => form.value.competition_id, (competitionId) => {
  form.value.team_home_id = "";
  form.value.team_away_id = "";
  fetchTeams(competitionId);
});

onMounted(() => {
  if (competitionStore.competitions.length === 0) {
    competitionStore.fetchCompetitions();
  }
  if (form.value.competition_id) {
    fetchTeams(form.value.competition_id);
  }
});
</script>

<template>
  <Modal @close="emit('close')" @confirm="submit" :text="submitting ? 'Wird angelegt …' : 'Spiel anlegen'">
    <template #header>
      <span>Spiel anlegen</span>
    </template>

    <template #body>
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label for="game_competition" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Wettbewerb</label>
            <select id="game_competition" v-model="form.competition_id" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm text-on-surface outline-none focus:border-2 focus:border-secondary">
              <option value="" disabled>Bitte wählen …</option>
              <option v-for="competition in competitionStore.competitions" :key="competition.id" :value="competition.id">{{ competition.name }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="game_match_day" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Spieltag</label>
            <input id="game_match_day" v-model="form.match_day" type="number" min="1" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm text-on-surface outline-none focus:border-2 focus:border-secondary" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label for="game_date" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Datum</label>
            <input id="game_date" v-model="form.date" type="date" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm text-on-surface outline-none focus:border-2 focus:border-secondary" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="game_time" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Anstoß</label>
            <input id="game_time" v-model="form.time" type="time" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm text-on-surface outline-none focus:border-2 focus:border-secondary" />
          </div>
        </div>

        <div class="grid grid-cols-[1fr_40px_1fr] items-end gap-2">
          <div class="flex flex-col gap-1.5">
            <label for="game_team_home" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Heimteam</label>
            <select id="game_team_home" v-model="form.team_home_id" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm text-on-surface outline-none focus:border-2 focus:border-secondary">
              <option value="" disabled>Team wählen …</option>
              <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
            </select>
          </div>
          <button type="button" title="Teams tauschen" @click="swapTeams" class="flex h-10 cursor-pointer items-center justify-center rounded-lg border border-border-subtle hover:border-secondary hover:text-secondary">
            ⇄
          </button>
          <div class="flex flex-col gap-1.5">
            <label for="game_team_away" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Auswärtsteam</label>
            <select id="game_team_away" v-model="form.team_away_id" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm text-on-surface outline-none focus:border-2 focus:border-secondary">
              <option value="" disabled>Team wählen …</option>
              <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
            </select>
          </div>
        </div>

        <div v-if="homeTeam || awayTeam" class="flex items-center justify-center gap-3 text-sm text-on-surface/70">
          <span class="flex items-center gap-2"><img v-if="homeTeam" :src="teamLogoSrc(homeTeam.logo_url)" @error="(e) => e.target.src = TEAM_LOGO_PLACEHOLDER" class="h-5 w-5 object-contain" alt="" />{{ homeTeam?.name ?? "…" }}</span>
          <span class="opacity-50">vs.</span>
          <span class="flex items-center gap-2">{{ awayTeam?.name ?? "…" }}<img v-if="awayTeam" :src="teamLogoSrc(awayTeam.logo_url)" @error="(e) => e.target.src = TEAM_LOGO_PLACEHOLDER" class="h-5 w-5 object-contain" alt="" /></span>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="game_location" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Spielort</label>
          <input id="game_location" v-model="form.location" type="text" placeholder="Sportplatz …" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm text-on-surface outline-none focus:border-2 focus:border-secondary" />
        </div>

        <label class="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border-subtle px-3 py-2.5 text-sm">
          <input v-model="form.create_ticker" type="checkbox" class="h-4 w-4 accent-secondary" />
          Ticker direkt mit anlegen und mir zuweisen
        </label>

        <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
      </div>
    </template>
  </Modal>
</template>
