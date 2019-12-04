<template>
  <div class="h-full">
    <section class="h-full">
      <div ref="map" class="relative h-full w-full"></div>
    </section>
    <div ref="top-left">
      <slot name="top-left">
        <div class="flex flex-col">
          <button class="p-2 bg-white border border-fog-900" v-on:click="incrementZoom">
            <!-- This is from feather.  Their site is here: https://www.feathericons.com -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button class="p-2 bg-white border border-fog-900" v-on:click="decrementZoom">
            <!-- This is from feather.  Their site is here: https://www.feathericons.com -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </slot>
    </div>
    <div ref="top-right">
      <slot name="top-right">
        <button v-if="!showSettings" class="p-2 bg-white border border-fog-900" v-on:click="showSettings = true">
          <!-- This is from feather.  Their site is here: https://www.feathericons.com -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-5 w-5"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </button>
        <div v-if="showSettings" class="bg-white h-64 overflow-y-auto border border-fog-900">
          <header class="flex items-baseline justify-between sticky top-0 z-10 bg-gray-100 border-b border-black">
            <h2 class="p-2 text-2xl">Settings</h2>
            <button aria-label="Close" class="p-3" @click.stop.prevent="showSettings = false">
              <X />
            </button>
          </header>
          <main class="overflow-y-auto p-2">
            <header class="flex items-baseline justify-between">
              <h3 class="text-xl">Layers</h3>
            </header>
            <checkbox
              v-for="layer in layers"
              :value="layer.visible"
              :key="layer.id"
              :title="layer.title"
              @input="toggleLayerVisibility(layer.id, $event)"
            />
          </main>
        </div>
      </slot>
    </div>
    <div ref="bottom-left">
      <slot name="bottom-left"></slot>
    </div>
    <div ref="bottom-right">
      <slot name="bottom-right">
        <button v-if="!showLegend" class="p-2 bg-white border border-fog-900" v-on:click="showLegend = true">
          <!--
            This is from feather.  Their site is here: https://www.feathericons.com
            Their license is here: https://github.com/feathericons/feather/blob/master/LICENSE
          -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-5 w-5"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
        <div v-show="showLegend" class="bg-white h-64 overflow-y-auto border border-fog-900">
          <header class="flex items-baseline justify-between sticky top-0 z-10 bg-gray-100 border-b border-black">
            <h2 class="p-2 text-2xl">Legend</h2>
            <button aria-label="Close" class="p-3" @click.stop.prevent="showLegend = false">
              <X />
            </button>
          </header>
          <main ref="legend"></main>
        </div>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions, mapMutations } from 'vuex';

import * as _ from 'lodash';
import * as turf from '@turf/helpers';

import { whenTrue } from 'esri/core/watchUtils';
import Map from 'esri/Map';
import Extent from 'esri/geometry/Extent';
import { Point, Polyline } from 'esri/geometry';
import Graphic from 'esri/Graphic';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import Layer from 'esri/layers/Layer';
import SimpleLineSymbol from 'esri/symbols/SimpleLineSymbol';
import MapView from 'esri/views/MapView';
import Legend from 'esri/widgets/Legend';

import Checkbox from 'portland-pattern-lab/source/_patterns/02-molecules/form/Checkbox.vue';
import X from 'portland-pattern-lab/source/_patterns/01-atoms/04-images/X.vue';
import { MapState } from '../store/map/types';

export default Vue.extend({
  name: 'Map',
  components: {
    Checkbox,
    X
  },
  props: {
    legend: {
      type: Boolean,
      default: true
    },
    layers: {
      type: Array
    }
  },
  data: function() {
    return {
      displayExtent: {},
      clickPoint: null,
      selectedGraphic: null,
      showSettings: false,
      showLegend: false
    };
  },
  computed: {
    ...mapState('map', {
      map: (state: MapState) => state.map,
      extent: (state: MapState) => state.extent,
      basemaps: (state: MapState) => state.basemaps,
      zoom: (state: MapState) => state.zoom.current
    })
  },
  methods: {
    ...mapActions('map', ['setExtent', 'setZoom', 'setLayerVisibility']),
    ...mapMutations('map', ['setView', 'setLayers']),
    toggleLayerVisibility(id: string, value: Boolean) {
      this.setLayerVisibility({ layerId: id, visible: value });
    },
    incrementZoom() {
      this.setZoom(this.zoom + 1);
    },
    decrementZoom() {
      this.setZoom(this.zoom - 1);
    }
  },
  mounted: function() {
    const view = new MapView({
      container: this.$refs.map as HTMLDivElement,
      map: this.map,
      extent: this.extent
    });

    this.setLayers(this.layers);

    view.ui.remove('zoom');

    view.ui.add(this.$refs['top-left'] as HTMLDivElement, {
      position: 'top-left',
      index: 2
    });
    view.ui.add(this.$refs['top-right'] as HTMLDivElement, {
      position: 'top-right',
      index: 2
    });
    view.ui.add(this.$refs['bottom-left'] as HTMLDivElement, {
      position: 'bottom-left',
      index: 2
    });
    view.ui.add(this.$refs['bottom-right'] as HTMLDivElement, {
      position: 'bottom-right',
      index: 2
    });

    if (this.legend) {
      new Legend({
        view,
        container: this.$refs['legend'] as HTMLDivElement
      });
    }

    view.watch(
      'extent',
      _.debounce((newValue: __esri.Extent) => {
        this.setExtent(newValue);
        this.$emit('extent-change', newValue);
      }, 500)
    );

    view.on('click', (event: __esri.MapViewClickEvent) => {
      this.$emit('click', event);
    });

    whenTrue(view, 'stationary', () => {
      if (view.zoom) {
        this.setZoom(view.zoom);
      }
    });

    this.setView(view);
  }
});
</script>

<style lang="scss">
@import url('https://js.arcgis.com/4.13/esri/themes/light/main.css');

.esri-ui {
  @apply text-base;
  .esri-ui-corner {
    .esri-component {
      @apply m-0;
      .esri-widget--panel {
        @apply w-full;
      }
    }
  }
  .esri-widget {
    font-family: inherit;
    @apply text-base;
    .esri-legend__service {
      @apply p-2;
    }
    .esri-widget__heading {
      @apply text-base;
    }
    .esri-legend__layer-cell--info {
      @apply text-sm;
    }
  }
}

@media print {
  .esri-ui {
    display: none;
  }

  .esri-view-user-storage {
    display: none;
  }
}
</style>
