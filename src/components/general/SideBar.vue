<script setup lang="ts">
import SideBarIcon from "./SideBarIcon.vue";
import useUserStore from "@/stores/user_store.js";
import router from "../../router";
import axios from "axios";
import { api_information } from "@/stores";

const url = api_information.url;
const store = useUserStore();

let logout = () => {
  axios.post(url + "/api/logout", store.user).then((response) => {
    console.log(response);
    store.logout();
    router.push("/login");
  }).catch((error) => {
    console.log(error);
  });
};
</script>

<template>
  <div v-if="store.user !== null" class="fixed top-0 left-0 w-screen m-auto
        flex flex-row bg-primary text-secondary shadow-lg">
    <router-link to="/ticker/football">
      <side-bar-icon :icon="'io-football-sharp'" :text="'Fußball 💡'" />
    </router-link>

    <!--
    <router-link to="">
      <side-bar-icon :icon="'md-sportshandball'" :text="'Handball 💡'" />
    </router-link>

    <router-link to="">
      <side-bar-icon :icon="'co-tennis'" :text="'Tennis 💡'" />
    </router-link>

    <router-link to="">
      <side-bar-icon :icon="'co-basketball'" :text="'Basketball 💡'" />
    </router-link>

    <router-link to="">
      <side-bar-icon :icon="'gi-hockey'" :text="'Hockey 💡'" />
    </router-link>
    -->

    <side-bar-icon id="logout" class="fixed right-0" :icon="'co-account-logout'" :text="'Logout 💡'" @click="logout()" />
  </div>

  <div v-else class="fixed top-0 left-0 w-screen m-auto
        flex flex-row bg-primary text-secondary shadow-lg">
    <router-link to="/login">
      <side-bar-icon :icon="'hi-login'" :text="'Login 💡'" />
    </router-link>
    <router-link to="/register">
      <side-bar-icon :icon="'bi-chevron-double-right'" :text="'Register 💡'" />
    </router-link>
  </div>
</template>