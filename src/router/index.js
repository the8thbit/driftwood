import Vue from 'vue';
import VueRouter from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SubmitView from "../views/SubmitView.vue";
import AboutView from '../views/AboutView.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'HomeView',
        component: HomeView
    }, {
        path: '/submit',
        name: 'SubmitView',
        component: SubmitView
    }, {
        path: '/about',
        name: 'AboutView',
        component: AboutView
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export default router;