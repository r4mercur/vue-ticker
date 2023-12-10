import { createPinia, defineStore } from "pinia";
import { flushPromises, mount } from "@vue/test-utils";
import axios from "axios";
import router from "@/router/index.js";
import { nextTick } from "vue";
import HomeView from "@/views/HomeView.vue";
import { user } from "@/helpers/test.js";
import { api_information } from "@/stores/index.js";

const url = api_information.url;

vitest.mock("axios");
vitest.mock("@/router/index.js");

const userStore = defineStore('user', {
  state: () => ({
    user: null,
  }),
  persist: true,
  actions: {
    setUser(user) {
      this.user = user;
    },
    logout() {
      this.user = null;
    },
  }
});

test("Logout function __test__", async () => {
  expect(HomeView).toBeTruthy();

  const pinia = createPinia();
  const store = userStore(pinia);

  store.setUser(user);

  // Set up the axios.post mock before the component is mounted
  axios.post.mockResolvedValueOnce({ data: { status: "Logged out successfully" } });
  router.push.mockImplementation(() => {}); // Mock the router push function

  const wrapper = mount(HomeView, {
    global: {
      plugins: [pinia]
    }
  });

  await flushPromises();
  await nextTick();

  const sidebarIcons = wrapper.findAllComponents({ name: 'side-bar-icon' });
  const logoutButton = sidebarIcons[sidebarIcons.length - 1];
  await logoutButton.trigger("click");

  expect(axios.post).toHaveBeenCalledWith(url + "/api/logout", user);
  expect(router.push).toHaveBeenCalledWith("/login");
});