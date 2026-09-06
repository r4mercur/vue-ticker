<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import ThemeToggle from "@/components/general/ThemeToggle.vue";
import useUserStore from "@/stores/user_store.js";
import router from "@/router/index.js";
import axios from "axios";
import { api_v1_url } from "@/stores/index.js";

const route = useRoute();
const store = useUserStore();
const url = api_v1_url;

const navItems = [
  { label: "Dashboard", to: "/", match: (path) => path === "/" },
  { label: "Spielplan", to: "/games", match: (path) => path.startsWith("/games") },
  { label: "Ticker", to: "/ticker/football", match: (path) => path.startsWith("/ticker") },
  { label: "Teams", to: "/teams", match: (path) => path.startsWith("/teams") },
  { label: "Wettbewerbe", to: "/competitions", match: (path) => path.startsWith("/competitions") },
];

const currentPath = computed(() => route?.path ?? "");
const isActive = (item) => item.match(currentPath.value);

const userInitial = computed(() => {
  const name = store.user?.username || store.user?.email || "";
  return name.charAt(0).toUpperCase() || "?";
});

let logout = () => {
  axios.post(url + "/logout", store.user).then(() => {
    store.logout();
    router.push("/login");
  }).catch((error) => {
    console.log(error);
  });
};
</script>

<template>
  <div v-if="store.user !== null" class="fixed top-0 left-0 z-50 flex h-16 w-full items-center gap-6 bg-primary px-5 text-white shadow-lg">
    <router-link to="/" class="flex items-center gap-2.5 shrink-0">
      <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary">
        <v-icon name="io-football-sharp" scale="0.9" />
      </span>
      <span class="text-sm font-bold tracking-widest">TICKER</span>
    </router-link>

    <div class="flex items-center gap-1 rounded-lg bg-white/10 p-1 shrink-0">
      <span class="rounded-md bg-white/15 px-2.5 py-1 text-sm font-semibold">Fußball</span>
      <span class="cursor-not-allowed rounded-md px-2.5 py-1 text-sm opacity-35" title="Demnächst verfügbar">Handball</span>
      <span class="cursor-not-allowed rounded-md px-2.5 py-1 text-sm opacity-35" title="Demnächst verfügbar">Basketball</span>
    </div>

    <nav class="flex h-full items-center gap-6 text-sm">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex h-full items-center border-b-2"
        :class="isActive(item) ? 'border-secondary font-semibold' : 'border-transparent opacity-60 hover:opacity-90'"
      >
        {{ item.label }}
      </router-link>
    </nav>

    <div class="ml-auto flex items-center gap-4">
      <theme-toggle />
      <button
        id="logout"
        type="button"
        title="Abmelden"
        @click="logout"
        class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-secondary text-sm font-semibold"
      >
        {{ userInitial }}
      </button>
    </div>
  </div>

  <div v-else class="fixed top-0 left-0 z-50 flex h-16 w-full items-center gap-6 bg-primary px-5 text-white shadow-lg">
    <router-link to="/login" class="flex items-center gap-2.5 shrink-0">
      <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary">
        <v-icon name="io-football-sharp" scale="0.9" />
      </span>
      <span class="text-sm font-bold tracking-widest">TICKER</span>
    </router-link>

    <nav class="flex h-full items-center gap-6 text-sm">
      <router-link to="/login" class="flex h-full items-center border-b-2" :class="currentPath === '/login' ? 'border-secondary font-semibold' : 'border-transparent opacity-60 hover:opacity-90'">
        Login
      </router-link>
      <router-link to="/register" class="flex h-full items-center border-b-2" :class="currentPath === '/register' ? 'border-secondary font-semibold' : 'border-transparent opacity-60 hover:opacity-90'">
        Registrieren
      </router-link>
    </nav>

    <theme-toggle class="ml-auto" />
  </div>
</template>
