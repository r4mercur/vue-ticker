<script setup>
import axios from "axios";
import { api_information } from "@/stores/index.js";
import {useRoute} from "vue-router";
import {onMounted, ref} from "vue";
import SideBar from "@/components/general/SideBar.vue";

const url = api_information.url;
const route = useRoute();

// data
let ticker = ref();
let ticketState = ref("Ticker starten");

// methods
const openModal = () => {
  console.log("open modal");
  // Logic to open the modal goes here
};

onMounted(() => {
  axios.get(url + "/tickers/" + route.params.id).then((response) => {
    ticker = response.data;
    ticketState.value = response.data.ticker_state;
    console.log("Ticker value:", ticker);
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

  <div class="bottom-actions">
    <v-icon
      name="fc-plus"
      @click="ticketState = 'started'"
      class="plus-icon"
      scale="2"
      onclick="openModal()"
    ></v-icon>
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

.add-event-button {
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  background-color: #333;
}
</style>