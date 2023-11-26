import { createRouter, createWebHistory } from "vue-router";
import useUserStore from "@/stores/user_store.js";

const routes = [
    {
        path: "/",
        name: "Home",
        component: () => import("@/views/HomeView.vue"),
        meta: {
            authRequired: true,
        },
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("@/components/Login.vue"),
        meta: {
            authRequired: false,
        },
    },
    {
        path: "/register",
        name: "Register",
        component: () => import("@/components/Register.vue"),
        meta: {
            authRequired: false,
        },
    },
    {
        path: "/ticker/football",
        name: "FootballTicker",
        component: () => import("@/components/FootballTicker.vue"),
        meta: {
            authRequired: true,
        },
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
});

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    if (to.matched.some((record) => record.meta.authRequired)) {
        if (userStore.user === undefined) {
            next({
                path: "/login",
            });
        } else {
            userStore.setRouteFromBefore(from);
            next();
        }
    } else {
        userStore.setRouteFromBefore(from);
        next();
    }
});

export default router;