<template>
  <section>
    <main class="flex flex-col">
      <section class="my-2 flex items-center justify-between">
        <label :for="group" class="flex items-center font-semibold">
          <input
            type="checkbox"
            :id="group"
            :checked="enabled"
            :title="group"
            @change="setGroupVisibility($event.target.checked)"
          />
          <span class="mx-2">{{ group.charAt(0).toUpperCase() + group.slice(1) }} classifications</span>
          <span
            v-if="
              dataset.reduce((prev, curr) => {
                return prev + curr.count;
              }, 0) > 0
            "
            class="px-2 bg-blue-500 rounded-full text-blue-100 text-sm"
            >{{ badge }}</span
          >
        </label>

        <button class="px-2 py-1 text-sm" @click="show = !show">
          <i v-if="!show" v-html="feather.icons['chevron-down'].toSvg({ class: 'w-5 h-5' })" />
          <i v-if="show" v-html="feather.icons['chevron-up'].toSvg({ class: 'w-5 h-5' })" />
        </button>
      </section>
      <chart
        v-if="streets.length > 0"
        :total="streets.length"
        :dataset="dataset.filter(value => value.enabled)"
      ></chart>
    </main>
    <transition name="bounce">
      <footer v-if="show" class="my-2 p-2 bg-fog-200 text-fog-900 border border-fog-900 rounded-sm">
        <label v-for="entry in dataset" :key="entry.value" :for="entry.key" class="flex items-center">
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
            <router-link
              :to="{
                name: 'text',
                hash: `#${entry.label
                  .toLowerCase()
                  .split(' ')
                  .join('-')}`
              }"
              class="border-current border-b-2"
              >{{ entry.label }}</router-link
            >: {{ entry.count }} /
            {{
              dataset.reduce((prev, curr) => {
                return prev + curr.count;
              }, 0)
            }}
          </span>
        </label>
      </footer>
    </transition>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapState, mapActions } from 'vuex';

import feather from 'feather-icons';

import { ViewModel, StreetState } from '@/store/streets/types';

import Chart from '@/components/Chart.vue';

// Define the props by using Vue's canonical way.
const ClassificationProps = Vue.extend({
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
  }
});

@Component({
  name: 'Classification',
  components: {
    Chart
  },

  data() {
    return {
      show: false,
      feather
    };
  },
  computed: {
    ...mapState('streets', {
      streets: (state: StreetState) => state.list
    })
  },
  methods: {
    ...mapActions('map', ['setLayerVisibility'])
  }
})
export default class Classification extends ClassificationProps {
  setLayerVisibility!: (payload: { layerId: string; visible: boolean }) => void;

  get enabled() {
    return this.dataset.reduce((prev, curr) => {
      return prev || curr.enabled;
    }, false);
  }

  get badge() {
    return `${this.dataset
      .filter(value => value.enabled)
      .reduce((prev, curr) => {
        return prev + curr.count;
      }, 0)}/${this.dataset.reduce((prev, curr) => {
      return prev + curr.count;
    }, 0)}`;
  }

  datasetTotal(dataset: Array<ViewModel>) {
    return dataset.reduce((prev, curr) => {
      return prev + curr.count;
    }, 0);
  }

  setGroupVisibility(value: boolean) {
    for (const entry of this.dataset) {
      this.setVisibility(entry, value);
    }
  }

  setVisibility(model: ViewModel, value: boolean) {
    model.enabled = value;
    if (model.layer) {
      model.layer.visible = value;
      this.setLayerVisibility({ layerId: model.layer?.id, visible: value });
    }
  }
}
</script>

<style lang="scss" scoped>
.bounce-enter-active {
  animation: bounce-in 0.25s;
}
.bounce-leave-active {
  animation: bounce-in 0.25s reverse;
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
