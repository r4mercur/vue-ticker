<script setup>
import { ref } from "vue";
import Modal from "@/components/general/Modal.vue";
import { EventTypesEnum, VAR_DECISION_PRESETS } from "@/helpers/index.js";

const props = defineProps({
  homeTeam: { type: Object, required: true },
  awayTeam: { type: Object, required: true },
  currentMinute: { type: String, default: "00:00" },
  editingEvent: { type: Object, default: null },
});

const emit = defineEmits(["close", "save"]);

const selectedTeamId = ref(props.editingEvent?.team_id ?? null);
const decision = ref(props.editingEvent?.text ?? "");
const minute = ref(props.editingEvent?.minute ?? props.currentMinute);

const submit = () => {
  if (!decision.value.trim()) {
    alert("Bitte eine Entscheidung angeben.");
    return;
  }

  emit("save", {
    event_type: EventTypesEnum.VAR_DECISION,
    team_id: selectedTeamId.value,
    minute: minute.value,
    text: decision.value.trim(),
  });
};
</script>

<template>
  <Modal @close="emit('close')" @confirm="submit" :text="editingEvent ? 'Speichern' : 'Entscheidung eintragen'">
    <template #header><span>VAR-Entscheidung</span></template>

    <template #body>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Betrifft <span class="font-normal normal-case">optional</span></label>
          <div class="flex w-fit gap-0.5 rounded-lg bg-surface-alt p-0.5">
            <button type="button" @click="selectedTeamId = null" class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold" :class="selectedTeamId === null ? 'bg-surface shadow-sm' : 'opacity-65'">Neutral</button>
            <button type="button" @click="selectedTeamId = homeTeam.id" class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold" :class="selectedTeamId === homeTeam.id ? 'bg-surface shadow-sm' : 'opacity-65'">{{ homeTeam.name }}</button>
            <button type="button" @click="selectedTeamId = awayTeam.id" class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold" :class="selectedTeamId === awayTeam.id ? 'bg-surface shadow-sm' : 'opacity-65'">{{ awayTeam.name }}</button>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Entscheidung</label>
          <div class="mb-1 flex flex-wrap gap-1.5">
            <span
              v-for="preset in VAR_DECISION_PRESETS"
              :key="preset"
              @click="decision = preset"
              class="cursor-pointer rounded-full border px-3 py-1.5 text-sm"
              :class="decision === preset ? 'border-secondary bg-secondary text-white font-semibold' : 'border-border-subtle'"
            >
              {{ preset }}
            </span>
          </div>
          <textarea v-model="decision" rows="2" class="w-full resize-y rounded-lg border border-border-subtle bg-surface p-3 text-sm leading-relaxed outline-none focus:border-2 focus:border-secondary"></textarea>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="var_minute" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Minute</label>
          <input id="var_minute" v-model="minute" type="text" class="h-10 w-32 rounded-lg border border-border-subtle bg-surface px-3 font-mono text-sm font-semibold outline-none focus:border-2 focus:border-secondary" />
        </div>
      </div>
    </template>
  </Modal>
</template>
