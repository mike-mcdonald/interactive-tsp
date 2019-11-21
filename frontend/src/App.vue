<template>
  <div id="app">
    <Header name="Transportation System Plan">
      <template v-slot:brand>
        <router-link to="/" class="flex items-center">
          <logo
            class="w-24 mr-3"
            title="Portland Bureaur of Transportation logo"
            alt="Portland Bureaur of Transportation logo"
          />
          <span class="text-lg md:text-xl mr-3">Transportation System Plan</span>
        </router-link>
      </template>
      <nav class="-mx-2 flex flex-row flex-wrap">
        <router-link to="/streets" class="py-2 px-2 md:py-4 hover:bg-fog-500" active-class="bg-fog-500">
          <span class="border-b-2 border-black">Streets</span>
        </router-link>
        <router-link to="/projects" class="py-2 px-2 md:py-4 hover:bg-fog-500" active-class="bg-fog-500">
          <span class="border-b-2 border-black">Projects</span>
        </router-link>
      </nav>
    </Header>
    <router-view />
    <Footer>
      <template v-slot:logos>
        <img
          title="PBOT Technology services logo"
          alt="PBOT Technology services logo"
          src="/img/PBOT-VerticalApps-Logo-Dark.png"
          class="w-48"
        />
      </template>
    </Footer>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';

import Footer from 'portland-pattern-lab/source/_patterns/03-cells/footer/Footer.vue';
import Header from 'portland-pattern-lab/source/_patterns/03-cells/header/Header.vue';
import Logo from 'portland-pattern-lab/source/_patterns/01-atoms/04-images/Logo.vue';

export default Vue.extend({
  name: 'App',
  components: {
    Footer,
    Header,
    Logo
  }
});
</script>
<style lang="scss">
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,700,800');

#app {
  @apply font-sans text-sm text-black;
  scroll-snap-type: y mandatory;
  > * {
    scroll-snap-align: start;
  }
}

@screen md {
  #app {
    @apply text-base;
  }
}
</style>
