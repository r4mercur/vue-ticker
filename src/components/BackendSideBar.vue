<script setup>
import { onMounted } from "vue";
import user_store from "@/stores/user_store.js";
import router from "@/router/index.js";
import SideBarIcon from "@/components/SideBarIcon.vue";

const user = user_store();

onMounted(() => {
  if (user.user === null) {
    router.push("/login");
  }
})
</script>

<template>
  <div class="fixed top-0 left-0 w-screen m-auto flex flex-row bg-primary text-secondary shadow-lg">
    <router-link to="/teams">
      <side-bar-icon icon="hi-shield-check" text="Teams 💡" />
    </router-link>
    <router-link to="/competitions">
      <side-bar-icon icon="hi-shield-check" text="Competitions 💡" />
    </router-link>
  </div>
</template>

<style scoped>

</style>