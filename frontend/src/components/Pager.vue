<template>
  <section class="flex justify-between">
    <button
      title="Go to previous page"
      rel="prev"
      class="py-2 px-3 rounded border shadow bg-fog-200 text-fog-800"
      :disabled="selected == 0"
      @click="$emit('change', list[--selected])"
    >
      <span class="sr-only">Previous page</span>
      <span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewbox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-5 w-5"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </span>
    </button>
    <button
      title="Go to next page"
      rel="prev"
      class="py-2 px-3 rounded border shadow bg-fog-200 text-fog-800"
      :disabled="list.length == selected + 1"
      @click="$emit('change', list[++selected])"
    >
      <span class="sr-only">Next page</span>
      <span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewbox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-5 w-5"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </span>
    </button>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'Pager',
  props: {
    list: {
      type: Array
    }
  },
  data() {
    return {
      selected: 0
    };
  }
});
</script>

<style lang="scss" scoped>
button {
  &[disabled] {
    @apply bg-fog-100 text-fog-300 cursor-not-allowed;
  }
}
</style>
