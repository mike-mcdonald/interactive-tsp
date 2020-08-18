<template>
  <footer
    class="flex flex-col md:flex-row flex-wrap items-center justify-center md:justify-between bg-gray-300 text-black p-2 border-black border-t"
    role="banner"
  >
    <slot name="logos">
      <img
        title="PBOT Technology services logo"
        alt="PBOT Technology services logo"
        src="/img/pbot-verticalapps-logo-dark.png"
        class="w-48 md:w-64"
      />
    </slot>
    <slot></slot>
    <slot name="copyright">
      <div class="flex flex-col md:flex-row items-center">
        <img class="w-20 md:w-24 m-2" src="https://www.portland.gov/themes/custom/cloudy/images/city-seal.png" />
        <p class="m-0">© City of Portland, Oregon {{ new Date().getFullYear() }}</p>
      </div>
    </slot>
  </footer>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'Footer'
});
</script>
