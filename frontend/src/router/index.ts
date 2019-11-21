import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';
const Streets = () => import('@/views/Streets.vue');
const Projects = () => import('@/views/Projects.vue');

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
    }
  ]
});
