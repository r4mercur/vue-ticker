<script setup>
import axios from "axios";
import { api_information } from "@/stores/index.js";
import {useRoute} from "vue-router";
import {onMounted, ref} from "vue";
import SideBar from "@/components/general/SideBar.vue";
import Modal from "@/components/general/Modal.vue";
import {EventTypes} from "@/helpers/index.js";

const url = api_information.url;
const route = useRoute();

// data
let ticker = ref();
let showModal = ref(false);
let ticketState = ref("Ticker starten");

// methods
const openEventModal = () => {
  showModal.value = true;
};

const closeEventModal = () => {
  showModal.value = false;
};

const triggerEvent = (event) => {
  console.log(`Event ${event} triggered`);
  closeEventModal();
};

onMounted(() => {
  axios.get(url + "/tickers/" + route.params.id).then((response) => {
    ticker.value = response.data;
    ticketState.value = response.data.ticker_state;
  }).catch((error) => {
    console.log(error);
  });
})
</script>

<template>
  <div class="sidebar">
     <side-bar />
  </div>

  <div class="ticker-view">
    <div class="w-auto">
      <div class="flex flex-row justify-center items-center h-screen">
        <div class="flex flex-col text-center w-full">
          <div v-if="ticketState === 'not_started'" class="font-bold text-2xl">Ticker starten</div>
        </div>
      </div>
    </div>
  </div>

  <Modal v-if="showModal" @close="closeEventModal" :disable-footer="true">
    <template v-slot:header>
      <p class="text-center text-2xl mb-4">Ticker Events</p>
    </template>
    <template v-slot:body>
      <div class="modal-content">
        <h2 class="text-center text-2xl mb-4">Event auswählen</h2>
        <div class="button-row">
          <button @click="triggerEvent(EventTypes.START_GAME)" class="modal-button rounded-full bg-primary">
            <v-icon name="md-sports" class="btn-icon-color" scale="2" />
          </button>
          <button @click="triggerEvent('Event 2')" class="modal-button rounded-full bg-primary">
            <v-icon name="md-sportssoccer-round" class="btn-icon-color" scale="2" />
          </button>
          <button @click="triggerEvent('Event 3')" class="modal-button">
            <v-icon name="" />
            Event 3
          </button>
        </div>
      </div>
    </template>
  </Modal>


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
  background-color: #5865f2;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}

.btn-icon-color {
  color: rgb(22 163 74);
}
</style>