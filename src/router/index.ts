import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import GameScene from '../components/GameScene.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'GameScene',
    component: GameScene,
  },
  {
    path: '/',
    name: 'About',
  },
  {
    path: '/songs',
    name: 'Songs',
  },
];

const router = new VueRouter({
  routes,
});

export default router;
