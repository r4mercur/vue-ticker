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
  <div class="player-selector">
    <div class="selector-section">
      <h3 class="section-title">Torschütze auswählen</h3>
      <div class="team-section">
        <h4 class="team-title">Heimteam</h4>
        <div class="players-list">
          <button 
            v-for="player in homePlayers" 
            :key="player.id"
            class="player-button"
            :class="{ 'selected': selectedPlayer && selectedPlayer.id === player.id }"
            @click="selectPlayer(player)"
          >
            {{ player.name }}
          </button>
        </div>
      </div>
      <div class="team-section">
        <h4 class="team-title">Auswärtsteam</h4>
        <div class="players-list">
          <button 
            v-for="player in awayPlayers" 
            :key="player.id"
            class="player-button"
            :class="{ 'selected': selectedPlayer && selectedPlayer.id === player.id }"
            @click="selectPlayer(player)"
          >
            {{ player.name }}
          </button>
        </div>
      </div>
    </div>

    <div class="selector-section">
      <h3 class="section-title">Vorlage auswählen (optional)</h3>
      <div class="team-section">
        <h4 class="team-title">Heimteam</h4>
        <div class="players-list">
          <button 
            v-for="player in homePlayers" 
            :key="player.id"
            class="player-button"
            :class="{ 'selected': selectedPlayerForAssist && selectedPlayerForAssist.id === player.id }"
            @click="selectPlayerForAssist(player)"
          >
            {{ player.name }}
          </button>
        </div>
      </div>
      <div class="team-section">
        <h4 class="team-title">Auswärtsteam</h4>
        <div class="players-list">
          <button 
            v-for="player in awayPlayers" 
            :key="player.id"
            class="player-button"
            :class="{ 'selected': selectedPlayerForAssist && selectedPlayerForAssist.id === player.id }"
            @click="selectPlayerForAssist(player)"
          >
            {{ player.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-selector {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.selector-section {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: #f8fafc;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #334155;
  text-align: center;
}

.team-section {
  margin-bottom: 1rem;
}

.team-title {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #64748b;
}

.players-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.player-button {
  padding: 0.5rem 1rem;
  background-color: #e2e8f0;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.player-button:hover {
  background-color: #cbd5e1;
}

.player-button.selected {
  background-color: #10b981;
  color: white;
}
</style>
