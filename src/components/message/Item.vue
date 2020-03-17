<template>
  <li class="mb-2 px-2 py-3 w-full border border-l-8 rounded" :class="colors">
    {{ item.text }}
  </li>
</template>

<script lang="ts">
import Vue from 'vue';
import { Message } from '@/store/types';
export default Vue.extend({
  name: 'MessageItem',
  props: {
    item: Object
  },
  computed: {
    colors() {
      switch (this.item.type) {
        case 'error':
          return ['border-red-800', 'bg-red-100', 'text-red-900'];
        case 'warning':
          return ['border-orange-800', 'bg-orange-100', 'text-orange-900'];
        case 'info':
          return ['border-blue-800', 'bg-blue-100', 'text-blue-900'];
        default:
          return [];
      }
    }
  }
});
</script>
