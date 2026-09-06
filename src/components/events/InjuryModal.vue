<script setup>
import { computed, ref } from "vue";
import Modal from "@/components/general/Modal.vue";
import { EventTypesEnum, INJURY_NOTE_PRESETS } from "@/helpers/index.js";

const props = defineProps({
  homeTeam: { type: Object, required: true },
  awayTeam: { type: Object, required: true },
  currentMinute: { type: String, default: "00:00" },
  editingEvent: { type: Object, default: null },
});

const emit = defineEmits(["close", "save"]);

const selectedTeamId = ref(props.editingEvent?.team_id ?? props.homeTeam.id);
const selectedPlayerId = ref(props.editingEvent?.player_id ?? null);
const note = ref(props.editingEvent?.text ?? "");
const minute = ref(props.editingEvent?.minute ?? props.currentMinute);

const selectedTeam = computed(() => (selectedTeamId.value === props.homeTeam.id ? props.homeTeam : props.awayTeam));

const canSubmit = computed(() => selectedPlayerId.value && minute.value);

const submit = () => {
  if (!canSubmit.value) {
    alert("Bitte einen Spieler auswählen.");
    return;
  }

  emit("save", {
    event_type: EventTypesEnum.INJURY,
    team_id: selectedTeamId.value,
    player_id: selectedPlayerId.value,
    minute: minute.value,
    text: note.value || null,
  });
};
</script>

<template>
  <Modal @close="emit('close')" @confirm="submit" :text="editingEvent ? 'Speichern' : 'Verletzung eintragen'">
    <template #header><span>Verletzung</span></template>

    <template #body>
      <div class="flex flex-col gap-4">
        <div class="flex w-fit gap-0.5 rounded-lg bg-surface-alt p-0.5">
          <button type="button" @click="selectedTeamId = homeTeam.id; selectedPlayerId = null" class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold" :class="selectedTeamId === homeTeam.id ? 'bg-surface shadow-sm' : 'opacity-65'">{{ homeTeam.name }}</button>
          <button type="button" @click="selectedTeamId = awayTeam.id; selectedPlayerId = null" class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold" :class="selectedTeamId === awayTeam.id ? 'bg-surface shadow-sm' : 'opacity-65'">{{ awayTeam.name }}</button>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Spieler</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="player in selectedTeam.players"
              :key="player.id"
              type="button"
              @click="selectedPlayerId = player.id"
              class="flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm"
              :class="selectedPlayerId === player.id ? 'border-secondary bg-secondary text-white font-semibold' : 'border-border-subtle'"
            >
              <span class="font-mono text-sm font-bold" :class="selectedPlayerId === player.id ? '' : 'opacity-55'">{{ player.number ?? "–" }}</span>
              {{ player.name }}
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Verlauf <span class="font-normal normal-case">optional</span></label>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="preset in INJURY_NOTE_PRESETS"
              :key="preset"
              @click="note = preset"
              class="cursor-pointer rounded-full border px-3 py-1.5 text-sm"
              :class="note === preset ? 'border-secondary bg-secondary text-white font-semibold' : 'border-border-subtle'"
            >
              {{ preset }}
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="injury_minute" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Minute</label>
          <input id="injury_minute" v-model="minute" type="text" class="h-10 w-32 rounded-lg border border-border-subtle bg-surface px-3 font-mono text-sm font-semibold outline-none focus:border-2 focus:border-secondary" />
        </div>
      </div>
    </template>
  </Modal>
</template>
