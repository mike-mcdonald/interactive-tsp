<template>
  <main class="flex flex-col-reverse md:flex-row">
    <section
      class="w-full md:w-1/3 h-full md:h-(screen-16) overflow-y-auto border-t md:border-t-0 md:border-r border-black"
    >
      <section class="m-2">
        <messages />
      </section>
      <section
        v-if="!$route.params.id"
        id="filters"
        class="m-2 border border-gray-500 rounded shadow bg-gray-100 text-gray-900"
      >
        <header
          class="p-2 border-gray-500 flex items-center justify-between"
          :class="{
            'border-b': showFilters
          }"
        >
          <h2>Display settings</h2>
          <button class="px-2 py-1 text-sm" @click="showFilters = !showFilters">
            <i
              v-if="!showFilters"
              v-html="feather.icons['chevron-down'].toSvg({ class: 'w-5 h-5' })"
            />
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
      </section>
      <section class="m-2">
        <div v-if="!$route.params.id">
          <header>
            <address-suggest v-on:candidate-select="goToAddress" />
          </header>
          <div v-if="streets.length > 0">
            <ul class="list-none">
              <li v-for="street in streets" :key="street.id" class="my-2">
                <router-link
                  :to="street.id"
                  append
                  class="flex-shrink flex flex-col h-full px-2 py-3 shadow border rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
                  @mouseover.native="highlightStreet({ street, move: false })"
                  @focus.native="highlightStreet({ street, move: false })"
                >
                  <div>{{ street.name || 'Unnamed segment' }}</div>
                  <div v-if="street.block" class="text-base font-thin">{{ street.block }} block</div>
                  <div class="flex flex-row flex-wrap -mx-1 text-sm text-gray-600">
                    <span
                      v-for="c in filteredClassifications(
                        street.classifications
                      )"
                      :key="`${c.group}-${c.value}`"
                      class="flex flex-row flex-wrap items-center mx-1"
                    >
                      <span
                        class="h-2 w-2 p-1 mr-1 border border-gray-900"
                        :style="{
                          'background-color': classificationColor(
                            c.group,
                            c.value
                          ).formatRgb()
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
      </section>
      <div v-if="$route.params.id">
        <header class="m-2">
          <router-link to="/streets" class="border-b-2 border-black">Back to results</router-link>
        </header>
        <street-component class="p-2" v-if="selectedStreet" :street="selectedStreet" />
      </div>
    </section>
    <section class="w-full md:w-2/3 h-screen-50 md:h-(screen-16)">
      <app-map
        :layers="
          models.reduce((prev, curr) => {
            if (curr.layer) prev.push(curr.layer);
            return prev;
          }, [])
        "
        v-on:click="handleClick"
        v-on:extent-change="handleExtentChange"
      ></app-map>
    </section>
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
import Messages from '@/components/Messages.vue';
import StreetComponent from '@/components/Street.vue';

import { Street, StreetState, ViewModel } from '../store/streets/types';
import {
  AddressCandidate,
  Location,
  CandidateState
} from '../store/portlandmaps/types';
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
    Messages,
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
    ...mapState('portlandmaps', {
      candidates: (state: CandidateState) => state.candidates
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
    ...mapActions('streets', [
      'findStreets',
      'selectStreet',
      'selectStreetById',
      'highlightStreet'
    ])
  },
  beforeRouteEnter(
    to: Route,
    from: Route,
    next: (to?: RawLocation | false | ((vm: Vue) => void)) => void
  ) {
    next((vm: Vue) => {
      // access to component instance via `vm`
      if (to.params.id) {
        vm.$store.dispatch('text/findText');
        vm.$store.dispatch('streets/selectStreet', { id: to.params.id });
      } else {
        vm.$store.dispatch('streets/findStreets', vm.$store.state.map.extent);
      }
    });
  },
  beforeRouteUpdate(
    to: Route,
    from: Route,
    next: (to?: RawLocation | false | ((vm: Vue) => void)) => void
  ) {
    if (to.params.id) {
      this.$store.dispatch('streets/selectStreet', { id: to.params.id });
    } else {
      this.$store.dispatch('streets/findStreets', this.$store.state.map.extent);
    }
    next();
  }
})
export default class Streets extends Vue {
  message!: string;
  view!: MapView;
  candidates!: Array<AddressCandidate>;
  layers!: Array<Layer>;
  streets!: Array<Street>;
  selectedStreet!: Street;
  models!: Array<ViewModel>;

  findStreets!: (extent: Extent) => void;
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
    return Array.from(
      Array.from(this.enabledModels).reduce((prev, curr) => {
        prev.add(curr);
        return prev;
      }, new Set<ViewModel>())
    ).reduce((prev, curr) => {
      if (classifications[curr.group] === curr.value) {
        prev.add({ group: curr.group, value: classifications[curr.group] });
      }
      return prev;
    }, new Set<any>());
  }

  goToAddress(address: AddressCandidate) {
    this.setLocation(address.location);
  }

  handleClick(event: __esri.MapViewClickEvent) {
    this.view.hitTest(event).then((response: __esri.HitTestResult) => {
      response.results.some(result => {
        const graphic = result.graphic;

        if (!graphic.attributes) return false;

        if (Object.keys(graphic.attributes).find(key => key === 'TranPlanID')) {
          if (graphic.attributes.TranPlanID != this.$route.params.id)
            this.$router.push({
              name: 'streets',
              params: { id: graphic.attributes.TranPlanID }
            });
          return true;
        }
      });
    });
  }

  handleExtentChange(extent: Extent) {
    if (!this.$route.params.id) {
      this.findStreets(extent);
    }
  }
}
</script>

<style lang="scss" scoped>
.map-panel {
  @apply w-full bg-white border border-gray-900 rounded shadow max-h-full overflow-y-auto pointer-events-auto;
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
