<script setup>
import { computed, ref } from "vue";
import Modal from "@/components/general/Modal.vue";
import { EventTypesEnum, GOAL_TYPES } from "@/helpers/index.js";

const props = defineProps({
  homeTeam: { type: Object, required: true },
  awayTeam: { type: Object, required: true },
  currentMinute: { type: String, default: "00:00" },
  currentScore: { type: Object, default: () => ({ home: 0, away: 0 }) },
  initialType: { type: Number, default: EventTypesEnum.GOAL },
  editingEvent: { type: Object, default: null },
});

const emit = defineEmits(["close", "save"]);

const type = ref(props.editingEvent?.event_type === EventTypesEnum.MISSED_PENALTY ? EventTypesEnum.PENALTY_GOAL : (props.editingEvent?.event_type ?? props.initialType));
const missed = ref(props.editingEvent?.event_type === EventTypesEnum.MISSED_PENALTY);
const selectedTeamId = ref(props.editingEvent?.team_id ?? props.homeTeam.id);
const selectedPlayerId = ref(props.editingEvent?.player_id ?? null);
const assistPlayerId = ref(props.editingEvent?.fk_player2_id ?? null);
const goalType = ref(props.editingEvent?.text ?? GOAL_TYPES[0]);
const minute = ref(props.editingEvent?.minute ?? props.currentMinute);

// For an own goal the picker shows the SCORER's team, but the goal counts
// for the other side — see ScoreCalculator in the backend for why team_id
// must be the benefiting team.
const isOwnGoal = computed(() => type.value === EventTypesEnum.OWN_GOAL);
const benefitingTeamId = computed(() => {
  if (!isOwnGoal.value) return selectedTeamId.value;
  return selectedTeamId.value === props.homeTeam.id ? props.awayTeam.id : props.homeTeam.id;
});

const selectedTeam = computed(() => (selectedTeamId.value === props.homeTeam.id ? props.homeTeam : props.awayTeam));
const benefitingTeamName = computed(() => (benefitingTeamId.value === props.homeTeam.id ? props.homeTeam.name : props.awayTeam.name));

const dialogTitle = computed(() => {
  if (type.value === EventTypesEnum.OWN_GOAL) return "Eigentor";
  if (type.value === EventTypesEnum.PENALTY_GOAL) return missed.value ? "Elfmeter verschossen" : "Elfmeter";
  return "Tor";
});

const submitLabel = computed(() => {
  if (props.editingEvent) return "Speichern";
  if (type.value === EventTypesEnum.OWN_GOAL) return "Eigentor eintragen";
  if (type.value === EventTypesEnum.PENALTY_GOAL) return missed.value ? "Verschossen eintragen" : "Elfmeter eintragen";
  return "Tor eintragen";
});

// currentScore already includes editingEvent's own (still-saved) contribution
// when editing — back it out first so the preview reflects the edit, not a
// phantom extra goal.
const originalContribution = computed(() => {
  const event = props.editingEvent;
  const countsAsGoal = event && [EventTypesEnum.GOAL, EventTypesEnum.PENALTY_GOAL, EventTypesEnum.OWN_GOAL].includes(event.event_type);
  if (!countsAsGoal) return { home: 0, away: 0 };
  return {
    home: event.team_id === props.homeTeam.id ? 1 : 0,
    away: event.team_id === props.awayTeam.id ? 1 : 0,
  };
});

const previewScore = computed(() => {
  if (missed.value) return null;
  const home = props.currentScore.home - originalContribution.value.home + (benefitingTeamId.value === props.homeTeam.id ? 1 : 0);
  const away = props.currentScore.away - originalContribution.value.away + (benefitingTeamId.value === props.awayTeam.id ? 1 : 0);
  return `${home}:${away}`;
});

const canSubmit = computed(() => selectedPlayerId.value && minute.value);

const submit = () => {
  if (!canSubmit.value) {
    alert("Bitte einen Spieler auswählen.");
    return;
  }

  emit("save", {
    event_type: missed.value ? EventTypesEnum.MISSED_PENALTY : type.value,
    team_id: benefitingTeamId.value,
    player_id: selectedPlayerId.value,
    fk_player2_id: type.value === EventTypesEnum.GOAL ? assistPlayerId.value : null,
    minute: minute.value,
    text: type.value === EventTypesEnum.GOAL ? goalType.value : null,
  });
};
</script>

