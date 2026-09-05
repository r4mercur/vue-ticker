import { createApp } from 'vue'
import { createPinia } from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import axios from "axios";
import './style.css'
import App from './App.vue'
import router from './router'
import { useTheme } from './composables/useTheme.js'
import useUserStore from './stores/user_store.js'

// send the Rails session cookie on every cross-origin request
axios.defaults.withCredentials = true;

// icons

import { OhVueIcon, addIcons } from "oh-vue-icons";
import { IoFootballSharp, MdSportshandball, CoTennis, CoBasketball, GiHockey, HiLogin, BiChevronDoubleRight,
    HiShieldCheck, CoAccountLogout, MdModeeditOutlined, MdDeleteOutlined, FcPlus, MdSports, MdSportssoccerRound,
    BiChatTextFill, MdDelete}
from "oh-vue-icons/icons";
addIcons(IoFootballSharp, MdSportshandball, CoTennis, CoBasketball, GiHockey, HiLogin, BiChevronDoubleRight,
    CoAccountLogout, HiShieldCheck, MdModeeditOutlined, MdDeleteOutlined, FcPlus, MdSports, MdSportssoccerRound,
    BiChatTextFill , MdDelete);

// theme
useTheme().initTheme();

// state tool
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(pinia);
app.use(router);
app.component("v-icon", OhVueIcon);

// if the session cookie is missing/expired, drop the stale local user and
// send the visitor back to the login page instead of showing broken pages
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useUserStore().logout();
      if (router.currentRoute.value.name !== "Login") {
        router.push("/login");
      }
    }
    return Promise.reject(error);
  }
);

app.mount("#app");