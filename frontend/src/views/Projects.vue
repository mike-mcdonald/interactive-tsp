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

import { Project, ProjectState } from '../store/projects/types';
import { AddressCandidate } from '../store/portlandmaps/types';

export default Vue.extend({
  name: 'Streets',
  components: {
    AddressSuggest,
    AppMap
  },
  computed: {
    ...mapState(['message'])
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // select the projects layer
      vm.$store.dispatch('map/setLayerVisibility', { layerId: 'projects', visible: true });
    });
  },
  methods: {
    goToAddress(address: AddressCandidate) {
      this.setLocation(address.location);
    },
    ...mapActions('map', ['setLocation'])
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