<template>
  <Modal @close="emit('close')" @confirm="submit" :text="submitLabel">
    <template #header>
      <div>
        <div>{{ dialogTitle }}</div>
        <p v-if="previewScore" class="mt-0.5 text-sm font-normal text-on-surface/60">Wird zu {{ previewScore }} für {{ benefitingTeamName }}</p>
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">{{ isOwnGoal ? "Team des Schützen" : "Team" }}</label>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" @click="selectedTeamId = homeTeam.id; selectedPlayerId = null; assistPlayerId = null" class="cursor-pointer rounded-lg border px-3 py-2.5 text-left text-sm font-semibold" :class="selectedTeamId === homeTeam.id ? 'border-secondary bg-secondary/10' : 'border-border-subtle'">{{ homeTeam.name }}</button>
            <button type="button" @click="selectedTeamId = awayTeam.id; selectedPlayerId = null; assistPlayerId = null" class="cursor-pointer rounded-lg border px-3 py-2.5 text-left text-sm font-semibold" :class="selectedTeamId === awayTeam.id ? 'border-secondary bg-secondary/10' : 'border-border-subtle'">{{ awayTeam.name }}</button>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">{{ type === EventTypesEnum.PENALTY_GOAL ? "Schütze" : "Torschütze" }}</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="player in selectedTeam.players"
              :key="player.id"
              type="button"
              :disabled="player.status === 'suspended'"
              @click="selectedPlayerId = player.id"
              class="flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              :class="selectedPlayerId === player.id ? 'border-secondary bg-secondary text-white font-semibold' : 'border-border-subtle'"
            >
              <span class="font-mono text-sm font-bold" :class="selectedPlayerId === player.id ? '' : 'opacity-55'">{{ player.number ?? "–" }}</span>
              {{ player.name }}
            </button>
          </div>
        </div>

        <div v-if="type === EventTypesEnum.GOAL" class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Vorlage <span class="font-normal normal-case">optional</span></label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="player in selectedTeam.players.filter((p) => p.id !== selectedPlayerId)"
              :key="player.id"
              type="button"
              @click="assistPlayerId = player.id"
              class="flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm"
              :class="assistPlayerId === player.id ? 'border-primary bg-primary text-white font-semibold' : 'border-border-subtle'"
            >
              <span class="font-mono text-sm font-bold" :class="assistPlayerId === player.id ? '' : 'opacity-55'">{{ player.number ?? "–" }}</span>
              {{ player.name }}
            </button>
            <button type="button" @click="assistPlayerId = null" class="cursor-pointer rounded-lg border px-3 py-2 text-sm" :class="!assistPlayerId ? 'border-primary bg-primary text-white font-semibold' : 'border-border-subtle'">Keine Vorlage</button>
          </div>
        </div>

        <div class="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
          <div v-if="type === EventTypesEnum.GOAL" class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Torart</label>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="gt in GOAL_TYPES"
                :key="gt"
                @click="goalType = gt"
                class="cursor-pointer rounded-full border px-3 py-1.5 text-sm"
                :class="goalType === gt ? 'border-secondary bg-secondary text-white font-semibold' : 'border-border-subtle'"
              >
                {{ gt }}
              </span>
            </div>
          </div>
          <div class="flex flex-col gap-1.5" :class="type !== EventTypesEnum.GOAL ? 'col-span-2' : ''">
            <label for="goal_minute" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Minute</label>
            <input id="goal_minute" v-model="minute" type="text" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 font-mono text-sm font-semibold outline-none focus:border-2 focus:border-secondary" />
          </div>
        </div>

        <label v-if="type === EventTypesEnum.PENALTY_GOAL" class="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border-subtle px-3.5 py-2.5 text-sm">
          <input v-model="missed" type="checkbox" class="h-4 w-4 accent-secondary" />
          Elfmeter verschossen
        </label>
      </div>
    </template>
  </Modal>
</template>
