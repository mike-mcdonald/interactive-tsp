<template>
  <section>
    <div ref="chart" class="flex flex-row border border-black shadow-inner">
      <span
        v-for="entry in dataset"
        :key="entry.value"
        class="h-4"
        :style="{
          'background-color': entry.color.formatRgb(),
          width: `${(entry.count / total) * 100}%`
        }"
      ></span>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

export default Vue.extend({
  name: 'Chart',
  props: {
    dataset: {
      type: Array,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  computed: {
    datasetTotal() {
      return this.dataset.reduce((prev: any, curr: any) => {
        prev = prev + curr.count;
        return prev;
      }, 0);
    }
  }
});
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
