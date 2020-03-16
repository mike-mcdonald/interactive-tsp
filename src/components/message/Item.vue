<template>
  <li
    class="mb-2 px-2 py-3 w-full border border-l-8 rounded"
    :class="[
      `border-${colorMap.get(item.type)}-800`,
      `bg-${colorMap.get(item.type)}-100`,
      `text-${colorMap.get(item.type)}-900`
    ]"
  >
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
  data() {
    return {
      colorMap: new Map([
        ['error', 'red'],
        ['warning', 'tangerine'],
        ['info', 'blue']
      ])
    };
  }
});
</script>
