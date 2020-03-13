<template>
  <nav
    class="p-2 border border-gray-900 rounded bg-gray-100 flex items-center justify-between text-gray-900"
  >
    <button
      title="Go to previous page"
      rel="prev"
      class="py-2 px-3 border border-gray-900 rounded hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
      :class="{
        invisible: value == 0
      }"
      :disabled="value == 0"
      @click="$emit('prev')"
      @keyup.enter="$emit('prev')"
    >
      <span class="sr-only">Previous page</span>
      <span class="flex items-center">
        <i v-html="feather.icons['chevron-left'].toSvg({ class: 'w-5 h-5' })" />
      </span>
    </button>
    <span class="mx-2">{{ value + 1 }} of {{ list.length }}</span>
    <button
      title="Go to next page"
      rel="prev"
      class="py-2 px-3 border border-gray-900 rounded hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
      :class="{
        invisible: list.length == value + 1
      }"
      :disabled="list.length == value + 1"
      @click="$emit('next')"
      @keyup-.enter="$emit('next')"
    >
      <span class="sr-only">Next page</span>
      <span class="flex items-center">
        <i v-html="feather.icons['chevron-right'].toSvg({ class: 'w-5 h-5' })" />
      </span>
    </button>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue';

import feather from 'feather-icons';

export default Vue.extend({
  name: 'Pager',
  props: {
    value: {
      type: Number
    },
    list: {
      type: Array
    }
  },
  data() {
    return { feather };
  }
});
</script>
