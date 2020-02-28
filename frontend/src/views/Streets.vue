<template>
  <main>
    <div class="w-full h-screen border-b border-black md:border-0 sticky top-0">
      <app-map :layers="layers" v-on:click="handleClick" v-on:extent-change="findStreets($event)">
        <template v-slot:manual>
          <div class="px-2 py-4 w-full h-full flex flex-col-reverse justify-between md:flex-row pointer-events-none">
            <section class="h-64 md:w-1/3 md:h-full pointer-events-auto">
              <div
                v-if="!$route.params.id"
                class="px-2 py-3 bg-white border border-fog-900 shadow max-h-full overflow-y-auto"
              >
                <transition name="fade">
                  <div
                    v-if="message"
                    class="mb-2 px-2 py-3 w-full border-l-8 border-tangerine-800 bg-tangerine-300 text-tangerine-900"
                  >
                    {{ message }}
                  </div>
                </transition>
                <address-suggest v-on:candidate-select="goToAddress" />
                <div v-if="streets.length > 0">{{ streets.length }} streets found in view</div>
                <ul class="list-none -mx-2">
                  <li v-for="street in streets" :key="street.id" class="p-2">
                    <router-link
                      :to="street.id"
                      append
                      class="flex-shrink flex flex-col h-full px-2 py-3 shadow border rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
                      @mouseover.native="highlightStreet({ street, move: false })"
                      @focus.native="highlightStreet({ street, move: false })"
                    >
                      <div>{{ street.name }}</div>
                      <div v-if="street.block" class="text-xs">{{ street.block }} block</div>
                      <div class="flex flex-row flex-wrap -mx-1 text-xs text-gray-600">
                        <span
                          v-for="c in enabledClassifications"
                          :key="c"
                          class="flex flex-row flex-wrap items-center mx-1"
                        >
                          <span
                            class="h-2 w-2 p-1 mr-1 border border-fog-800"
                            :style="{
                              'background-color': classificationColor(c, street.classifications[c]).formatRgb()
                            }"
                          ></span>
                          <span>{{ classificationLabel(c, street.classifications[c]) }}</span>
                        </span>
                      </div>
                    </router-link>
                  </li>
                </ul>
              </div>
              <div v-else class="px-2 py-3 bg-white border border-fog-900 shadow max-h-full overflow-y-auto">
                <router-link to="/streets" class="mx-2 border-b-2 border-black">Back to results</router-link>
                <street-component v-if="selectedStreet" :street="selectedStreet" />
              </div>
            </section>
            <section id="filters" class="h-64 md:h-full p-2 md:max-w-lg pointer-events-auto">
              <div class="bg-white rounded border border-fog-900">
                <header class="p-2"><h2>Map settings</h2></header>
                <main class="p-2">
                  <div v-for="layer in layers" :key="layer.id">
                    <section class="flex items-center justify-between">
                      <checkbox
                        :value="layer.visible"
                        :title="layer.title"
                        @input="toggleLayerVisibility(layer, $event)"
                      />
                      <button>layer settings</button>
                    </section>
                    <chart
                      v-if="streets.length > 0 && models.find(value => value.key == layer.id && value.enabled)"
                      :total="streets.length"
                      :dataset="
                        models.reduce((prev, curr) => {
                          if (curr.key == layer.id) prev.push(curr);
                          return prev;
                        }, [])
                      "
                    ></chart>
                    <!-- <section class="flex flex-col p-2 bg-fog-200 text-fog-900 border border-fog-900 rounded">
                <span
                  v-for="model in models.reduce((prev, curr) => {
                    if (curr.key == layer.id) prev.push(curr);
                    return prev;
                  }, [])"
                  :key="model.value"
                >
                  <checkbox
                    :value="model.layer.visible"
                    :title="model.layer.title"
                    @input="toggleLayerVisibility(model.layer, $event)"
                  />
                </span>
              </section> -->
                  </div>
                </main>
              </div>
            </section>
          </div>
        </template>
      </app-map>
    </div>
  </main>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Route, RawLocation } from 'vue-router';
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex';
import { State, Getter, Action, Mutation, namespace } from 'vuex-class';

