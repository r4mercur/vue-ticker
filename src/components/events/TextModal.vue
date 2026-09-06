<script setup>
import { computed, ref } from "vue";
import Modal from "@/components/general/Modal.vue";
import { TEXT_PRESETS, isHighlighted, stripHighlightMarker, withHighlightMarker } from "@/helpers/index.js";

const props = defineProps({
  currentMinute: { type: String, default: "00:00" },
  editingEvent: { type: Object, default: null },
});

const emit = defineEmits(["close", "save"]);

const text = ref(props.editingEvent ? stripHighlightMarker(props.editingEvent.text ?? "") : "");
const highlight = ref(isHighlighted(props.editingEvent?.text));
const minute = ref(props.editingEvent?.minute ?? props.currentMinute);

const remaining = computed(() => 280 - text.value.length);

const addPreset = (preset) => {
  text.value = text.value ? `${text.value} ${preset}` : preset;
};

const submit = () => {
  if (!text.value.trim()) {
    alert("Bitte einen Text eingeben.");
    return;
  }

  emit("save", {
    event_type: props.editingEvent?.event_type ?? 7, // TEXT
    minute: minute.value,
    text: withHighlightMarker(text.value.trim(), highlight.value),
  });
};
</script>

<template>
  <Modal @close="emit('close')" @confirm="submit" :text="editingEvent ? 'Speichern' : 'Veröffentlichen'">
    <template #header><span>Kommentar</span></template>

    <template #body>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Bausteine</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="preset in TEXT_PRESETS"
              :key="preset"
              type="button"
              @click="addPreset(preset)"
              class="cursor-pointer rounded-full border border-border-subtle px-3 py-1.5 text-sm hover:border-secondary hover:text-secondary"
            >
              {{ preset }}
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="text_content" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Text</label>
          <textarea
            id="text_content"
            v-model="text"
            maxlength="280"
            rows="4"
            class="w-full resize-y rounded-lg border border-border-subtle bg-surface p-3 text-sm leading-relaxed outline-none focus:border-2 focus:border-secondary"
          ></textarea>
          <div class="flex justify-between text-xs text-on-surface/50">
            <span>Kurz halten — Leser scrollen am Handy.</span>
            <span>{{ text.length }} / 280 ({{ remaining }})</span>
          </div>
        </div>

        <div class="grid grid-cols-[120px_minmax(0,1fr)] items-end gap-3">
          <div class="flex flex-col gap-1.5">
            <label for="text_minute" class="text-xs font-semibold uppercase tracking-wide text-on-surface/55">Minute</label>
            <input id="text_minute" v-model="minute" type="text" class="h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 font-mono text-sm font-semibold outline-none focus:border-2 focus:border-secondary" />
          </div>
          <label class="flex h-10 cursor-pointer items-center gap-2.5 text-sm">
            <input v-model="highlight" type="checkbox" class="h-4 w-4 accent-secondary" />
            Im Leser-Ticker hervorheben
          </label>
        </div>
      </div>
    </template>
  </Modal>
</template>
