<script setup>

import BackendSideBar from "@/components/general/BackendSideBar.vue";
import {computed, onMounted, ref} from "vue";
import { useCompetitionStore } from "@/stores/competition_store.js";
import Modal from "@/components/general/Modal.vue";

const competition_store = useCompetitionStore();

// data
let show_modal = ref(false);
let modal_competition = ref();

// methods
let resetModal = () => {
  modal_competition.value = null;
  show_modal.value = false;
};
let deleteCompetition = (competition_id) => {
  if (!confirm("Wollen Sie die Competition wirklich löschen?")) {
    return;
  }

  competition_store.deleteCompetition(competition_id);
};
let editCompetition = (competition) => {
  if (!competition) {
    console.log("no competition selected");
    return;
  }

  modal_competition.value = competition;
  show_modal.value = true;
};
let saveCompetition = () => {
  if (modal_competition.value.id) {
    competition_store.updateCompetition(modal_competition.value);
  } else {
    competition_store.createCompetition(modal_competition.value);
  }
  resetModal();
};

// computed
let modal_text = computed(() => {
  if (modal_competition.value.id) {
    return "Speichern";
  } else {
    return "Erstellen";
  }
});

onMounted(() => {
  competition_store.fetchCompetitions();
});
</script>

<template>
  <BackendSideBar />

  <div class="mt-16 mx-4 space-y-4 flex flex-col">
    <div class="m-auto p-6 w-full">
      <table class="table-auto w-full border-collapse border-spacing-2 border border-slate-500">
        <thead>
          <tr>
            <th class="border border-slate-700 text-center">Id</th>
            <th class="border border-slate-700 text-left pl-2">Name</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="competition in competition_store.competitions">
            <td class="border border-slate-500 text-center">{{ competition.id }}</td>
            <td class="border border-slate-500 pl-2">{{ competition.name }}</td>
            <td class="border border-r-0 border-slate-500">
              <div class="flex flex-col space-y-1 m-auto">
                <button :id="'competition_edit' + competition.id" class="w-1/2 mt-1 mb-1 m-auto bg-gradient-to-br from-teal-300 to-lime-300 text-white font-bold py-2 px-3 rounded-full text-center" @click="editCompetition(competition)">
                  <v-icon name="md-modeedit-outlined" />
                </button>
              </div>
            </td>
            <td class="border border-l-0 border-slate-500">
              <div class="flex flex-col space-y-1 m-auto">
                <button :id="'competition_delete' + competition.id" class="w-1/2 mt-1 mb-1 m-auto bg-gradient-to-br from-teal-300 to-lime-300 text-white font-bold py-2 px-3 rounded-full text-center" @click="deleteCompetition(competition.id)">
                  <v-icon name="md-delete-outlined" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal v-if="show_modal" @close="resetModal" @confirm="saveCompetition" :text="modal_text">
      <template #header>
        <div class="flex flex-row items-center space-x-2">
          <span v-if="modal_competition.id">Wettbewerb editieren</span>
          <span v-else>Neuer Wettbewerb</span>
        </div>
      </template>
      <template #body>
        <div class="flex flex-col space-y-4">
          <div class="flex flex-col space-y-2">
            <label for="name">Name</label>
            <input v-model="modal_competition.name" type="text" id="name" name="name" class="w-full p-2 border border-slate-500 rounded-lg" />
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>

</style>