<script setup>
import SideBar from "@/components/SideBar.vue";
import LeagueSelector from "@/components/LeagueSelector.vue";
import { useUserStore } from "@/stores/user_store.js";
import { useCompetitionStore } from "@/stores/competition_store.js";

const competitionStore = useCompetitionStore();
const userStore = useUserStore();

</script>

<template>

  <side-bar />

  <!-- content -->
  <div class="mt-16">
    <LeagueSelector v-if="competitionStore.selected_competition == null" />
  </div>

</template>

<style scoped>

</style>