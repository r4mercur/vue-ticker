<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores/user_store.js";
import router from "../../router/index.js";
import axios from "axios";
import SideBar from "@/components/general/SideBar.vue";
import { api_information } from "@/stores/index.js";

const store = useUserStore();
const url = api_information.url;

let user_data = ref({
    email: "",
    username: "",
    password: "",
    password_confirmation: "",
});

let createAccount = () => {
  console.log("create_account");
  // here check if password and password_confirmation are the same
  if (user_data.value.password !== user_data.value.password_confirmation) {
    console.log("passwords don't match");
    return;
  }

  delete user_data.value.password_confirmation;
  axios.post(url + "/users", { "user": user_data.value })
    .then((response) => {
      console.log(response);
      store.setUser(response.data);
      router.push("/");
    })
    .catch((error) => {
      console.log(error);
    });
};

onMounted(() => {
  if (store.user !== null) {
    router.push("/");
  }
});
</script>

<template>
  <side-bar />

  <!-- content -->
  <div v-if="store.user === null" class="mt-16">
    <h1 class="text-4xl text-center font-bold pt-4">Registration</h1>
    <form @submit.prevent="createAccount()" class="sm:w-2/3 w-full px-4 lg:px-0 mx-auto">
      <div class="pb-2 pt-4">
        <input v-model="user_data.email" type="email"
               name="email" id="email" placeholder="Email" class="block w-full p-4 rounded-sm bg-primary text-secondary">
      </div>
      <div class="pb-2 pt-4">
        <input v-model="user_data.username" type="text"
               name="username" id="username" placeholder="Username" class="block w-full p-4 rounded-sm bg-primary text-secondary">
      </div>
      <div class="pb-2 pt-4">
        <input v-model="user_data.password" class="block w-full p-4 rounded-sm bg-primary text-secondary" type="password"
               name="password" id="password" placeholder="Password">
      </div>
      <div class="pb-2 pt-4">
        <input v-model="user_data.password_confirmation" class="block w-full p-4 rounded-sm bg-primary text-secondary" type="password"
               name="password" id="password_repeat" placeholder="Repeat password">
      </div>
      <div class="px-4 pb-2 pt-4">
        <button type="submit" class="uppercase block w-full p-4 text-lg rounded-full bg-indigo-500 hover:bg-indigo-600 focus:outline-none">Login</button>
      </div>
    </form>
  </div>
</template>

<style scoped>

</style>