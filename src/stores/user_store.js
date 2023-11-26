import { defineStore } from "pinia";

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        routeFromBefore: null
    }),
    persist: true,
    actions: {
        setUser(user) {
            this.user = user;
        },
        logout() {
            this.user = null;
        },
        setRouteFromBefore(route) {
            this.routeFromBefore = route;
        }
    }
});

export default useUserStore;