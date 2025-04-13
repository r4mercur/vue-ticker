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

onMounted(() => {
  homePlayers.value = props.players[0];
  awayPlayers.value = props.players[1];
});
</script>

<template>
  <Modal>
    <template v-slot:header>
      <p class="text-center text-2xl mb-4">Tor!</p>
    </template>

    <template v-slot:body>
      <div>
        <PlayerSelector :players="players" :selectedPlayer="selectedPlayer"
                        :selectedPlayerForAssist="selectedPlayerForAssist" />
      </div>
    </template>
  </Modal>
</template>

<style scoped>

</style>