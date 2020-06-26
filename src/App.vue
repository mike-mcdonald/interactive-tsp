<template>
  <div id="app" class="relative">
    <header
      class="px-2 py-2 md:py-0 md:h-16 border-b border-cyan-900 bg-cyan-500 text-cyan-100 flex items-center justify-between flex-wrap sticky top-0 z-100"
    >
      <div class="flex items-center flex-shrink-0 md:mr-4">
        <router-link to="/" class="flex items-center">
          <logo
            class="w-16 md:w-24 mr-2"
            title="Portland Bureau of Transportation logo"
            alt="Portland Bureau of Transportation logo"
          />
          <span class="font-semibold tracking-tight text-lg md:text-xl">Transportation System Plan</span>
        </router-link>
      </div>
      <div class="block md:hidden">
        <button
          class="flex items-center px-3 py-2 rounded hover:bg-cyan-700 focus:outline-none focus:bg-cyan-700"
          @click="showMenu = !showMenu"
        >
          <i v-if="!showMenu" v-html="feather.icons['menu'].toSvg({ class: 'w-5 h-5' })" />
          <i v-if="showMenu" v-html="feather.icons['x'].toSvg({ class: 'w-5 h-5' })" />
        </button>
      </div>
      <nav class="-mx-1 w-auto flex-grow items-center hidden md:flex">
        <router-link
          to="/streets"
          class="mx-1 p-2 rounded-md hover:bg-cyan-700 focus:outline-none focus:bg-cyan-700"
          active-class="bg-cyan-700"
        >
          <span>Streets</span>
        </router-link>
        <router-link
          to="/projects"
          class="mx-1 p-2 rounded-md hover:bg-cyan-700 focus:outline-none focus:bg-cyan-700"
          active-class="bg-cyan-700"
        >
          <span>Projects</span>
        </router-link>
        <router-link
          to="/master-street-plans"
          class="mx-1 p-2 rounded-md hover:bg-cyan-700 focus:outline-none focus:bg-cyan-700"
          active-class="bg-cyan-700"
        >
          <span>Master Street Plans</span>
        </router-link>
        <router-link
          to="/area-plans"
          class="mx-1 p-2 rounded-md hover:bg-cyan-700 focus:outline-none focus:bg-cyan-700"
          active-class="bg-cyan-700"
        >
          <span>Area Plans</span>
        </router-link>
        <router-link
          to="/text"
          class="mx-1 p-2 rounded-md hover:bg-cyan-700 focus:outline-none focus:bg-cyan-700"
          active-class="bg-cyan-700"
        >
          <span>Text</span>
        </router-link>
      </nav>
      <nav
        class="pt-2 w-full flex-grow flex-col items-start md:hidden"
        :class="!showMenu ? 'hidden' : 'flex'"
        :aria-expanded="`${showMenu}`"
      >
        <router-link
          to="/streets"
          class="my-1 p-2 w-full rounded hover:bg-cyan-700 focus:outline-none focus:bg-cyan-700"
          active-class="bg-cyan-700"
        >
          <span>Streets</span>
        </router-link>
        <router-link
          to="/projects"
          class="my-1 p-2 w-full rounded hover:bg-cyan-700 focus:outline-none focus:bg-cyan-700"
          active-class="bg-cyan-700"
        >
          <span>Projects</span>
        </router-link>
        <router-link
          to="/master-street-plans"
          class="my-1 p-2 w-full rounded hover:bg-cyan-700 focus:outline-none focus:bg-cyan-700"
          active-class="bg-cyan-700"
        >
          <span>Master Street Plans</span>
        </router-link>
        <router-link
          to="/area-plans"
          class="my-1 p-2 w-full rounded hover:bg-cyan-700 focus:outline-none focus:bg-cyan-700"
          active-class="bg-cyan-700"
        >
          <span>Area Plans</span>
        </router-link>
        <router-link
          to="/text"
          class="my-1 p-2 w-full rounded hover:bg-cyan-700 focus:outline-none focus:bg-cyan-700"
          active-class="bg-cyan-700"
        >
          <span>Text</span>
        </router-link>
      </nav>
    </header>
    <section role="alert">
      <ul class="list-none">
        <message v-for="alert in alerts" :key="alert.id" :item="alert" />
      </ul>
    </section>
    <Messages role="notifications" class="z-100 max-w-6xl mx-auto px-2 pb-4 fixed inset-x-0 bottom-0" />
    <router-view />
    <Footer />
  </div>
</template>
<script>
import { mapState } from 'vuex';

import feather from 'feather-icons';

import Footer from '@/components/Footer.vue';
import Logo from '@/components/icons/Logo.vue';
import Message from '@/components/message/Item.vue';
import Messages from '@/components/message/List.vue';

export default {
  name: 'App',
  components: {
    Footer,
    Logo,
    Message,
    Messages
  },
  data() {
    return {
      feather,
      showMenu: false
    };
  },
  computed: {
    ...mapState(['alerts'])
  }
};
</script>
<style lang="scss">
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,700,800&display=swap');

#app {
  @apply font-sans text-base text-black;
}

.fade {
  &-enter {
    opacity: 0;
  }
  &-leave-to {
    opacity: 0;
  }
  &-enter-active,
  &-leave-active {
    transition: opacity 0.5s ease;
  }
}

.pop-enter-active {
  animation: pop-in 0.33s ease;
}
.pop-leave-active {
  animation: pop-in 0.33s ease reverse;
}
@keyframes pop-in {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
</style>
