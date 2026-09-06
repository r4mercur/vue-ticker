<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import AppHeader from "@/components/general/AppHeader.vue";
import Modal from "@/components/general/Modal.vue";
import { api_information, api_v1_url } from "@/stores/index.js";
import {
  TEAM_LOGO_PLACEHOLDER,
  teamLogoSrc,
  PLAYER_POSITIONS,
  positionLabel,
  PlayerStatusLabels,
  ageToBirthYear,
  birthYearToAge,
} from "@/helpers/index.js";

const url = api_v1_url;
const assetBaseUrl = api_information.url;
const route = useRoute();

// data
const team = ref(null);
const imageUpdateKey = ref(0);

const showTeamModal = ref(false);
const teamForm = ref({ name: "", shortname: "" });

const showPlayerModal = ref(false);
const editingPlayer = ref(null);
const playerModalForm = ref({ number: "", name: "", position: "", birth_year: "", status: "active" });

const newPlayer = ref({ number: "", name: "", position: "", birth_year: "" });

// computed
const players = computed(() => team.value?.players ?? []);
const competitionName = computed(() => team.value?.competitions?.[0]?.name ?? null);

// methods
const fetchTeam = () => {
  axios.get(url + `/teams/${route.params.id}`).then((response) => {
    team.value = response.data;
  }).catch((error) => {
    console.log(error);
  });
};

const openTeamModal = () => {
  teamForm.value = { name: team.value.name, shortname: team.value.shortname };
  showTeamModal.value = true;
};

const saveTeam = () => {
  axios.put(url + `/teams/${team.value.id}`, {
    team: { name: teamForm.value.name, shortname: teamForm.value.shortname },
  }).then((response) => {
    team.value = { ...team.value, ...response.data };
    showTeamModal.value = false;
  }).catch((error) => {
    console.log(error);
  });
};

const uploadTeamLogo = (event) => {
  const reader = new FileReader();
  const file = event.target.files[0];
  reader.readAsDataURL(file);
  reader.onload = () => {
    axios.post(url + `/teams/${team.value.id}/upload_logo`, {
      id: team.value.id,
      logo: reader.result,
    }).then(() => {
      imageUpdateKey.value = Date.now();
    }).catch((error) => {
      console.log(error);
    });
  };
};

const addPlayer = () => {
  if (!newPlayer.value.name.trim()) {
    alert("Bitte einen Namen angeben.");
    return;
  }

  axios.post(url + "/players", {
    player: {
      name: newPlayer.value.name,
      number: newPlayer.value.number || null,
      position: newPlayer.value.position || null,
      age: birthYearToAge(newPlayer.value.birth_year || null),
      team_id: team.value.id,
    },
  }).then((response) => {
    team.value.players.push(response.data);
    newPlayer.value = { number: "", name: "", position: "", birth_year: "" };
  }).catch((error) => {
    console.log(error);
  });
};

const openEditPlayer = (player) => {
  editingPlayer.value = player;
  playerModalForm.value = {
    number: player.number ?? "",
    name: player.name,
    position: player.position ?? "",
    birth_year: ageToBirthYear(player.age) ?? "",
    status: player.status,
  };
  showPlayerModal.value = true;
};

const savePlayer = () => {
  axios.put(url + `/players/${editingPlayer.value.id}`, {
    player: {
      name: playerModalForm.value.name,
      number: playerModalForm.value.number || null,
      position: playerModalForm.value.position || null,
      age: birthYearToAge(playerModalForm.value.birth_year || null),
      status: playerModalForm.value.status,
    },
  }).then((response) => {
    const index = team.value.players.findIndex((p) => p.id === editingPlayer.value.id);
    team.value.players[index] = response.data;
    showPlayerModal.value = false;
  }).catch((error) => {
    console.log(error);
  });
};

const deletePlayer = (player) => {
  if (!confirm(`${player.name} wirklich aus dem Kader entfernen?`)) return;

  axios.delete(url + `/players/${player.id}`).then((response) => {
    if (response.status === 204) {
      team.value.players = team.value.players.filter((p) => p.id !== player.id);
    }
  }).catch((error) => {
    console.log(error);
  });
};

