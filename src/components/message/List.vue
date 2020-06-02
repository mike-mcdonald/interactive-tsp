<template>
  <ul class="list-none">
    <transition-group name="pop" mode="out-in">
      <message-item class="my-2" v-for="message in messages" :key="message.id" :item="message" />
    </transition-group>
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
