<template>
  <main class="flex flex-col-reverse md:flex-row">
    <section
      class="w-full md:w-1/3 h-screen-50 md:h-screen overflow-y-auto border-t md:border-r md:border-t-0 border-black"
    >
      <transition name="fade">
        <div
          v-if="message"
          class="mb-2 px-2 py-3 w-full border-b border-tangerine-800 bg-tangerine-300 text-tangerine-900"
        >
          {{ message }}
        </div>
      </transition>
      <address-suggest class="m-2" v-on:candidate-select="goToAddress" />
      </div>
      <ul v-if="!$route.params.id" class="list-none">
        <li v-for="(street, index) in streets" :key="index" @mouseover="highlightStreet(street)">
          <router-link
            :to="street.id"
            append
              class="flex flex-col m-2 px-2 py-3 shadow rounded bg-white hover:bg-blue-100"
            :class="{ 'border-t': index == 0 }"
          >
            <div>{{ street.name }}</div>
            <div v-if="street.block" class="text-xs">{{ street.block }} block</div></router-link
          >
        </li>
      </ul>
      <street-component v-if="$route.params.id" />
    </section>
    <section class="w-full md:w-2/3 h-screen-50 md:h-screen">
      <app-map></app-map>
    </section>
  </main>
</template>
<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions } from 'vuex';

import { Polyline } from 'esri/geometry';
import Graphic from 'esri/Graphic';
import { SimpleLineSymbol } from 'esri/symbols';

import AddressSuggest from 'portland-pattern-lab/source/_patterns/04-organisms/address-search/AddressSuggest.vue';

import AppMap from '@/components/Map.vue';
import StreetComponent from '@/components/Street.vue';

import { AddressCandidate } from '../store/portlandmaps/types';

export default Vue.extend({
  name: 'Streets',
  components: {
    AddressSuggest,
    AppMap,
    StreetComponent
  },
  computed: {
    ...mapState(['message']),
    ...mapState('streets', {
      streets: (state: any) => state.list
    })
  },
  methods: {
    highlightStreet(street: Street) {
      this.clearGraphics();

      const streetGraphic = new Graphic({
        geometry: new Polyline({
          paths: [street.geometry.coordinates],
          spatialReference: {
            wkid: 4326
          }
        }),
        symbol: new SimpleLineSymbol({
          color: '#bfe7eb',
          width: 8
        })
      });

      const outlineGraphic = new Graphic({
        geometry: new Polyline({
          paths: [street.geometry.coordinates],
          spatialReference: {
            wkid: 4326
          }
        }),
        symbol: new SimpleLineSymbol({
          color: '#00484e',
          width: 10
        })
      });

      this.addGraphic(outlineGraphic);
      this.addGraphic(streetGraphic);
      }
    },
    goToAddress(address: AddressCandidate) {
      this.setLocation(address.location);
    },
    ...mapActions('map', ['clearGraphics', 'addGraphic', 'setLocation']),
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
