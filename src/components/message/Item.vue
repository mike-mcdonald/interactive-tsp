<template>
  <li class="mb-2 p-4 w-full border border-l-8 rounded flex items-center justify-between" :class="colors">
    {{ item.text }}
    <button @click="removeMessage(item.id)">
      <i v-html="feather.icons['x'].toSvg({ class: 'w-5 h-5' })" />
    </button>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

import feather from 'feather-icons';

import { Message } from '@/store/types';

export default Vue.extend({
  name: 'MessageItem',
  props: {
    item: Object
  },
  data() {
    return {
      feather
    };
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
  },
  methods: {
    ...mapActions(['removeMessage'])
  }
});
</script>
