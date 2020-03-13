<template>
  <div id="app">
    <Header name="Transportation System Plan" class="h-full sm:h-16">
      <template v-slot:brand>
        <div class="flex-1 sm:flex-none flex items-center justify-between">
          <router-link to="/" class="flex items-center">
            <logo
              class="w-24 mr-3"
              title="Portland Bureaur of Transportation logo"
              alt="Portland Bureaur of Transportation logo"
            />
            <span class="text-lg sm:text-xl">Transportation System Plan</span>
          </router-link>
          <button class="p-2 sm:hidden" v-on:click="showMenu = !showMenu">
            <i v-html="feather.icons['menu'].toSvg({ class: 'w-5 h-5' })" />
          </button>
        </div>
      </template>
      <nav
        class="-mx-2 sm:mx-2 sm:flex flex-row flex-wrap"
        :class="{
          hidden: !showMenu,
          flex: showMenu
        }"
      >
        <router-link to="/streets" class="py-2 px-2 sm:py-4 hover:bg-fog-500" active-class="sm:bg-fog-500">
          <span class="border-b-2 border-black">Streets</span>
        </router-link>
        <router-link to="/projects" class="py-2 px-2 sm:py-4 hover:bg-fog-500" active-class="sm:bg-fog-500">
          <span class="border-b-2 border-black">Projects</span>
        </router-link>
        <router-link to="/text" class="py-2 px-2 sm:py-4 hover:bg-fog-500" active-class="sm:bg-fog-500">
          <span class="border-b-2 border-black">Text</span>
        </router-link>
      </nav>
    </Header>
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
import Header from 'portland-pattern-lab/source/_patterns/03-cells/header/Header.vue';
import Logo from 'portland-pattern-lab/source/_patterns/01-atoms/04-images/Logo.vue';

export default Vue.extend({
  name: 'App',
  components: {
    Footer,
    Header,
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
