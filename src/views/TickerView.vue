<script setup>
import axios from "axios";
import { api_information } from "@/stores/index.js";
import {useRoute} from "vue-router";
import {onMounted, onUnmounted, ref} from "vue";
import SideBar from "@/components/general/SideBar.vue";
import Modal from "@/components/general/Modal.vue";
import {EventTypes, Stopwatch} from "@/helpers/index.js";
import GoalModal from "@/components/events/GoalModal.vue";
import CardModal from "@/components/events/CardModal.vue";
import TextModal from "@/components/events/TextModal.vue";

const url = api_information.url;
const route = useRoute();
const stopwatch = new Stopwatch();

// data
let ticker = ref();
let tickerTime = ref("00:00");
let tickerEvent = ref();
let players = ref([]);

let showModal = ref(false);
let showGoalModal = ref(false);
let showCardModal = ref(false);
let showTextModal = ref(false);

let tickerState = ref("Ticker starten");
let intervalId = null;

// methods
const openEventModal = () => {
  showModal.value = true;
};

const closeEventModal = () => {
  showModal.value = false;
};

const startFirstHalf = () => {
  stopwatch.start();
  tickerState.value = "first_half_running";
  intervalId = setInterval(() => {
    tickerTime.value = stopwatch.getTime();
  }, 1000);
}

const saveCard = () => {
  // handle logic for saving card event
  showCardModal.value = false;
};

const saveGoal = () => {
  // handle logic for saving goal event
  showGoalModal.value = false;
};

const saveText = () => {
  // handle logic for saving text event
  showTextModal.value = false;
};

const triggerEvent = (event) => {
  // handle logic for all the event's
  if (event === EventTypes.START_GAME) {
    startFirstHalf()
  } else if (event === EventTypes.GOAL) {
    showGoalModal.value = true;
  } else if (event === EventTypes.RED_CARD || event === EventTypes.YELLOW_CARD) {
    showCardModal.value = true;
  }

  closeEventModal();
};

onMounted(() => {
  axios.get(url + "/tickers/" + route.params.id).then((response) => {
    ticker.value = response.data;
    tickerState.value = response.data.ticker_state;
    players.value.push(response.data.game.team_home.players)
    players.value.push(response.data.game.team_away.players)
  }).catch((error) => {
    console.log(error);
  });
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<template>
  <div class="sidebar">
     <side-bar />
  </div>

  <div class="ticker-view">
    <div class="w-auto">
      <div class="flex flex-row justify-center items-center h-screen">
        <div class="flex flex-col text-center w-full">
          <div v-if="tickerState === 'not_started'" class="font-bold text-2xl">Ticker starten</div>
          <div v-else-if="tickerState === 'first_half_running'">1. Halbzeit: {{ tickerTime }}</div>
        </div>
      </div>
    </div>
  </div>

  <Modal v-if="showModal" @close="closeEventModal" :disable-footer="true">
    <template v-slot:header>
      <p class="text-center text-2xl mb-4">Events erstellen</p>
    </template>
    <template v-slot:body>
      <div class="modal-content">
        <div class="button-row">
          <button v-if="tickerState === 'not_started'"  @click="triggerEvent(EventTypes.START_GAME)" class="modal-button rounded-full bg-primary">
            <v-icon name="md-sports" class="btn-icon-color" scale="2" />
          </button>
          <button @click="triggerEvent(EventTypes.GOAL)" class="modal-button rounded-full bg-primary">
            <v-icon name="md-sportssoccer-round" class="btn-icon-color" scale="2" />
          </button>
          <button @click="triggerEvent('specific')" class="modal-button rounded-full bg-primary">
            <v-icon name="bi-chat-text-fill" class="btn-icon-color" scale="2" />
          </button>
        </div>
      </div>
    </template>
  </Modal>

  <!-- Event modals -->
  <GoalModal v-if="showGoalModal" @close="showGoalModal = false" @confirm="saveGoal" :data="tickerEvent" :players="players" />
  <CardModal v-if="showCardModal" @close="showCardModal = false" @confirm="saveCard" :data="tickerEvent" />
  <TextModal v-if="showTextModal" @close="showTextModal = false" @confirm="saveText" :data="tickerEvent" />

  <div class="bottom-actions">
    <v-icon
      name="fc-plus"
      class="plus-icon"
      scale="2"
      @click="openEventModal"
    />
  </div>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 200px;
  background-color: #333;
}

.ticker-view {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #333;
  color: white;
  max-height: 125px;
  padding-top: 65px;
}
.bottom-actions {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.plus-icon {
  cursor: pointer;
  font-size: 2rem;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.button-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
}

.modal-button {
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}

.btn-icon-color {
  color: rgb(22 163 74);
}
</style>