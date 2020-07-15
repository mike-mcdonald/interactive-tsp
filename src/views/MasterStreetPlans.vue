<template>
  <main class="flex flex-col-reverse sm:flex-row md:flex-col-reverse lg:flex-row">
    <h1 class="sr-only">Master street plans</h1>
    <section
      class="w-full sm:w-1/3 md:w-full lg:w-1/3 xl:w-1/4 h-full sm:h-screen md:h-full lg:h-(screen-16) overflow-y-auto border-t sm:border-t-0 md:border-t lg:border-t-0 sm:border-r md:border-r-0 lg:border-r border-black"
    >
      <section v-if="!$route.params.id" class="m-2">
        <header>
          <address-suggest v-on:candidate-select="goToAddress" />
        </header>
        <section id="filters" class="my-2 border border-gray-500 rounded shadow bg-gray-100 text-gray-900">
          <header :class="{ 'border-b': showFilters }">
            <button class="p-2 w-full flex items-center justify-between" @click="showFilters = !showFilters">
              <h2 class="flex items-center">
                <i v-html="feather.icons['settings'].toSvg({ class: 'w-5 h-5' })" />
                <span class="px-2">Settings</span>
              </h2>
              <i v-if="!showFilters" v-html="feather.icons['chevron-down'].toSvg({ class: 'w-5 h-5' })" />
              <i v-if="showFilters" v-html="feather.icons['chevron-up'].toSvg({ class: 'w-5 h-5' })" />
            </button>
          </header>
          <main v-show="showFilters" :aria-expanded="`${showFilters}`" class="p-2">
            <form class="grid grid-cols-1 gap-1" @submit.prevent>
              <div>
                <label class="flex items-center">
                  <input type="checkbox" id="filterExtent" v-model="filterExtent" />

                  <span class="px-2">Filter plans by map extent</span>
                </label>
              </div>
              <div class="my-2">
                <button
                  class="px-2 py-1 border border-blue-900 rounded-md bg-blue-500 text-blue-100 flex items-center"
                  @click="resetExtent"
                >
                  <i v-html="feather.icons['maximize-2'].toSvg({ class: 'w-5 h-5' })" />
                  <span class="pl-2">Reset map extent</span>
                </button>
              </div>
            </form>
          </main>
        </section>
        <ul class="list-none">
          <li v-for="plan in filteredPlans" :key="plan.id">
            <plan-listing :plan="plan" :show-type="false" />
          </li>
        </ul>
      </section>
      <section v-else class="m-2">
        <div>
          <router-link
            to="/master-street-plans"
            class="border-current border-b-2 transition ease-in-out duration-150 hover:text-blue-600 focus:text-blue-600"
            >Back to results</router-link
          >
        </div>
        <main v-if="selectedPlan">
          <plan-full :plan="selectedPlan" />
        </main>
      </section>
    </section>
    <section class="w-full h-screen-50 lg:h-(screen-16)">
      <app-map :layers="layers" v-on:click="handleClick" @pointer-hit="handlePointerHit">
        <template v-slot:top-right>
          <section v-if="selectedFeature" class="p-4 border-2 border-black rounded shadow bg-white">
            <div>{{ selectedFeature.type }}</div>
            <div v-if="selectedFeature.alignment" class="text-base text-gray-700">{{ selectedFeature.alignment }}</div>
          </section>
        </template>
      </app-map>
    </section>
  </main>
</template>
<script>
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex';

import bboxPolygon from '@turf/bbox-polygon';
import intersects from '@turf/boolean-intersects';
import { feature } from '@turf/helpers';
import feather from 'feather-icons';
import proj4 from 'proj4';

import AddressSuggest from '@/components/AddressSuggest.vue';
import AppMap from '@/components/Map.vue';
import PlanFull from '@/components/master_street_plans/Full.vue';
import PlanListing from '@/components/master_street_plans/List.vue';

export default {
  name: 'MasterStreetPlans',
  components: {
    AddressSuggest,
    AppMap,
    PlanFull,
    PlanListing
  },
  data() {
    return {
      showInfo: {},
      feather,
      showStreets: true,
      showFilters: true,
      filterExtent: true,
      selectedFeature: undefined
    };
  },
  computed: {
    ...mapState(['message']),
    ...mapState('map', ['extent', 'view']),
    ...mapState('portlandmaps', ['candidates']),
    ...mapState('masterStreetPlans', {
      plans: state => state.list,
      selectedPlan: state => state.selected
    }),
    ...mapGetters('masterStreetPlans', ['layers']),
    filteredPlans() {
      let plans = this.plans;

      if (this.filterExtent) {
        let { xmin, ymin, xmax, ymax } = this.extent;
        [xmin, ymin] = proj4(this.extent.spatialReference.wkid.toString(), 'EPSG:4326', [xmin, ymin]);
        [xmax, ymax] = proj4(this.extent.spatialReference.wkid.toString(), 'EPSG:4326', [xmax, ymax]);
        const bbox = [xmin, ymin, xmax, ymax];
        const polygon = bboxPolygon(bbox);
        plans = plans.reduce((prev, curr) => {
          if (intersects(polygon, feature(curr.geometry))) {
            prev.push(curr);
          }
          return prev;
        }, []);
      }

      return plans;
    }
  },
  methods: {
    ...mapMutations('masterStreetPlans', ['setSelected']),
    ...mapActions('map', ['setLocation', 'resetExtent']),
    ...mapActions('masterStreetPlans', ['findPlans', 'selectPlan', 'highlightPlan']),
    handleClick(event) {
      this.view.hitTest(event).then(response => {
        response.results.some(result => {
          const graphic = result.graphic;

          if (
            graphic.layer.id == 'plan-areas' &&
            graphic.attributes &&
            graphic.attributes.TranPlanID != this.$route.params.id
          ) {
            this.$router.push({
              name: 'master-street-plans',
              params: { id: graphic.attributes.TranPlanID }
            });
            return true;
          }

          return false;
        });
      });
    },
    handlePointerHit(results) {
      if (this.selectedPlan) {
        const features = results.reduce((acc, curr) => {
          if (curr && curr.graphic && curr.graphic.attributes && curr.graphic.attributes.Type) {
            acc.push({
              type: curr.graphic.attributes.Type,
              alignment: curr.graphic.attributes.Alignment
            });
          }
          return acc;
        }, []);

        this.selectedFeature = features.shift();
      }
    },
    goToAddress(address) {
      this.setLocation(address.location);
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$store.dispatch('masterStreetPlans/findPlans');

      if (to.params.id) {
        vm.$store.dispatch('masterStreetPlans/selectPlan', { id: to.params.id });
        vm.$store.dispatch('masterStreetPlans/highlightPlan', { plan: { id: to.params.id }, move: true });
      } else {
        vm.$store.dispatch('masterStreetPlans/unselectPlan');
      }
    });
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.id) {
      this.$store.dispatch('masterStreetPlans/selectPlan', { id: to.params.id });
      this.$store.dispatch('masterStreetPlans/highlightPlan', { plan: { id: to.params.id }, move: true });
    } else {
      this.$store.dispatch('masterStreetPlans/unselectPlan');
    }
    next();
  }
};
</script>
