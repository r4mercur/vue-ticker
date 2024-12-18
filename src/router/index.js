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
        path: "/teams",
        name: "Teams",
        component: () => import("@/views/TeamView.vue"),
        meta: {
            authRequired: true,
        },
    },
    {
        path: "/competitions",
        name: "Competitions",
        component: () => import("@/views/CompetitionView.vue"),
        meta: {
            authRequired: true,
        },
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("@/components/general/LoginForm.vue"),
        meta: {
            authRequired: false,
        },
    },
    {
        path: "/register",
        name: "Register",
        component: () => import("@/components/general/RegistrationForm.vue"),
        meta: {
            authRequired: false,
        },
    },
    {
        path: "/ticker/football",
        name: "FootballTicker",
        component: () => import("@/components/ticker/FootballTicker.vue"),
        meta: {
            authRequired: true,
        },
    },
    {
        path: "/ticker/:id",
        name: "Ticker",
        component: () => import("@/views/TickerView.vue"),
        meta: {
            authRequired: true,
        },
    },
	{
		path: "/games",
		name: "Matches",
		component: () => import("@/views/GameView.vue"),
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
            next();
        }
    } else {
        next();
    }
});

export default router;