onMounted(() => {
  fetchTeam();
});
</script>

<template>
  <AppHeader />

  <div v-if="team" class="mt-16 px-6 py-6 sm:px-10">
    <div class="mb-3 flex items-center gap-2 text-sm text-on-surface/60">
      <router-link to="/teams" class="hover:underline">Teams</router-link>
      <span>/</span>
      <span class="font-semibold text-on-surface/90">{{ team.name }}</span>
    </div>

    <div class="mb-5 flex flex-wrap items-center gap-5 rounded-xl border border-border-subtle bg-surface p-5">
      <img :src="assetBaseUrl + '/images/team_' + team.id + '.png?' + imageUpdateKey" @error="(e) => e.target.src = TEAM_LOGO_PLACEHOLDER" class="h-14 w-14 shrink-0 object-contain" alt="" />
      <div class="flex-1">
        <h1 class="text-2xl font-bold">{{ team.name }}</h1>
        <p class="mt-0.5 text-sm text-on-surface/60">
          {{ team.shortname }}<span v-if="competitionName"> · {{ competitionName }}</span> · {{ players.length }} Spieler im Kader
        </p>
      </div>
      <button type="button" @click="openTeamModal" class="cursor-pointer rounded-lg border border-border-subtle px-3.5 py-2 text-sm font-semibold hover:border-secondary hover:text-secondary">
        Stammdaten
      </button>
    </div>

    <div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div class="overflow-hidden rounded-xl border border-border-subtle bg-surface">
        <div class="grid grid-cols-[52px_minmax(0,1fr)_120px_90px_120px_76px] items-center gap-3 border-b border-border-subtle bg-surface-alt px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-on-surface/55">
          <span>Nr.</span><span>Name</span><span>Position</span><span>Jahrgang</span><span>Status</span><span></span>
        </div>

        <div v-if="players.length === 0" class="p-8 text-center text-sm text-on-surface/60">
          Noch keine Spieler im Kader.
        </div>

        <div v-for="player in players" :key="player.id" class="grid grid-cols-[52px_minmax(0,1fr)_120px_90px_120px_76px] items-center gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0">
          <span class="font-mono text-lg font-bold tabular-nums">{{ player.number ?? "–" }}</span>
          <span class="truncate text-sm font-semibold">{{ player.name }}</span>
          <span class="text-sm text-on-surface/70">{{ positionLabel(player.position) }}</span>
          <span class="text-sm tabular-nums text-on-surface/70">{{ ageToBirthYear(player.age) ?? "–" }}</span>
          <span
            class="w-fit rounded-full px-2.5 py-1 text-xs font-bold"
            :class="{
              'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400': player.status === 'active',
              'bg-amber-500/15 text-amber-600 dark:text-amber-400': player.status === 'injured',
              'bg-red-500/15 text-red-600 dark:text-red-400': player.status === 'suspended',
            }"
          >
            {{ PlayerStatusLabels[player.status] }}
          </span>
          <div class="flex justify-end gap-1">
            <button type="button" title="Bearbeiten" @click="openEditPlayer(player)" class="cursor-pointer rounded-md p-1.5 opacity-60 hover:opacity-100 hover:text-secondary">
              <v-icon name="md-modeedit-outlined" scale="0.9" />
            </button>
            <button type="button" title="Entfernen" @click="deletePlayer(player)" class="cursor-pointer rounded-md p-1.5 opacity-60 hover:opacity-100 hover:text-red-500">
              <v-icon name="md-delete-outlined" scale="0.9" />
            </button>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-secondary bg-surface p-5">
        <h3 class="text-lg font-bold">Spieler hinzufügen</h3>
        <p class="mb-4 mt-1 text-sm text-on-surface/60">Bleibt offen — mehrere Spieler nacheinander eintragen.</p>

        <div class="flex flex-col gap-3">
          <div class="grid grid-cols-[70px_minmax(0,1fr)] gap-2.5">
            <div class="flex flex-col gap-1">
              <label for="new_player_number" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Nr.</label>
              <input id="new_player_number" v-model="newPlayer.number" type="number" min="1" class="h-9 w-full rounded-lg border border-border-subtle bg-surface px-2.5 text-sm outline-none focus:border-2 focus:border-secondary" />
            </div>
            <div class="flex flex-col gap-1">
              <label for="new_player_name" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Name</label>
              <input id="new_player_name" v-model="newPlayer.name" type="text" placeholder="Vor- und Nachname" class="h-9 w-full rounded-lg border border-border-subtle bg-surface px-2.5 text-sm outline-none focus:border-2 focus:border-secondary" />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Position</label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="pos in PLAYER_POSITIONS"
                :key="pos.value"
                type="button"
                @click="newPlayer.position = pos.value"
                class="cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold"
                :class="newPlayer.position === pos.value ? 'border-secondary bg-secondary text-white' : 'border-border-subtle'"
              >
                {{ pos.code }}
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label for="new_player_year" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">
              Jahrgang <span class="font-normal normal-case">optional</span>
            </label>
            <input id="new_player_year" v-model="newPlayer.birth_year" type="number" placeholder="2000" class="h-9 w-full rounded-lg border border-border-subtle bg-surface px-2.5 text-sm outline-none focus:border-2 focus:border-secondary" />
          </div>

          <button type="button" @click="addPlayer" class="mt-1 cursor-pointer rounded-lg bg-secondary py-2.5 text-sm font-semibold text-white hover:bg-indigo-600">
            Hinzufügen &amp; nächster
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- team master-data modal -->
  <Modal v-if="showTeamModal" @close="showTeamModal = false" @confirm="saveTeam" text="Speichern">
    <template #header><span>Stammdaten</span></template>
    <template #body>
      <div class="flex flex-col space-y-4">
        <div class="flex flex-col space-y-2">
          <label for="team_name">Name</label>
          <input v-model="teamForm.name" type="text" id="team_name" class="w-full bg-surface-alt text-on-surface border border-border-subtle rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-secondary" />
        </div>
        <div class="flex flex-col space-y-2">
          <label for="team_shortname">Abkürzung</label>
          <input v-model="teamForm.shortname" type="text" id="team_shortname" class="w-full bg-surface-alt text-on-surface border border-border-subtle rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-secondary" />
        </div>
        <div class="flex flex-col space-y-2">
          <label for="team_logo">Teamlogo</label>
          <input type="file" id="team_logo" accept="image/*" class="w-full bg-surface-alt text-on-surface border border-border-subtle rounded-md p-2" @change="uploadTeamLogo" />
        </div>
      </div>
    </template>
  </Modal>

  <!-- player edit modal -->
  <Modal v-if="showPlayerModal" @close="showPlayerModal = false" @confirm="savePlayer" text="Speichern">
    <template #header><span>Spieler bearbeiten</span></template>
    <template #body>
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-[80px_minmax(0,1fr)] gap-3">
          <div class="flex flex-col gap-1.5">
            <label for="player_number" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Nr.</label>
            <input id="player_number" v-model="playerModalForm.number" type="number" min="1" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm outline-none focus:border-2 focus:border-secondary" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="player_name" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Name</label>
            <input id="player_name" v-model="playerModalForm.name" type="text" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm outline-none focus:border-2 focus:border-secondary" />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Position</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="pos in PLAYER_POSITIONS"
              :key="pos.value"
              type="button"
              @click="playerModalForm.position = pos.value"
              class="cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold"
              :class="playerModalForm.position === pos.value ? 'border-secondary bg-secondary text-white' : 'border-border-subtle'"
            >
              {{ pos.code }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label for="player_year" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Jahrgang</label>
            <input id="player_year" v-model="playerModalForm.birth_year" type="number" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm outline-none focus:border-2 focus:border-secondary" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="player_status" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Status</label>
            <select id="player_status" v-model="playerModalForm.status" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm outline-none focus:border-2 focus:border-secondary">
              <option v-for="(label, value) in PlayerStatusLabels" :key="value" :value="value">{{ label }}</option>
            </select>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped>

</style>
