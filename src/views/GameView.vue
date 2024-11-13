<script setup>

import SideBar from "@/components/general/SideBar.vue";
import MatchList from "@/components/games/GameList.vue";
import {onMounted, ref} from "vue";
import {api_information} from "@/stores/index.js";
import axios from "axios";
import {Ref} from "vue";

const apiUrl = api_information.url;

// data
let games= ref([]);

// methods
let fetchGames = async () => {
  axios.get(apiUrl + `/api/games`).then((response) => {
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