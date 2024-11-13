<script setup>

// data
import {ref} from "vue";

let selected_games = ref([]);
// props
const props = defineProps({
  games: Array,
})

// emits
const emit = defineEmits();


// methods
let addOrRemoveToSelected = (game) => {
  let index = selected_games.value.findIndex((selected_game) => selected_game.id === game.id);
  if (index === -1) {
    selected_games.value.push(game);
  } else {
    selected_games.value.splice(index, 1);
  }
};

let setCSSClass = (game) => {
  let index = selected_games.value.findIndex((selected_game) => selected_game.id === game.id);
  if (index === -1) {
    return "border-2 border-gray-200 p-2 m-2 cursor-pointer";
  } else {
    return "border-2 border-green-500 p-2 m-2 cursor-pointer";
  }
};
</script>

<template>
  <div>
    <div class="flex flex-row flex-wrap">
      <div v-for="game in games" :key="game.id" @click="addOrRemoveToSelected(game)" :class="setCSSClass(game)">
        <div class="flex flex-row">
          <div class="flex flex-col">
            <div class="flex flex-row">
              <div class="font-bold">{{ game.home_team.name }}</div>
              <div class="font-bold mx-2">-</div>
              <div class="font-bold">{{ game.away_team.name }}</div>
            </div>
            <div class="flex flex-row">
              <div>{{ game.date }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>