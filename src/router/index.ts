import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';
// writing these as functions lets you chunk output, thus smaller downloads?
const AreaPlans = () => import('@/views/AreaPlans.vue');
const MasterStreetPlans = () => import('@/views/MasterStreetPlans.vue');
const Streets = () => import('@/views/Streets.vue');
const Projects = () => import('@/views/Projects.vue');
const Text = () => import('@/views/Text.vue');

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/streets/:id?',
      name: 'streets',
      component: Streets
    },
    {
      path: '/projects/:id?',
      name: 'projects',
      component: Projects
    },
    {
      path: '/text',
      name: 'text',
      component: Text
    },
    {
      path: '/master-street-plans/:id?',
      name: 'master-street-plans',
      component: MasterStreetPlans
    },
    {
      path: '/area_plans/:slug?',
      name: 'area-plans',
      component: AreaPlans
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    //https://router.vuejs.org/guide/advanced/scroll-behavior.html
    if (to.hash) {
      return;
    } else if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  }
});
