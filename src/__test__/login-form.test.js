import LoginForm from "@/components/LoginForm.vue";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import router from '@/router/index.js';
import { vitest } from "vitest";
import { createPinia } from "pinia";


vitest.mock("axios")
vitest.mock("../router/index.js")

test("Login function __test__", async () => {
  expect(LoginForm).toBeTruthy();

  const pinia = createPinia();
  const wrapper = mount(LoginForm, {
    global: {
      plugins: [pinia]
    }
  });

  await wrapper.find('#email').setValue("bjarne.braeuer@gmx.de");
  await wrapper.find('#password').setValue("start");

  axios.post.mockResolvedValueOnce({ data: { user: "User data" } });

  await wrapper.find("form").trigger("submit.prevent");
  await flushPromises();

  expect(axios.post).toHaveBeenCalledWith("http://localhost:3000/api/login", {
    email: "bjarne.braeuer@gmx.de",
    password: "start"
  });

  expect(router.push).toHaveBeenCalledWith("/");
});