import { BBox } from '@turf/helpers';
import proj4 from 'proj4';

import { Polyline, Extent } from 'esri/geometry';
import Graphic from 'esri/Graphic';
import Layer from 'esri/layers/Layer';
import { SimpleLineSymbol } from 'esri/symbols';
import MapView from 'esri/views/MapView';

import Checkbox from 'portland-pattern-lab/source/_patterns/02-molecules/form/Checkbox.vue';

import AddressSuggest from '@/components/AddressSuggest.vue';
import AppMap from '@/components/Map.vue';
import Chart from '@/components/Chart.vue';
import StreetComponent from '@/components/Street.vue';

import { Street, StreetState, ViewModel } from '../store/streets/types';
import { AddressCandidate, Location } from '../store/portlandmaps/types';
import { MapState } from '../store/map/types';

// ESRI maps use this wkid
proj4.defs('102100', proj4.defs('EPSG:3857'));

const mapModule = namespace('map');
const streetsModule = namespace('streets');

@Component({
  name: 'Streets',
  components: {
    AddressSuggest,
    AppMap,
    Chart,
    Checkbox,
    StreetComponent
  },
  computed: {
    ...mapState(['message']),
    ...mapState('map', {
      view: (state: MapState) => state.view
    }),
    ...mapState('streets', {
      layers: (state: StreetState) => state.layers,
      streets: (state: StreetState) => state.list,
      selectedStreet: (state: StreetState) => state.selected,
      models: (state: StreetState) => state.models
    }),
    ...mapGetters('streets', ['classificationLabel', 'classificationColor'])
  },
  methods: {
    ...mapActions('map', ['setLocation', 'setLayerVisibility']),
    ...mapActions('streets', ['findStreets', 'selectStreet', 'selectStreetById', 'highlightStreet'])
  },
  beforeRouteEnter(to: Route, from: Route, next: (to?: RawLocation | false | ((vm: Vue) => void)) => void) {
    next((vm: Vue) => {
      // access to component instance via `vm`
      if (to.params.id) {
        vm.$store.dispatch('text/findText');
        vm.$store.dispatch('streets/selectStreetById', to.params.id);
      }
    });
  },
  beforeRouteUpdate(to: Route, from: Route, next: (to?: RawLocation | false | ((vm: Vue) => void)) => void) {
    if (to.params.id) {
      this.$store.dispatch('streets/selectStreetById', to.params.id);
    }
    next();
  }
})
export default class Streets extends Vue {
  message!: string;
  view!: MapView;
  layers!: Array<Layer>;
  streets!: Array<Street>;
  selectedStreet!: Street;
  models!: Array<ViewModel>;

  setLocation!: (location: Location) => void;
  setLayerVisibility!: (payload: { layerId: string; visible: boolean }) => void;

  get enabledClassifications() {
    return this.models.reduce((prev, curr) => {
      if (curr.enabled) prev.add(curr.key);
      return prev;
    }, new Set<string>());
  }

  goToAddress(address: AddressCandidate) {
    this.setLocation(address.location);
  }

  handleClick(event: __esri.MapViewClickEvent) {
    this.view.hitTest(event).then((response: __esri.HitTestResult) => {
      response.results.some(result => {
        const graphic = result.graphic;
        if (Object.keys(graphic.attributes).find(key => key === 'TranPlanID')) {
          this.$router.push({ name: 'streets', params: { id: graphic.attributes.TranPlanID } });
          return true;
        }
      });
    });
  }

  toggleLayerVisibility(layer: Layer, visible: boolean) {
    this.models.filter(value => value.key == layer.id).forEach(model => (model.enabled = visible));
    visible ? this.enabledClassifications.add(layer.id) : this.enabledClassifications.delete(layer.id);
    this.setLayerVisibility({ layerId: layer.id, visible });
  }
}
</script>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
