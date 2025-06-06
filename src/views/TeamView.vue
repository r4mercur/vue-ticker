<script setup>
import BackendSideBar from "@/components/general/BackendSideBar.vue";
import {onMounted, ref, computed} from "vue";
import axios from "axios";
import Modal from "@/components/general/Modal.vue";
import { api_information } from "@/stores/index.js";

const url = api_information.url;
let teams = ref();
let show_modal = ref(false);
let modal_team = ref();
let image_update_key = ref(0);

// methods
let resetModal = () => {
  modal_team.value = null;
  show_modal.value = false;
};

let addTeam = () => {
  modal_team.value = {
    "name": "",
    "shortname": "",
  };
  show_modal.value = true;
};
let editTeam = (team) => {
  if (!team) {
    console.log("no team selected");
    return;
  }

  modal_team.value = team;
  show_modal.value = true;
};

let deleteTeam = (team_id) => {
  if (!confirm("Wollen Sie das Team wirklich löschen?")) {
    return;
  }

  axios.delete(url + `/teams/${team_id}`).then((response) => {
    if (response.status === 204) {
      teams.value = teams.value.filter((team) => team.id !== team_id);
    }
  }).catch((error) => {
    console.log(error);
  });
};

let saveTeam = () => {
  if (modal_team.value.id) {
    axios.put(url + `/teams/${modal_team.value.id}`, {
      "team": {
        "name": modal_team.value.name,
        "shortname": modal_team.value.shortname,
      }
    }).then((response) => {
      if (response.status === 200) {
        teams.value = teams.value.map((team) => {
          if (team.id === modal_team.value.id) {
            return response.data;
          }
          return team;
        });
        show_modal.value = false;
      }
    }).catch((error) => {
      console.log(error);
    });
  } else {
    axios.post(url + "/teams", {
      "team": {
        "name": modal_team.value.name,
        "shortname": modal_team.value.shortname,
      }
    }).then((response) => {
      if (response.status === 201) {
        show_modal.value = false;
        teams.value.push(response.data);
      }
    }).catch((error) => {
      console.log(error);
    });
  }
};
let uploadTeamLogo = (event) => {
  if (!modal_team.value.id) {
    return;
  }

  let reader = new FileReader();
  let file = event.target.files[0];
  reader.readAsDataURL(file);
  reader.onload = () => {
    axios.post(url + `/api/teams/${modal_team.value.id}/upload_logo`, {
      "id": modal_team.value.id,
      "logo": reader.result,
    }).then(() => {
      image_update_key.value = Date.now();
    }).catch((error) => {
      console.log(error);
    });
  };
};

// computed
let modal_text = computed(() => {
  if (modal_team.value.id) {
    return "Speichern";
  } else {
    return "Erstellen";
  }
});
let teams_with_ids = computed(() => {
  if (!teams.value) {
    return [];
  }

  return teams.value.map((team) => {
    if (team && team.id) {
      return {
        ...team,
        "id": team.id,
      };
    } else {
      return [];
    }
  });
});

onMounted(() => {
  axios.get(url + "/teams").then((response) => {
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
            <th class="border border-slate-700">Logo</th>
            <th class="border border-slate-700 text-left pl-2">Name</th>
            <th class="border border-slate-700 text-left pl-2">Abkürzung</th>
            <th class="border border-r-0 border-slate-700">Erstellt</th>
            <th class=""></th>
            <th class="border border-l-0 border-slate-700"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="team in teams_with_ids" :key="team.id">
            <td class="border border-slate-500 text-center">{{ team.id }}</td>
            <td class="border border-slate-500 text-center">
              <img :src="url + '/images/team_' + team.id + '.png?' + image_update_key" class="w-16 h-16 m-auto" alt="" />
            </td>
            <td class="border border-slate-500 pl-2">{{ team.name }}</td>
            <td class="border border-slate-500 pl-2">{{ team.shortname }}</td>
            <td class="border border-slate-500 text-center">{{ team.created_at }}</td>
            <td class="border border-r-0 border-slate-500">
              <div class="flex flex-col space-y-1 m-auto">
                <button :id="'team_edit' + team.id" class="w-1/2 mt-1 mb-1 m-auto bg-gradient-to-br from-teal-300 to-lime-300 text-white font-bold py-2 px-3 rounded-full text-center" @click="editTeam(team)">
                  <v-icon name="md-modeedit-outlined" />
                </button>
              </div>
            </td>
            <td class="border border-l-0 border-slate-500">
              <div class="flex flex-col space-y-1 m-auto">
                <button :id="'team_delete' + team.id" class="w-1/2 mt-1 mb-1 m-auto bg-gradient-to-br from-teal-300 to-lime-300 text-white font-bold py-2 px-3 rounded-full text-center" @click="deleteTeam(team.id)">
                  <v-icon name="md-delete-outlined" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>
              <div class="flex flex-col space-y-1 m-auto">
                <button id="team_add" @click="addTeam" class="w-full p-2 m-2 bg-gradient-to-br from-teal-300 to-lime-300 text-white font-bold rounded-full">
                  Hinzufügen
                </button>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>

  <!-- modal -->
  <Modal v-if="show_modal" @close="resetModal" @confirm="saveTeam" :text="modal_text">
    <template #header>
      <div class="flex flex-row items-center space-x-2">
        <span v-if="modal_team.id">Team editieren</span>
        <span v-else>Neues Team erstellen</span>
      </div>
    </template>
    <template #body>
      <div id="modal" class="flex flex-col space-y-4">
        <div class="flex flex-col space-y-2">
          <label for="name">Name</label>
          <input v-model="modal_team.name" type="text" id="name" name="name" class="border border-slate-500 rounded-md p-2" />
        </div>
        <div class="flex flex-col space-y-2">
          <label for="shortname">Abkürzung</label>
          <input v-model="modal_team.shortname" type="text" id="shortname" name="shortname" class="border border-slate-500 rounded-md p-2" />
        </div>
        <div v-if="modal_team.id" class="flex flex-col space-y-2">
          <label for="logo">Teamlogo</label>
          <input type="file" id="logo" name="logo" class="border border-slate-500 rounded-md p-2" accept="image/*"
                v-on:change="uploadTeamLogo"/>
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped>

</style>