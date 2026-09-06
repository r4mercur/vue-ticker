<script setup>
import { computed, ref } from "vue";
import Modal from "@/components/general/Modal.vue";
import { EventTypesEnum } from "@/helpers/index.js";

const INJURY_MARKER = "Verletzungsbedingt";

const props = defineProps({
  homeTeam: { type: Object, required: true },
  awayTeam: { type: Object, required: true },
  currentMinute: { type: String, default: "00:00" },
  editingEvent: { type: Object, default: null },
});

const emit = defineEmits(["close", "save"]);

const selectedTeamId = ref(props.editingEvent?.team_id ?? props.homeTeam.id);
const playerOutId = ref(props.editingEvent?.fk_player1_id ?? null);
const playerInId = ref(props.editingEvent?.fk_player2_id ?? null);
const injuryRelated = ref(props.editingEvent?.text === INJURY_MARKER);
const minute = ref(props.editingEvent?.minute ?? props.currentMinute);

const selectedTeam = computed(() => (selectedTeamId.value === props.homeTeam.id ? props.homeTeam : props.awayTeam));

const canSubmit = computed(() => playerOutId.value && playerInId.value && playerOutId.value !== playerInId.value && minute.value);

const submit = () => {
  if (!canSubmit.value) {
    alert("Bitte je einen Spieler für „geht raus“ und „kommt rein“ auswählen.");
    return;
  }

  emit("save", {
    event_type: EventTypesEnum.SUBSTITUTION,
    team_id: selectedTeamId.value,
    fk_player1_id: playerOutId.value,
    fk_player2_id: playerInId.value,
    minute: minute.value,
    text: injuryRelated.value ? INJURY_MARKER : null,
  });
};
</script>

<template>
  <Modal @close="emit('close')" @confirm="submit" :text="editingEvent ? 'Speichern' : 'Wechsel eintragen'">
    <template #header><span>Auswechslung</span></template>

    <template #body>
      <div class="flex flex-col gap-4">
        <div class="flex w-fit gap-0.5 rounded-lg bg-surface-alt p-0.5">
          <button type="button" @click="selectedTeamId = homeTeam.id; playerOutId = null; playerInId = null" class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold" :class="selectedTeamId === homeTeam.id ? 'bg-surface shadow-sm' : 'opacity-65'">{{ homeTeam.name }}</button>
          <button type="button" @click="selectedTeamId = awayTeam.id; playerOutId = null; playerInId = null" class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold" :class="selectedTeamId === awayTeam.id ? 'bg-surface shadow-sm' : 'opacity-65'">{{ awayTeam.name }}</button>
        </div>

        <div class="grid grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)] items-start gap-2">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold uppercase tracking-wide text-red-600">Geht raus</label>
            <div class="flex flex-col gap-1.5">
              <button
                v-for="player in selectedTeam.players.filter((p) => p.id !== playerInId)"
                :key="player.id"
                type="button"
                @click="playerOutId = player.id"
                class="flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm"
                :class="playerOutId === player.id ? 'border-red-500 bg-red-500/10 font-semibold' : 'border-border-subtle'"
              >
                <span class="font-mono text-sm font-bold" :class="playerOutId === player.id ? '' : 'opacity-55'">{{ player.number ?? "–" }}</span>
                {{ player.name }}
              </button>
            </div>
          </div>

          <div class="flex items-center justify-center pt-7">
            <v-icon name="md-swaphoriz" scale="1.1" class="opacity-35" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold uppercase tracking-wide text-emerald-600">Kommt rein</label>
            <div class="flex flex-col gap-1.5">
              <button
                v-for="player in selectedTeam.players.filter((p) => p.id !== playerOutId)"
                :key="player.id"
                type="button"
                @click="playerInId = player.id"
                class="flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm"
                :class="playerInId === player.id ? 'border-emerald-500 bg-emerald-500/10 font-semibold' : 'border-border-subtle'"
              >
                <span class="font-mono text-sm font-bold" :class="playerInId === player.id ? '' : 'opacity-55'">{{ player.number ?? "–" }}</span>
                {{ player.name }}
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-[120px_minmax(0,1fr)] items-end gap-3">
          <div class="flex flex-col gap-1.5">
            <label for="sub_minute" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Minute</label>
            <input id="sub_minute" v-model="minute" type="text" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 font-mono text-sm font-semibold outline-none focus:border-2 focus:border-secondary" />
          </div>
          <label class="flex h-10 cursor-pointer items-center gap-2.5 text-sm">
            <input v-model="injuryRelated" type="checkbox" class="h-4 w-4 accent-secondary" />
            Als verletzungsbedingt markieren
          </label>
        </div>
      </div>
    </template>
  </Modal>
</template>
