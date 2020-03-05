<template>
  <!--
    This icon is adapted from Feather.
    Their site is here: https://www.feathericons.com.
    I made the "lens" radius smaller and the "handle" longer.
  -->
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="11"
      cy="11"
      r="6"
    />
    <line
      x1="21"
      y1="21"
      x2="16.05"
      y2="16.05"
    />
  </svg>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'Search'
})
</script>