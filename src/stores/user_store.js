import { defineStore } from "pinia";

export const useUserStore = defineStore('user', {
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

export default useUserStore;