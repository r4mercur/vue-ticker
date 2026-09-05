<script setup>

import SideBar from "@/components/general/SideBar.vue";
import MatchList from "@/components/games/GameList.vue";
import {onMounted, ref} from "vue";
import {api_v1_url} from "@/stores/index.js";
import axios from "axios";

const apiUrl = api_v1_url;

// data
let games= ref([]);

// methods
let fetchGames = async () => {
  axios.get(apiUrl + `/games`).then((response) => {
    games.value = response.data;
  }).catch((error) => {
    console.log(error);
  });
};

onMounted(() => {
  fetchGames();
});
</script>

<template>
  <!-- navigation -->
  <side-bar />


  <!-- content -->
  <div>
    <MatchList :matches="games" />
  </div>
</template>

<style scoped>

</style>