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
import useUserStore from "@/stores/user_store.js";

const url = api_information.url;
const route = useRoute();
const stopwatch = new Stopwatch();

// data
let ticker = ref();
let tickerTime = ref("00:00");
let tickerEvent = ref();
let players = ref([]);
let tickerEvents = ref();

let showModal = ref(false);
let showGoalModal = ref(false);
let showCardModal = ref(false);
let showTextModal = ref(false);

let tickerState = ref("Ticker starten");
let intervalId = null;

// stores
const userStore = useUserStore();

// methods
const sendEvent = (event) => {
  axios.post(url + "/ticker_events", {
    "ticker_event": event
  }).then((response) => {
    if (response.status === 200) {
      console.log("Event sent successfully");
    }
  }).catch((error) => {
    console.log(error);
  });
};

const updateTickerState = (state) => {
  axios.put(url + "/tickers/" + ticker.value.id, {
    "ticker": {
      "ticker_state": state
    }
  }).then((response) => {
    if (response.status === 200) {
      console.log("Ticker state updated successfully");
    }
  }).catch((error) => {
    console.log(error);
  });
};


const openEventModal = () => {
  showModal.value = true;
};

const closeEventModal = () => {
  showModal.value = false;
};

const startFirstHalf = () => {
  stopwatch.start();
  tickerState.value = "first_half";
  intervalId = setInterval(() => {
    tickerTime.value = stopwatch.getTime();
  }, 1000);

  const event = {
    ticker_id: ticker.value.id,
    event_type: EventTypes.START_GAME,
    minute: stopwatch.getTime(),
    user_id: userStore.user.id
  };

  sendEvent(event);
  updateTickerState(tickerState.value);
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
    tickerEvents.value = response.data.ticker_events;
    players.value.push(response.data.game.team_home.players)
    players.value.push(response.data.game.team_away.players)

    if (tickerState.value === "first_half") {
      const lastEvent = tickerEvents.value[tickerEvents.value.length - 1];
      if (lastEvent) {
        const [minutes, seconds] = lastEvent.minute.split(':').map(Number);
        const totalSeconds = (minutes * 60) + seconds;

        stopwatch.setTime(totalSeconds);
        tickerTime.value = lastEvent.minute;

        stopwatch.start();
        intervalId = setInterval(() => {
          tickerTime.value = stopwatch.getTime();
        }, 1000);
      }
    }

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
          <div v-else-if="tickerState === 'first_half'">1. Halbzeit: {{ tickerTime }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- List of events -->
  <div class="events-list">
    <div v-if="tickerEvents && tickerEvents.length > 0">
      <div v-for="(event, index) in tickerEvents" :key="index" class="event-item">
        <div class="event-time">{{ event.minute }}</div>

        <!-- START_GAME event -->
        <div v-if="event.event_type === EventTypes.START_GAME" class="event-content start-game">
          <v-icon name="md-sports" scale="1.5" class="event-icon" />
          <span>Spiel gestartet</span>
        </div>

        <!-- START_HALFTIME event -->
        <div v-else-if="event.event_type === EventTypes.START_HALFTIME" class="event-content halftime">
          <v-icon name="md-sports" scale="1.5" class="event-icon" />
          <span>Halbzeit</span>
        </div>

        <!-- END_GAME event -->
        <div v-else-if="event.event_type === EventTypes.END_GAME" class="event-content end-game">
          <v-icon name="md-sports" scale="1.5" class="event-icon" />
          <span>Spiel beendet</span>
        </div>

        <!-- GOAL event -->
        <div v-else-if="event.event_type === EventTypes.GOAL" class="event-content goal">
          <v-icon name="md-sportssoccer-round" scale="1.5" class="event-icon goal-icon" />
          <div class="goal-details">
            <span class="player-name">{{ event.player_name }}</span>
            <span v-if="event.assist_player_name" class="assist">
              Vorlage: {{ event.assist_player_name }}
            </span>
          </div>
        </div>

        <!-- YELLOW_CARD event -->
        <div v-else-if="event.event_type === EventTypes.YELLOW_CARD" class="event-content yellow-card">
          <div class="card yellow"></div>
          <span class="player-name">{{ event.player_name }}</span>
        </div>

        <!-- RED_CARD event -->
        <div v-else-if="event.event_type === EventTypes.RED_CARD" class="event-content red-card">
          <div class="card red"></div>
          <span class="player-name">{{ event.player_name }}</span>
        </div>

        <!-- Default for other events -->
        <div v-else class="event-content default">
          <v-icon name="bi-chat-text-fill" scale="1.5" class="event-icon" />
          <span>{{ event.text || 'Ereignis' }}</span>
        </div>
      </div>
    </div>
    <div v-else class="no-events">
      Keine Ereignisse vorhanden
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

/* Event list styles */
.events-list {
  margin-top: 150px;
  padding: 20px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 100px;
}

.event-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 10px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.event-time {
  min-width: 60px;
  font-weight: bold;
  color: #666;
  margin-right: 15px;
}

.event-content {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.event-icon {
  margin-right: 10px;
}

.goal-icon {
  color: #2563eb;
}

.goal-details {
  display: flex;
  flex-direction: column;
}

.player-name {
  font-weight: bold;
}

.assist {
  font-size: 0.9em;
  color: #666;
  margin-top: 3px;
}

.card {
  width: 15px;
  height: 20px;
  border-radius: 2px;
  margin-right: 10px;
}

.yellow {
  background-color: #fbbf24;
}

.red {
  background-color: #ef4444;
}

.start-game, .halftime, .end-game {
  color: #4b5563;
}

.no-events {
  text-align: center;
  padding: 20px;
  color: #6b7280;
  font-style: italic;
}
</style>
