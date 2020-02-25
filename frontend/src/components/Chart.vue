<template>
  <section class="relative">
    <div ref="chart" class="flex flex-row border border-black shadow-inner">
      <router-link
        v-for="entry in dataset"
        :key="entry.classificationValue"
        class="h-4"
        :style="{
          'background-color': entry.color.formatRgb(),
          width: `${(entry.count / total) * 100}%`
        }"
        :to="{
          name: 'text',
          hash: `#${entry.label
            .toLowerCase()
            .split(' ')
            .join('-')}`
        }"
        :title="`${entry.label}: ${entry.count} / ${datasetTotal}`"
        @mouseenter.native="show[entry.classificationValue] = true"
        @mouseleave.native="show[entry.classificationValue] = false"
        @touchenter.native="show[entry.classificationValue] = true"
        @touchleave.native="show[entry.classificationValue] = false"
      ></router-link>
    </div>
    <transition name="fade">
      <div
        v-for="entry in dataset"
        :key="entry.classificationValue"
        v-if="show[entry.classificationValue]"
        class="absolute z-50 inset-x-0 top-0 mt-6 p-2 bg-fog-200 border border-fog-900 rounded"
      >
        {{ entry.label }}: {{ entry.count }} / {{ datasetTotal }}
      </div>
    </transition>
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
  data() {
    const show = this.dataset.reduce((prev: any, curr: any) => {
      prev[curr.classificationValue] = false;
      return prev;
    }, {});

    return {
      show
    };
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
