<template>
  <section class="flex items-center justify-between">
    <button
      title="Go to previous page"
      rel="prev"
      class="py-2 px-3 rounded border shadow bg-fog-200 text-fog-800"
      :class="{
        invisible: value == 0
      }"
      @click="$emit('prev')"
      @keyup.enter="$emit('prev')"
    >
      <span class="sr-only">Previous page</span>
      <span class="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-5 w-5"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </span>
    </button>
    <span class="mx-2">{{ value + 1 }} of {{ list.length }}</span>
    <button
      title="Go to next page"
      rel="prev"
      class="py-2 px-3 rounded border shadow bg-fog-200 text-fog-800"
      :class="{
        invisible: list.length == value + 1
      }"
      @click="$emit('next')"
      @keyup-.enter="$emit('next')"
    >
      <span class="sr-only">Next page</span>
      <span class="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-5 w-5"
        >
          <polyline points="9 18 15 12 9 6" />
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
    value: {
      type: Number
    },
    list: {
      type: Array
    }
  }
});
</script>
