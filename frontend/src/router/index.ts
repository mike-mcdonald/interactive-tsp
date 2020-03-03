import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';
// writing these as functions lets you chunk output, thus smaller downloads?
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
    }
  ],
  scrollBehavior(to) {
    //https://router.vuejs.org/guide/advanced/scroll-behavior.html
    if (to.hash) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ selector: to.hash });
        }, 100);
      });
    } else {
      return undefined;
    }
  }
});
