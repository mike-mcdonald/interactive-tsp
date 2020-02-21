<template>
  <main class="flex flex-col-reverse md:flex-row">
    <section
      class="w-full md:w-1/3 h-screen-50 md:h-screen overflow-y-auto border-t md:border-r md:border-t-0 border-black"
    >
      <transition name="fade">
        <div
          v-if="message"
          class="mb-2 px-2 py-3 w-full border-b border-tangerine-800 bg-tangerine-300 text-tangerine-900"
        >{{ message }}</div>
      </transition>
      <transition name="fade">
        <section v-if="!$route.params.id" id="filters" class="m-2">
          <address-suggest v-on:candidate-select="goToAddress" />
          <div v-for="layer in layers" :key="layer.id">
            <checkbox
              :value="layer.visible"
              :title="layer.title"
              @input="toggleLayerVisibility(layer, $event)"
            />
            <chart
              v-if="streets.length > 0 && infoDisplay[layer.id]"
              :dataset="
                analysis.reduce((prev, curr) => {
                  if (curr.classification == layer.id) prev.push(curr);
                  return prev;
                }, [])
              "
            ></chart>
          </div>
        </section>
      </transition>
      <div class="m-2">
        <transition name="fade">
          <div v-if="!$route.params.id && streets">{{ streets.length }} streets found in view</div>
          <router-link
            v-if="$route.params.id"
            to="/streets"
            class="border-b-2 border-black"
          >Back to results</router-link>
        </transition>
      </div>
      <transition name="fade">
        <ul v-if="!$route.params.id" class="list-none">
          <li v-for="street in streets" :key="street.id">
            <router-link
              :to="street.id"
              append
              class="flex flex-col m-2 px-2 py-3 shadow rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
              @mouseover.native="highlightStreet({ street, move: false })"
              @focus.native="highlightStreet({ street, move: false })"
            >
              <div>{{ street.name }}</div>
              <div v-if="street.block" class="text-xs">{{ street.block }} block</div>
            </router-link>
          </li>
        </ul>
      </transition>
      <street-component v-if="$route.params.id && selectedStreet" :street="selectedStreet" />
    </section>
    <section class="w-full md:w-2/3 h-screen-50 md:h-screen">
      <app-map :layers="layers" v-on:click="handleClick" v-on:extent-change="findStreets($event)"></app-map>
    </section>
  </main>
</template>
<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions, mapMutations } from 'vuex';

import { BBox } from '@turf/helpers';

import { Polyline, Extent } from 'esri/geometry';
import Graphic from 'esri/Graphic';
import { SimpleLineSymbol } from 'esri/symbols';

import AddressSuggest from 'portland-pattern-lab/source/_patterns/04-organisms/address-search/AddressSuggest.vue';
import Checkbox from 'portland-pattern-lab/source/_patterns/02-molecules/form/Checkbox.vue';

import AppMap from '@/components/Map.vue';
import Chart from '@/components/Chart.vue';
import StreetComponent from '@/components/Street.vue';

import { Street, StreetState } from '../store/streets/types';
import { AddressCandidate } from '../store/portlandmaps/types';
import Layer from 'esri/layers/Layer';

export default Vue.extend({
  name: 'Streets',
  components: {
    AddressSuggest,
    AppMap,
    Chart,
    Checkbox,
    StreetComponent
  },
  data() {
    return {
      chart: {} as { [key: string]: boolean }
    };
  },
  computed: {
    ...mapState(['message']),
    ...mapState('map', ['view']),
    ...mapState('streets', {
      layers: (state: StreetState) => state.layers,
      streets: (state: StreetState) => state.list,
      selectedStreet: (state: StreetState) => state.selected,
      analysis: (state: StreetState) => state.analysis
    })
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // access to component instance via `vm`
      if (to.params.id) {
        vm.$store.dispatch('text/findText');
        vm.$store.dispatch('streets/selectStreetById', to.params.id);
      }
    });
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.id) {
      this.$store.dispatch('streets/selectStreetById', to.params.id);
    }
    next();
  },
  mounted() {
    this.infoDisplay = this.layers.reduce((prev: { [key: string]: boolean }, curr: Layer) => {
      prev[curr.id] = curr.visible;
      return prev;
    }, {});
  },
  methods: {
    ...mapActions('map', ['setLayerVisibility']),
    toggleLayerVisibility(layer: Layer, value: boolean) {
      this.infoDisplay[layer.id] = value;
      this.setLayerVisibility({ layerId: layer.id, visible: value });
    },
    goToAddress(address: AddressCandidate) {
      this.setLocation(address.location);
    },
    handleClick(event: __esri.MapViewClickEvent) {
      this.view.hitTest(event).then((response: __esri.HitTestResult) => {
        if (response.results.length) {
          var graphic = response.results[0].graphic;
          // do something with the result graphic
          this.$router.push({ name: 'streets', params: { id: graphic.attributes.TranPlanID } });
        }
      });
    },
    ...mapActions('map', ['clearGraphics', 'setLocation']),
    ...mapActions('streets', ['findStreets', 'selectStreet', 'selectStreetById', 'highlightStreet'])
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
