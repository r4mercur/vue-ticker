<script setup>
import { ref } from "vue";
import Modal from "@/components/general/Modal.vue";
import { EventTypesEnum } from "@/helpers/index.js";

const EXTRA_TIME_TEXT = /^\+(\d+) Min\.$/;

const props = defineProps({
  currentMinute: { type: String, default: "00:00" },
  editingEvent: { type: Object, default: null },
});

const emit = defineEmits(["close", "save"]);

const extraMinutes = ref(Number(props.editingEvent?.text?.match(EXTRA_TIME_TEXT)?.[1]) || 2);
const minute = ref(props.editingEvent?.minute ?? props.currentMinute);

const submit = () => {
  if (!extraMinutes.value || extraMinutes.value < 1) {
    alert("Bitte eine gültige Anzahl an Minuten angeben.");
    return;
  }

  emit("save", {
    event_type: EventTypesEnum.EXTRA_TIME,
    minute: minute.value,
    text: `+${extraMinutes.value} Min.`,
  });
};
</script>

<template>
  <Modal @close="emit('close')" @confirm="submit" :text="editingEvent ? 'Speichern' : 'Nachspielzeit eintragen'">
    <template #header><span>Nachspielzeit</span></template>

    <template #body>
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label for="extra_minutes" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Zusätzliche Minuten</label>
          <input id="extra_minutes" v-model.number="extraMinutes" type="number" min="1" max="15" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 font-mono text-sm font-semibold outline-none focus:border-2 focus:border-secondary" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="extra_time_minute" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Minute</label>
          <input id="extra_time_minute" v-model="minute" type="text" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 font-mono text-sm font-semibold outline-none focus:border-2 focus:border-secondary" />
        </div>
      </div>
    </template>
  </Modal>
</template>
