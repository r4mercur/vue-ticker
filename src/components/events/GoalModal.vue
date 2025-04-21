<script setup>
import Modal from "@/components/general/Modal.vue";
import {onMounted, ref} from "vue";
import PlayerSelector from "@/components/selectors/PlayerSelector.vue";

const selectedPlayer = ref(null);
const selectedPlayerForAssist = ref(null);

const homePlayers = ref([]);
const awayPlayers = ref([]);

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  players: {
    type: Array,
    required: true
  },
});

const emit = defineEmits(["close", "confirm"]);

const handleConfirm = () => {
  if (!selectedPlayer.value) {
    alert("Bitte wählen Sie einen Torschützen aus.");
    return;
  }

  emit("confirm", {
    player: selectedPlayer.value,
    assistPlayer: selectedPlayerForAssist.value
  });
};

onMounted(() => {
  homePlayers.value = props.players[0];
  awayPlayers.value = props.players[1];
});
</script>

<template>
  <Modal @close="emit('close')" @confirm="handleConfirm" text="Speichern">
    <template v-slot:header>
      <p class="text-center text-2xl mb-4">Tor!</p>
    </template>

    <template v-slot:body>
      <div>
        <PlayerSelector 
          :players="players" 
          :selectedPlayer="selectedPlayer"
          :selectedPlayerForAssist="selectedPlayerForAssist"
          @update:selectedPlayer="selectedPlayer = $event"
          @update:selectedPlayerForAssist="selectedPlayerForAssist = $event" 
        />
      </div>
    </template>
  </Modal>
</template>

<style scoped>

</style>
