<template>
  <main class="flex flex-col-reverse">
    <section class="flex flex-col md:flex-row w-full container md:mx-auto h-screen-50 overflow-y-auto">
      <div class="w-full md:w-2/5 py-2 sticky top-0">
        <transition name="fade">
          <section id="filters" class="m-2">
            <div v-for="layer in layers" :key="layer.id">
              <checkbox :value="layer.visible" :title="layer.title" @input="toggleLayerVisibility(layer, $event)" />
              <chart
                v-if="streets.length > 0 && infoDisplay[layer.id]"
                :total="streets.length"
                :dataset="
                  displayInfo.reduce((prev, curr) => {
                    if (curr.classification == layer.id) prev.push(curr);
                    return prev;
                  }, [])
                "
              ></chart>
            </div>
          </section>
        </transition>
      </div>
      <div class="w-full md:w-3/5 py-2 mx-2">
        <transition name="fade">
          <div
            v-if="message"
            class="mb-2 px-2 py-3 w-full border-l-8 border-tangerine-800 bg-tangerine-300 text-tangerine-900"
          >
            {{ message }}
          </div>
        </transition>
        <address-suggest v-if="!$route.params.id" class="my-2" v-on:candidate-select="goToAddress" />
        <div>
          <transition name="fade">
            <div v-if="!$route.params.id && streets">{{ streets.length }} streets found in view</div>
            <router-link v-if="$route.params.id" to="/streets" class="mx-2 border-b-2 border-black"
              >Back to results</router-link
            >
          </transition>
        </div>
        <transition name="fade">
          <ul v-if="!$route.params.id" class="list-none">
            <li v-for="street in streets" :key="street.id">
              <router-link
                :to="street.id"
                append
                class="flex flex-col my-2 px-2 py-3 shadow border rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
                @mouseover.native="highlightStreet({ street, move: false })"
                @focus.native="highlightStreet({ street, move: false })"
              >
                <div>{{ street.name || 'Unnamed segment' }}</div>
                <div v-if="street.block" class="text-xs">{{ street.block }} block</div>
                <div class="flex flex-row flex-wrap -mx-1 text-xs text-gray-600">
                  <span v-for="c in enabledClassifications" :key="c" class="flex flex-row flex-wrap items-center mx-1">
                    <span
                      class="h-2 w-2 p-1 mr-1 border border-fog-800"
                      :style="{ 'background-color': classificationColor(c, street.classifications[c]).formatRgb() }"
                    ></span>
                    <span>{{ classificationLabel(c, street.classifications[c]) }}</span>
                  </span>
                </div>
              </router-link>
            </li>
          </ul>
        </transition>
        <street-component v-if="$route.params.id && selectedStreet" :street="selectedStreet" />
      </div>
    </section>
    <section class="w-full h-screen-50 border-b border-black">
      <app-map :layers="layers" v-on:click="handleClick" v-on:extent-change="findStreets($event)"></app-map>
    </section>
  </main>
</template>
<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex';

import proj4 from 'proj4';
import { BBox } from '@turf/helpers';

import { Polyline, Extent } from 'esri/geometry';
import Graphic from 'esri/Graphic';
import { SimpleLineSymbol } from 'esri/symbols';

import AddressSuggest from 'portland-pattern-lab/source/_patterns/04-organisms/address-search/AddressSuggest.vue';

import AppMap from '@/components/Map.vue';
import StreetComponent from '@/components/Street.vue';

import { Street, StreetState } from '../store/streets/types';
import { AddressCandidate } from '../store/portlandmaps/types';

// ESRI maps use this wkid
proj4.defs('102100', proj4.defs('EPSG:3857'));

export default Vue.extend({
  name: 'Streets',
  components: {
    AddressSuggest,
    AppMap,
    StreetComponent
  },
  data() {
    return {
      infoDisplay: {} as { [key: string]: boolean }
    };
  },
  computed: {
    ...mapState(['message']),
    ...mapState('map', ['view']),
    ...mapState('streets', {
      layers: (state: StreetState) => state.layers,
      streets: (state: StreetState) => state.list,
      selectedStreet: (state: StreetState) => state.selected,
      displayInfo: (state: StreetState) => state.displayInfo
    }),
    ...mapGetters('streets', ['classificationLabel', 'classificationColor']),
    enabledClassifications() {
      return Object.keys(this.infoDisplay).reduce((prev: Array<String>, curr) => {
        if (this.infoDisplay[curr]) prev.push(curr);
        return prev;
      }, []);
    }
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
  methods: {
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
