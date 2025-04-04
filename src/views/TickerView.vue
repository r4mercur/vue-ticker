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
let ticketState = ref("");

onMounted(() => {
  axios.get(url + "/tickers/" + route.params.id).then((response) => {
    ticker = response.data;
    console.log(ticker);
  }).catch((error) => {
    console.log(error);
  });

  ticketState.value = "Ticker starten";
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
          <div class="font-bold text-2xl">Ticker</div>
        </div>
      </div>
    </div>
  </div>

  <div>
    <button>
      Event hinzufügen
    </button>
  </div>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 200px;
  height: 100vh;
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
</style>