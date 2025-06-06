import LoginForm from "@/components/general/LoginForm.vue";
import { mount, flushPromises } from "@vue/test-utils";
import axios from "axios";
import router from '@/router/index.js';
import { vitest } from "vitest";
import { createPinia } from "pinia";
import { user } from "../helpers/test.js";
import { api_information } from "@/stores/index.js";

const url = api_information.url;

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

  await wrapper.find('#email').setValue("test@test.de");
  await wrapper.find('#password').setValue("start");

  axios.post.mockResolvedValueOnce({ data: { status: "Logged in successfully", user: user } });

  await wrapper.find("form").trigger("submit.prevent");
  await flushPromises();

  expect(axios.post).toHaveBeenCalledWith(url + "/api/login", {
    email: "test@test.de",
    password: "start"
  })

  expect(router.push).toHaveBeenCalledWith("/");
});