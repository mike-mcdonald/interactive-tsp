<template>
  <section class="relative">
    <main class="flex items-center justify-between -mx-2">
      <div ref="chart" class="flex flex-row mx-2 w-full border border-black">
        <div
          v-for="entry in dataset"
          :key="entry.value"
          class="h-4"
          :style="{
            'background-color': entry.color.formatRgb(),
            width: `${(entry.count / total) * 100}%`
          }"
          :aria-label="`${entry.label}: ${entry.count} / ${datasetTotal(dataset)}`"
        ></div>
      </div>
    </main>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { ViewModel } from '../store/streets/types';

export default Vue.extend({
  name: 'Chart',
  props: {
    dataset: {
      type: Array as () => Array<ViewModel>,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  methods: {
    datasetTotal(dataset: Array<ViewModel>) {
      return dataset.reduce((prev, curr) => {
        return prev + curr.count;
      }, 0);
    }
  }
});
</script>

<style lang="scss" scoped>
.bounce-enter-active {
  animation: bounce-in 0.33s;
}
.bounce-leave-active {
  animation: bounce-in 0.33s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
</style>
