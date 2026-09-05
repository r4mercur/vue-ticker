<script setup>
import { computed } from 'vue';

const props = defineProps({
  players: {
    type: Array,
    required: true
  },
  selectedPlayer: {
    type: Object,
    default: null
  },
  selectedPlayerForAssist: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:selectedPlayer', 'update:selectedPlayerForAssist']);

const homePlayers = computed(() => {
  return props.players[0] || [];
});

const awayPlayers = computed(() => {
  return props.players[1] || [];
});

const selectPlayer = (player) => {
  emit('update:selectedPlayer', player);
};

const selectPlayerForAssist = (player) => {
  emit('update:selectedPlayerForAssist', player);
};
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <div class="border border-border-subtle rounded-lg p-4 bg-surface-alt">
      <h3 class="text-xl font-semibold mb-4 text-center text-on-surface">Torschütze auswählen</h3>
      <div class="mb-4">
        <h4 class="text-base font-medium mb-2 text-on-surface/70">Heimteam</h4>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="player in homePlayers"
            :key="player.id"
            class="px-4 py-2 rounded transition-all bg-surface text-on-surface hover:bg-border-subtle"
            :class="{ '!bg-emerald-500 !text-white': selectedPlayer && selectedPlayer.id === player.id }"
            @click="selectPlayer(player)"
          >
            {{ player.name }}
          </button>
        </div>
      </div>
      <div>
        <h4 class="text-base font-medium mb-2 text-on-surface/70">Auswärtsteam</h4>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="player in awayPlayers"
            :key="player.id"
            class="px-4 py-2 rounded transition-all bg-surface text-on-surface hover:bg-border-subtle"
            :class="{ '!bg-emerald-500 !text-white': selectedPlayer && selectedPlayer.id === player.id }"
            @click="selectPlayer(player)"
          >
            {{ player.name }}
          </button>
        </div>
      </div>
    </div>

    <div class="border border-border-subtle rounded-lg p-4 bg-surface-alt">
      <h3 class="text-xl font-semibold mb-4 text-center text-on-surface">Vorlage auswählen (optional)</h3>
      <div class="mb-4">
        <h4 class="text-base font-medium mb-2 text-on-surface/70">Heimteam</h4>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="player in homePlayers"
            :key="player.id"
            class="px-4 py-2 rounded transition-all bg-surface text-on-surface hover:bg-border-subtle"
            :class="{ '!bg-emerald-500 !text-white': selectedPlayerForAssist && selectedPlayerForAssist.id === player.id }"
            @click="selectPlayerForAssist(player)"
          >
            {{ player.name }}
          </button>
        </div>
      </div>
      <div>
        <h4 class="text-base font-medium mb-2 text-on-surface/70">Auswärtsteam</h4>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="player in awayPlayers"
            :key="player.id"
            class="px-4 py-2 rounded transition-all bg-surface text-on-surface hover:bg-border-subtle"
            :class="{ '!bg-emerald-500 !text-white': selectedPlayerForAssist && selectedPlayerForAssist.id === player.id }"
            @click="selectPlayerForAssist(player)"
          >
            {{ player.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
