<template>
  <main class="flex flex-col-reverse sm:flex-row md:flex-col-reverse lg:flex-row">
    <h1 class="sr-only">Area plans</h1>
    <section
      class="w-full sm:w-1/3 md:w-full lg:w-1/3 xl:w-1/4 h-full sm:h-screen md:h-full lg:h-(screen-16) overflow-y-auto border-t sm:border-t-0 md:border-t lg:border-t-0 sm:border-r md:border-r-0 lg:border-r border-black"
    >
      <section v-if="!$route.params.slug" class="m-2">
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
          <li v-for="plan in filteredPlans" :key="plan.slug">
            <plan-listing :plan="plan">
              <template v-slot>
                <h3 class="text-lg">{{ plan.name }}</h3>
              </template>
            </plan-listing>
          </li>
        </ul>
      </section>
      <section v-else class="m-2">
        <div>
          <router-link
            to="/area_plans"
            class="border-current border-b-2 transition ease-in-out duration-150 hover:text-blue-600 focus:text-blue-600"
            >Back to results</router-link
          >
        </div>
        <pager
          class="my-3"
          v-if="plansList && plansList.length > 1"
          v-model="selectionIndex"
          :list="plansList"
          @next="handlePlanChange(selectionIndex + 1)"
          @prev="handlePlanChange(selectionIndex - 1)"
        />
        <main v-if="selectedPlan">
          <plan-full :plan="selectedPlan" />
        </main>
      </section>
    </section>
    <section class="w-full h-screen-50 lg:h-(screen-16)">
      <app-map :layers="layers" v-on:click="handleClick" />
    </section>
  </main>
</template>
<script>
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex';

import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import intersects from '@turf/boolean-intersects';
import { feature } from '@turf/helpers';
import feather from 'feather-icons';
import proj4 from 'proj4';

import AddressSuggest from '@/components/AddressSuggest.vue';
import AppMap from '@/components/Map.vue';
import Pager from '@/components/Pager.vue';
import PlanFull from '@/components/area_plans/Full.vue';
import PlanListing from '@/components/area_plans/List.vue';
import { hash } from '@/store/utils';

export default {
  name: 'AreaPlans',
  components: {
    AddressSuggest,
    AppMap,
    Pager,
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
      plansList: [],
      selectionIndex: 0
    };
  },
  computed: {
    ...mapState(['message']),
    ...mapState('map', ['extent', 'view']),
    ...mapState('portlandmaps', ['candidates']),
    ...mapState('areaPlans', {
      layers: state => state.layers,
      plans: state => state.list,
      selectedPlan: state => state.selected
    }),
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
        }, new Array());
      }

      return plans;
    }
  },
  methods: {
    ...mapMutations('masterStreetPlans', ['setSelected']),
    ...mapActions('map', ['setLocation', 'resetExtent']),
    ...mapActions('masterStreetPlans', ['findPlans', 'selectPlan', 'highlightPlan']),
    handlePlanChange(index) {
      this.selectionIndex = index;

      this.$router.push({
        name: 'area-plans',
        params: { slug: this.plansList[this.selectionIndex] }
      });
    },
    handleClick(event) {
      this.view.hitTest(event).then(response => {
        const plans = response.results.reduce((prev, curr) => {
          // push each id to the pagination component
          const graphic = curr.graphic;

          if (!graphic.attributes) return prev;

          prev.add(`${graphic.attributes.OBJECTID}-${hash(graphic.attributes.Project_Name)}`);

          return prev;
        }, new Set());

        this.plansList = Array.from(plans);

        this.selectionIndex = 0;

        this.$router.push({
          name: 'area-plans',
          params: { slug: this.plansList[0] }
        });
      });
    },
    goToAddress(address) {
      this.setLocation(address.location);
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$store.dispatch('areaPlans/findPlans');

      if (to.params.slug) {
        vm.$store.dispatch('areaPlans/selectPlan', { slug: to.params.slug });
        vm.$store.dispatch('areaPlans/highlightPlan', { plan: { slug: to.params.slug }, move: true });
      } else {
        vm.$store.dispatch('areaPlans/unselectPlan');
      }
    });
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.slug) {
      this.$store.dispatch('areaPlans/selectPlan', { slug: to.params.slug });
      this.$store.dispatch('areaPlans/highlightPlan', { plan: { slug: to.params.slug }, move: true });
    } else {
      this.$store.dispatch('areaPlans/unselectPlan');
    }
    next();
  }
};
</script>
