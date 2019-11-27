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
      <project-component v-if="selectedProject" :project="selectedProject"></project-component>
    </section>
    <section class="w-full md:w-2/3 h-screen-50 md:h-screen">
      <app-map v-on:click="handleClick"></app-map>
    </section>
  </main>
</template>
<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions } from 'vuex';

import proj4 from 'proj4';
import { BBox } from '@turf/helpers';

import { Extent } from 'esri/geometry';

import AddressSuggest from 'portland-pattern-lab/source/_patterns/04-organisms/address-search/AddressSuggest.vue';

import AppMap from '@/components/Map.vue';
import ProjectComponent from '@/components/Project.vue';

import { ProjectState } from '../store/projects/types';
import { AddressCandidate } from '../store/portlandmaps/types';

export default Vue.extend({
  name: 'Streets',
  components: {
    AddressSuggest,
    AppMap,
    ProjectComponent
  },
  computed: {
    ...mapState(['message']),
    ...mapState('projects', {
      selectedProject: (state: ProjectState) => (state.selected ? state.selected[0] : undefined)
    })
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // select the projects layer
      vm.$store.dispatch('map/setLayerVisibility', { layerId: 'projects', visible: true });
      if (to.params.id) {
        vm.$store.dispatch('projects/selectProjectById', to.params.id);
      }
    });
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.id) {
      this.$store.dispatch('projects/selectProjectById', to.params.id);
    }
    next();
  },
  methods: {
    goToAddress(address: AddressCandidate) {
      this.setLocation(address.location);
    },
    handleClick(point: __esri.Point) {
      // width of map in map units
      var mapWidth = this.view.extent.width;

      //Divide width in map units by width in pixels
      var pixelWidth = mapWidth / this.view.width;

      //Calculate a 20 pixel envelope width (10 pixel tolerance on each side)
      var tolerance = 20 * pixelWidth;

      //Build tolerance envelope and set it as the query geometry
      var queryExtent = new Extent({
        spatialReference: point.spatialReference,
        xmin: 1,
        xmax: tolerance,
        ymin: 1,
        ymax: tolerance
      });

      // this changes the extent to one that has the same dimensions, but around the target, where the user clicked
      queryExtent.centerAt(point);

      // all our geometries are retrieved, and thus stored, in 4326
      let bbox: BBox = [0, 0, 0, 0];
      [bbox[0], bbox[1]] = proj4(point.spatialReference.wkid.toString(), 'EPSG:4326', [
        queryExtent.xmin,
        queryExtent.ymin
      ]);
      [bbox[2], bbox[3]] = proj4(point.spatialReference.wkid.toString(), 'EPSG:4326', [
        queryExtent.xmax,
        queryExtent.ymax
      ]);

      // find the nearest street to select it
      this.routeProjectsByRTree(bbox);
    },
    ...mapActions('map', ['setLocation']),
    ...mapActions('projects', ['routeProjectsByRTree'])
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
