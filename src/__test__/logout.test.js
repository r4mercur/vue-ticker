import { createPinia, defineStore } from "pinia";
import { flushPromises, mount } from "@vue/test-utils";
import axios from "axios";
import router from "@/router/index.js";
import { nextTick } from "vue";
import HomeView from "@/views/HomeView.vue";
import { user } from "@/helpers/test.js";
import { api_v1_url } from "@/stores/index.js";

const url = api_v1_url;

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

  // Set up the axios mocks before the component is mounted
  axios.get.mockResolvedValue({ data: [] }); // HomeView's dashboard fetches (games/tickers)
  axios.post.mockResolvedValueOnce({ data: { status: "Logged out successfully" } });
  router.push.mockImplementation(() => {}); // Mock the router push function

  const wrapper = mount(HomeView, {
    global: {
      plugins: [pinia]
    }
  });

  await flushPromises();
  await nextTick();

  await wrapper.find("#logout").trigger("click");

  expect(axios.post).toHaveBeenCalledWith(url + "/logout", user);
  expect(router.push).toHaveBeenCalledWith("/login");
});