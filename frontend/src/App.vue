<template>
  <div id="app">
    <header class="p-2 md:py-0 mx-auto flex flex-wrap items-center text-black border-b border-black" role="banner">
      <router-link to="/" class="mr-3">
        <Logo class="w-24"></Logo>
      </router-link>
      <router-link to="/" class="mr-3 text-xl">Transportation system plan</router-link>
      <nav class="-mx-2 flex flex-row flex-wrap">
        <router-link to="/streets" class="py-2 px-2 md:py-4 hover:bg-fog-500" active-class="bg-fog-500">
          <span class="border-b-2 border-black">Streets</span>
        </router-link>
      </nav>
    </header>
    <router-view />
  </div>
</template>
<script lang="ts">
import Vue from 'vue';

import Logo from 'portland-pattern-lab/source/_patterns/01-atoms/04-images/Logo.vue';

export default Vue.extend({
  name: 'App',
  components: {
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
}

@screen md {
  #app {
    @apply text-base;
  }
}
</style>
