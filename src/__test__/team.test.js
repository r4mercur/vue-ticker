import TeamView from "@/views/TeamView.vue";
import { vitest } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import axios from "axios";
import {createPinia} from "pinia";

vitest.mock("axios");
vitest.mock("@/router/index.js");

test("TeamView function __test__", async () => {
    expect(TeamView).toBeTruthy();

    // Mock axios
    axios.get.mockResolvedValueOnce({ data: [] });

    const pinia = createPinia();
    const wrapper = mount(TeamView, {
        global: {
            plugins: [pinia],
        },
    });

    await wrapper.find("#team_add").trigger("click");
    expect(wrapper.find("#modal").exists()).toBe(true);


    await wrapper.find("#name").setValue("Test Team");
    await wrapper.find("#shortname").setValue("TT");

    // here click the submit button with the id #save and then check if axios.post was called with the correct data
    await wrapper.find("#save").trigger("click");
    expect(axios.post).toHaveBeenCalledWith("http://localhost:3000/api/teams", {
        name: "Test Team",
        shortname: "TT",
    });

    await flushPromises();

});