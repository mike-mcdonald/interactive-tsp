<template>
  <section class="my-2">
    <main class="flex flex-col">
      <section class="my-2 flex flex-wrap items-center justify-between">
        <label :for="group" class="font-semibold">
          <input
            type="checkbox"
            :id="group"
            :checked="enabled"
            :title="group"
            @change="setGroupVisibility($event.target.checked)"
          />
          {{ group.charAt(0).toUpperCase() + group.slice(1) }} classifications
        </label>
        <button class="px-2 py-1 bg-blue-500 text-blue-100 text-sm" @click="show = !show">Settings</button>
      </section>
      <chart :total="streets.length" :dataset="dataset"></chart>
      <transition name="bounce">
        <footer v-if="show" class="my-2 p-2 bg-fog-200 text-fog-900 border border-fog-900 rounded">
          <div v-for="entry in dataset" :key="entry.value" class="flex items-center">
            <input
              type="checkbox"
              :id="entry.key"
              :checked="entry.enabled"
              @change="setVisibility(entry, $event.target.checked)"
            />
            <div
              class="h-4 w-4 px-2 mx-2"
              :style="{
                'background-color': entry.color.formatRgb()
              }"
            ></div>
            <span class="px-2">
              {{ entry.label }}: {{ entry.count }} /
              {{
              dataset.reduce((prev, curr) => {
              return prev + curr.count;
              }, 0)
              }}
            </span>
          </div>
        </footer>
      </transition>
    </main>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions } from 'vuex';

import { ViewModel, StreetState } from '@/store/streets/types';

import Chart from '@/components/Chart.vue';

export default Vue.extend({
  name: 'Classification',
  components: {
    Chart
  },
  props: {
    group: {
      type: String,
      required: true
    },
    dataset: {
      type: Array as () => Array<ViewModel>,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      show: false
    };
  },
  computed: {
    ...mapState('streets', {
      streets: (state: StreetState) => state.list
    }),
    enabled() {
      return this.dataset.reduce((prev, curr) => {
        return prev && curr.enabled;
      }, true);
    }
  },
  methods: {
    ...mapActions('map', ['setLayerVisibility']),
    datasetTotal(dataset: Array<ViewModel>) {
      return dataset.reduce((prev, curr) => {
        return prev + curr.count;
      }, 0);
    },
    setGroupVisibility(value: boolean) {
      for (const entry of this.dataset) {
        this.setVisibility(entry, value);
      }
    },
    setVisibility(model: ViewModel, value: boolean) {
      model.enabled = value;
      if (model.layer) model.layer.visible = value;
      this.setLayerVisibility({ layerId: model.layer?.id, visible: value });
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
