<template>
  <ul class="list-none">
    <transition name="fade">
      <message-item v-for="(message, index) in messages" :key="index" :item="message" />
    </transition>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import MessageItem from '@/components/message/Item.vue';
export default Vue.extend({
  name: 'MessageList',
  components: {
    MessageItem
  },
  computed: {
    ...mapState(['messages'])
  }
});
</script>
