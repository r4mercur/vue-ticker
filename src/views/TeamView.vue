<script setup>
import BackendSideBar from "@/components/BackendSideBar.vue";
import {onMounted, ref} from "vue";
import axios from "axios";

let teams = ref();

onMounted(() => {
  axios.get("http://localhost:3000/teams").then((response) => {
    teams.value = response.data;
  }).catch((error) => {
    console.log(error);
  });
})
</script>

<template>
  <BackendSideBar />

  <div class="mt-16 mx-4 space-y-4 flex flex-col">
    <div class="m-auto p-6 w-full">
      <table class="table-auto w-full border-collapse border-spacing-2 border border-slate-500">
        <thead>
          <tr>
            <th class="border border-slate-700">Id</th>
            <th class="border border-slate-700">Name</th>
            <th class="border border-slate-700">Abkürzung</th>
            <th class="border border-slate-700">Erstellt</th>
            <th class="border border-slate-700"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="team in teams" :key="team.id">
            <td class="border border-slate-500 text-center">{{ team.id }}</td>
            <td class="border border-slate-500 pl-2">{{ team.name }}</td>
            <td class="border border-slate-500 pl-2">{{ team.shortname }}</td>
            <td class="border border-slate-500 text-center">{{ team.created_at }}</td>
            <td>
              <div class="w-10 m-auto">
                <button class="w-5 bg-gradient-to-br from-teal-300 to-lime-300 text-white font-bold py-2 px-4 rounded-full" @click="deleteTeam(team.id)">
                  <v-icon name="co-trash" />
                </button>
                <button class="w-5 bg-gradient-to-br from-teal-300 to-lime-300 text-white font-bold py-2 px-4 rounded-full" @click="deleteTeam(team.id)">
                  <v-icon name="co-trash" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>

</style>