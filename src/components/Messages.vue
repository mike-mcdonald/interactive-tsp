<template>
  <transition name="fade">
    <div
      v-for="(message, index) in messages"
      :key="index"
      class="mb-2 px-2 py-3 w-full border border-l-8 rounded"
      :class="classes(message)"
    >
      {{ message.text }}
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { Message } from '@/store/types';
export default Vue.extend({
  name: 'Messages',
  computed: {
    ...mapState(['messages'])
  },
  methods: {
    classes: (message: Message) => {
      const colorMap = new Map([
        ['error', 'red'],
        ['warning', 'tangerine'],
        ['info', 'blue']
      ]);

      return [
        `border-${colorMap.get(message.type)}-800`,
        `bg-${colorMap.get(message.type)}-100`,
        `text-${colorMap.get(message.type)}-900`
      ];
    }
  }
});
</script>
