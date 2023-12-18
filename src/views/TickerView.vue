<script setup>
import axios from "axios";
import { api_information } from "@/stores/index.js";
import {useRoute} from "vue-router";
import {onMounted, ref} from "vue";

const url = api_information.url;
const route = useRoute();

// data
let ticker = ref();

onMounted(() => {
  axios.get(url + "/tickers/" + route.params.id).then((response) => {
    ticker = response.data;
  }).catch((error) => {
    console.log(error);
  });
})
</script>

<template>

</template>

<style scoped>

</style>