<template>
  <div id="app">
    <header
      class="px-2 py-2 md:py-0 md:h-16 border-b border-cyan-900 bg-cyan-500 text-cyan-100 flex items-center justify-between flex-wrap"
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
          to="/text"
          class="my-1 p-2 w-full rounded hover:bg-cyan-700 focus:outline-none focus:bg-cyan-700"
          active-class="bg-cyan-700"
        >
          <span>Text</span>
        </router-link>
      </nav>
    </header>
    <router-view />
    <Footer>
      <template v-slot:logos>
        <img title="PBOT Technology services logo" src="/img/PBOT-VerticalApps-Logo-Dark.png" class="w-48" />
      </template>
    </Footer>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';

import feather from 'feather-icons';

import Footer from 'portland-pattern-lab/source/_patterns/03-cells/footer/Footer.vue';
import Logo from 'portland-pattern-lab/source/_patterns/01-atoms/04-images/Logo.vue';

export default Vue.extend({
  name: 'App',
  components: {
    Footer,
    Logo
  },
  data() {
    return {
      feather,
      showMenu: false
    };
  }
});
</script>
<style lang="scss">
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,700,800&display=swap');

#app {
  @apply font-sans text-base text-black;
}

@screen md {
  #app {
    @apply text-lg;
  }
}
</style>
