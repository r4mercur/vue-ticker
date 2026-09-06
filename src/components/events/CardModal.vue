<script setup>
import { computed, ref } from "vue";
import Modal from "@/components/general/Modal.vue";
import { EventTypesEnum, CARD_REASONS } from "@/helpers/index.js";

const props = defineProps({
  homeTeam: { type: Object, required: true },
  awayTeam: { type: Object, required: true },
  currentMinute: { type: String, default: "00:00" },
  events: { type: Array, default: () => [] },
  editingEvent: { type: Object, default: null },
  initialCardType: { type: Number, default: EventTypesEnum.YELLOW_CARD },
});

const emit = defineEmits(["close", "save"]);

const CARD_TYPES = [
  { type: EventTypesEnum.YELLOW_CARD, label: "Gelb", color: "#fbbf24" },
  { type: EventTypesEnum.YELLOW_RED_CARD, label: "Gelb-Rot", color: "linear-gradient(160deg,#fbbf24 0 50%,#ef4444 50% 100%)" },
  { type: EventTypesEnum.RED_CARD, label: "Rot", color: "#ef4444" },
];

const cardType = ref(props.editingEvent?.event_type ?? props.initialCardType);
const selectedTeamId = ref(props.editingEvent?.team_id ?? props.homeTeam.id);
const selectedPlayerId = ref(props.editingEvent?.player_id ?? null);
const reason = ref(props.editingEvent?.text ?? CARD_REASONS[0]);
const minute = ref(props.editingEvent?.minute ?? props.currentMinute);

const selectedTeam = computed(() => (selectedTeamId.value === props.homeTeam.id ? props.homeTeam : props.awayTeam));

const yellowCountFor = (playerId) => props.events.filter((e) => e.player_id === playerId && e.event_type === EventTypesEnum.YELLOW_CARD && e.id !== props.editingEvent?.id).length;

const secondYellowWarning = computed(() => {
  if (cardType.value !== EventTypesEnum.YELLOW_CARD || !selectedPlayerId.value) return false;
  return yellowCountFor(selectedPlayerId.value) >= 1;
});

const canSubmit = computed(() => selectedPlayerId.value && minute.value);

const submit = () => {
  if (!canSubmit.value) {
    alert("Bitte einen Spieler auswählen.");
    return;
  }

  emit("save", {
    event_type: cardType.value,
    team_id: selectedTeamId.value,
    player_id: selectedPlayerId.value,
    minute: minute.value,
    text: reason.value,
  });
};
</script>

<template>
  <Modal @close="emit('close')" @confirm="submit" :text="editingEvent ? 'Speichern' : 'Karte eintragen'">
    <template #header><span>Karte</span></template>

    <template #body>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Kartenart</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="ct in CARD_TYPES"
              :key="ct.type"
              type="button"
              @click="cardType = ct.type"
              class="flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold"
              :class="cardType === ct.type ? 'border-secondary bg-secondary/10' : 'border-border-subtle'"
            >
              <span class="h-5 w-4 rounded-sm" :style="{ background: ct.color }"></span>
              {{ ct.label }}
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Team</label>
          <div class="flex w-fit gap-0.5 rounded-lg bg-surface-alt p-0.5">
            <button type="button" @click="selectedTeamId = homeTeam.id; selectedPlayerId = null" class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold" :class="selectedTeamId === homeTeam.id ? 'bg-surface shadow-sm' : 'opacity-65'">{{ homeTeam.name }}</button>
            <button type="button" @click="selectedTeamId = awayTeam.id; selectedPlayerId = null" class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold" :class="selectedTeamId === awayTeam.id ? 'bg-surface shadow-sm' : 'opacity-65'">{{ awayTeam.name }}</button>
          </div>

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
              {{ player.name }}<span v-if="player.status === 'suspended'" class="text-xs">· gesperrt</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
          <div class="flex flex-col gap-1.5">
            <label for="card_reason" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Grund</label>
            <select id="card_reason" v-model="reason" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm outline-none focus:border-2 focus:border-secondary">
              <option v-for="r in CARD_REASONS" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="card_minute" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Minute</label>
            <input id="card_minute" v-model="minute" type="text" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 font-mono text-sm font-semibold outline-none focus:border-2 focus:border-secondary" />
          </div>
        </div>

        <div v-if="secondYellowWarning" class="flex items-center gap-2.5 rounded-lg bg-amber-500/10 px-3.5 py-2.5 text-sm text-amber-700 dark:text-amber-400">
          <v-icon name="md-check" scale="0.9" />
          Zweite Gelbe in diesem Spiel — Gelb-Rot statt Gelb wählen?
          <button type="button" @click="cardType = EventTypesEnum.YELLOW_RED_CARD" class="ml-auto cursor-pointer rounded-md border border-amber-600/40 px-2.5 py-1 text-xs font-semibold hover:bg-amber-500/10">Gelb-Rot stattdessen</button>
        </div>
      </div>
    </template>
  </Modal>
</template>
