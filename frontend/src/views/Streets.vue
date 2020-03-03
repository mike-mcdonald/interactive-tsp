<template>
  <main>
    <div class="w-full h-screen border-b border-black md:border-0 sticky top-0">
      <app-map
        :layers="
          models.reduce((prev, curr) => {
            if (curr.layer) prev.push(curr.layer);
            return prev;
          }, [])
        "
        v-on:click="handleClick"
        v-on:extent-change="findStreets($event)"
      >
        <template v-slot:manual>
          <div class="px-2 py-4 w-full h-full flex flex-col-reverse justify-between md:flex-row pointer-events-none">
            <section class="w-full md:w-1/3 h-64 md:h-full flex items-end md:items-start">
              <div class="map-panel">
                <div v-if="!$route.params.id">
                  <header class="bg-fog-100 border-b border-fog-500 sticky top-0">
                    <transition name="fade">
                      <div
                        v-if="message"
                        class="px-2 py-3 w-full border-l-8 border-tangerine-800 bg-tangerine-300 text-tangerine-900"
                      >
                        {{ message }}
                      </div>
                    </transition>
                    <address-suggest class="p-2" v-on:candidate-select="goToAddress" />
                    <div v-if="streets.length > 0" class="p-2 flex items-center justify-between">
                      <span>{{ filteredStreets.length }} out of {{ streets.length }} streets found in view</span>
                      <button
                        v-if="filteredStreets.length > 0"
                        class="px-2 py-1 text-sm"
                        @click="showStreets = !showStreets"
                      >
                        <i v-if="!showStreets" v-html="feather.icons['chevron-down'].toSvg({ class: 'w-5 h-5' })" />
                        <i v-if="showStreets" v-html="feather.icons['chevron-up'].toSvg({ class: 'w-5 h-5' })" />
                      </button>
                    </div>
                  </header>
                  <div v-if="filteredStreets.length > 0" v-show="showStreets">
                    <ul class="p-2 list-none">
                      <li v-for="street in filteredStreets" :key="street.id" class="my-2">
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
                              v-for="c in filteredClassifications(street.classifications)"
                              :key="`${c.group}-${c.value}`"
                              class="flex flex-row flex-wrap items-center mx-1"
                            >
                              <span
                                class="h-2 w-2 p-1 mr-1 border border-fog-800"
                                :style="{
                                  'background-color': classificationColor(c.group, c.value).formatRgb()
                                }"
                              ></span>
                              <span>{{ classificationLabel(c.group, c.value) }}</span>
                            </span>
                          </div>
                        </router-link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div v-else>
                  <header class="m-2">
                    <router-link to="/streets" class="border-b-2 border-black">Back to results</router-link>
                  </header>
                  <street-component class="p-2" v-if="selectedStreet" :street="selectedStreet" />
                </div>
              </div>
            </section>
            <section id="filters" class="w-full md:w-1/3 h-64 md:h-full">
              <div class="map-panel">
                <header class="p-2 flex items-center justify-between bg-fog-100 border-b border-fog-500 sticky top-0">
                  <h2>Map settings</h2>
                  <button class="px-2 py-1 text-sm" @click="showFilters = !showFilters">
                    <i v-if="!showFilters" v-html="feather.icons['chevron-down'].toSvg({ class: 'w-5 h-5' })" />
                    <i v-if="showFilters" v-html="feather.icons['chevron-up'].toSvg({ class: 'w-5 h-5' })" />
                  </button>
                </header>
                <main v-show="showFilters" class="p-2">
                  <div v-for="(group, index) in controllableModelGroups" :key="index">
                    <classification
                      :group="group"
                      :dataset="
                        models.reduce((prev, curr) => {
                          if (curr.group === group) prev.push(curr);
                          return prev;
                        }, [])
                      "
                      :total="streets.length"
                    ></classification>
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

import { BBox } from '@turf/helpers';
import feather from 'feather-icons';
import proj4 from 'proj4';

import { Polyline, Extent } from 'esri/geometry';
import Graphic from 'esri/Graphic';
import Layer from 'esri/layers/Layer';
import { SimpleLineSymbol } from 'esri/symbols';
import MapView from 'esri/views/MapView';

import Checkbox from 'portland-pattern-lab/source/_patterns/02-molecules/form/Checkbox.vue';

import AddressSuggest from '@/components/AddressSuggest.vue';
import AppMap from '@/components/Map.vue';
import Classification from '@/components/streets/Classification.vue';
import StreetComponent from '@/components/Street.vue';

import { Street, StreetState, ViewModel } from '../store/streets/types';
import { AddressCandidate, Location } from '../store/portlandmaps/types';
import { MapState } from '../store/map/types';

// ESRI maps use this wkid
proj4.defs('102100', proj4.defs('EPSG:3857'));

@Component({
  name: 'Streets',
  components: {
    AddressSuggest,
    AppMap,
    Checkbox,
    Classification,
    StreetComponent
  },
  data() {
    return { showInfo: {}, feather };
  },
  computed: {
    ...mapState(['message']),
    ...mapState('map', {
      view: (state: MapState) => state.view
    }),
    ...mapState('streets', {
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

  feather = feather;
  showStreets = true;
  showFilters = true;

  get controllableModelGroups() {
    return this.models.reduce((prev, curr) => {
      if (curr.group != 'greenscape') prev.add(curr.group);
      return prev;
    }, new Set<string>());
  }

  get enabledModels() {
    return Array.from(this.models).reduce((prev, curr) => {
      if (curr.enabled) prev.add(curr);
      return prev;
    }, new Set<ViewModel>());
  }

  get filteredStreets() {
    return this.streets.reduce((prev, curr) => {
      if (
        this.models.find(value => {
          if (!curr.classifications || !value.enabled) return false;
          return curr.classifications[value.group] == value.value;
        })
      ) {
        prev.push(curr);
      }
      return prev;
    }, new Array<Street>());
  }

  filteredClassifications(classifications: { [key: string]: string }) {
    return Object.keys(classifications).reduce((prev, curr) => {
      const enabled = this.models.find(
        value => value.group == curr && value.value == classifications[curr] && value.enabled
      );

      if (enabled) prev.push({ group: curr, value: classifications[curr] });

      return prev;
    }, new Array<any>());
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
}
</script>

<style lang="scss" scoped>
.map-panel {
  @apply w-full bg-white border border-fog-900 rounded-sm shadow max-h-full overflow-y-auto pointer-events-auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

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
