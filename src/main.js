import { createApp } from 'vue'
import { createPinia } from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import './style.css'
import App from './App.vue'
import router from './router'

// icons
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { IoFootballSharp, MdSportshandball, CoTennis, CoBasketball, GiHockey, HiLogin, BiChevronDoubleRight,
    HiShieldCheck, CoAccountLogout, MdModeeditOutlined, MdDeleteOutlined} from "oh-vue-icons/icons";
addIcons(IoFootballSharp, MdSportshandball, CoTennis, CoBasketball, GiHockey, HiLogin, BiChevronDoubleRight,
    CoAccountLogout, HiShieldCheck, MdModeeditOutlined, MdDeleteOutlined);

// state tool
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(pinia);
app.use(router);
app.component("v-icon", OhVueIcon);
app.mount("#app");