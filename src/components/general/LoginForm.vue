<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores/user_store.js";
import router from "../../router/index.js";
import axios from "axios";
import SideBar from "@/components/general/SideBar.vue";
import {api_information} from "@/stores/index.js"

const store = useUserStore();
const url = api_information.url;

const showMessage = ref(false);
const message = ref("");

let login_data = ref({
  email: "",
  password: "",
});
let login = () => {
  console.log("login");
  axios.post(url + "/api/login", login_data.value)
    .then((response) => {
      console.log(response);
      store.setUser(response.data.user);
      router.push("/");
    })
    .catch((error) => {
      console.log(error);
      displayMessage("Login fehlgeschlagen");
    });
};
let displayMessage = (msg) => {
  message.value = msg;
  showMessage.value = true;

  setTimeout(() => {
    showMessage.value = false;
  }, 3000);
};

onMounted(() => {
  if (store.user !== null) {
    router.push("/");
  }
});
</script>

<template>
  <!-- header -->
  <side-bar />

  <!-- content -->
  <div v-if="store.user === null" class="mt-16">
    <h1 class="text-4xl text-center font-bold pt-4">Login</h1>
    <form @submit.prevent="login()" class="sm:w-2/3 w-full px-4 lg:px-0 mx-auto">
      <div class="pb-2 pt-4">
        <input v-model="login_data.email" type="email"
               name="email" id="email" placeholder="Email" class="block w-full p-4 rounded-sm bg-primary text-secondary">
      </div>
      <div class="pb-2 pt-4">
        <input v-model="login_data.password" class="block w-full p-4 rounded-sm bg-primary text-secondary" type="password"
               name="password" id="password" placeholder="Password">
      </div>
      <div class="px-4 pb-2 pt-4">
        <button type="submit" class="uppercase block w-full p-4 text-lg rounded-full bg-indigo-500 hover:bg-indigo-600 focus:outline-none">Login</button>
      </div>
    </form>
  </div>

  <!-- error message -->
  <div v-if="showMessage" class="flash-message">
    {{ message }}
  </div>
</template>

<style scoped>
.flash-message {
  background-color: #f0ad4e;
  color: white;
  padding: 10px;
  border-radius: 5px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  width: fit-content;
}
</style>