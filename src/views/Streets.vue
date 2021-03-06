<template>
  <main class="flex flex-col-reverse sm:flex-row md:flex-col-reverse lg:flex-row">
    <h1 class="sr-only">Street listings</h1>
    <section
      class="w-full sm:w-1/3 md:w-full lg:w-1/3 xl:w-1/4 h-full sm:h-screen md:h-full lg:h-(screen-16) overflow-y-auto border-t sm:border-t-0 md:border-t lg:border-t-0 sm:border-r md:border-r-0 lg:border-r border-black"
    >
      <section v-if="!$route.params.id" class="m-2">
        <address-suggest v-on:candidate-select="goToAddress" />
        <section id="filters" class="my-2 border border-gray-500 rounded shadow bg-gray-100 text-gray-900">
          <header
            class="border-gray-500"
            :class="{
              'border-b': showFilters
            }"
          >
            <button
              class="p-2 w-full flex items-center justify-between focus:outline-none focus:shadow-outline"
              @click="showFilters = !showFilters"
            >
              <h2 class="flex items-center">
                <i v-html="feather.icons['settings'].toSvg({ class: 'w-5 h-5' })" />
                <span class="px-2">Settings</span>
              </h2>
              <i v-if="!showFilters" v-html="feather.icons['chevron-down'].toSvg({ class: 'w-5 h-5' })" />
              <i v-if="showFilters" v-html="feather.icons['chevron-up'].toSvg({ class: 'w-5 h-5' })" />
            </button>
          </header>
          <main v-show="showFilters" :aria-expanded="showFilters" class="p-2">
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
        <section class="my-2">
          <message
            v-if="streets.length > 0 && enabledModels.size == 0"
            :item="{
              type: 'warning',
              text: 'Enable one or more classifications in the settings to display streets...'
            }"
          />
        </section>
        <div v-if="filteredStreets.length > 0">
          <ul class="list-none">
            <li v-for="street in filteredStreets" :key="street.uuid" class="my-2">
              <router-link
                :to="street.id"
                append
                @mouseover.native="highlightStreet({ street, move: false })"
                @focus.native="highlightStreet({ street, move: false })"
                class="flex-shrink flex flex-col h-full px-2 py-3 shadow border rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
              >
                <div>{{ street.name.trim() || 'Unnamed segment' }}</div>
                <div v-if="street.block" class="text-base text-gray-700">{{ street.block }} block</div>
                <div class="flex flex-row flex-wrap -mx-1 text-sm text-gray-600">
                  <span
                    v-for="c in filteredClassifications(street.classifications)"
                    :key="`${c.group}-${c.value}`"
                    class="flex flex-row flex-wrap items-center mx-1"
                  >
                    <span
                      class="h-2 w-2 p-1 mr-1 border border-gray-900"
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
      </section>
      <transition name="fade">
        <div class="m-2" v-if="$route.params.id && selectedStreets">
          <header>
            <router-link
              to="/streets"
              class="border-current border-b-2 transition ease-in-out duration-150 hover:text-blue-600 focus:text-blue-600"
              >Back to results</router-link
            >
          </header>
          <pager
            class="my-3"
            v-if="selectedStreets && selectedStreets.length > 1"
            v-model="selectionIndex"
            :list="
              selectedStreets.reduce((prev, curr) => {
                prev.push(curr.id);
                return prev;
              }, [])
            "
            @next="handleSelectionChange(selectionIndex + 1)"
            @prev="handleSelectionChange(selectionIndex - 1)"
          />
          <street-component v-if="selectedStreet" :street="selectedStreet" />
        </div>
      </transition>
    </section>
    <section
      class="w-full sm:w-2/3 md:w-full lg:w-2/3 xl:w-3/4 h-screen-50 sm:h-screen md:h-screen-50 lg:h-(screen-16) overflow-y-auto"
    >
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
<script>
import { mapState, mapActions, mapGetters } from 'vuex';

import feather from 'feather-icons';

import AddressSuggest from '@/components/AddressSuggest.vue';
import AppMap from '@/components/Map.vue';
import Classification from '@/components/streets/Classification.vue';
import Message from '@/components/message/Full.vue';
import Pager from '@/components/Pager.vue';
import StreetComponent from '@/components/Street.vue';

export default {
  name: 'Streets',
  components: {
    AddressSuggest,
    AppMap,
    Classification,
    Message,
    Pager,
    StreetComponent
  },
  data() {
    return {
      showInfo: {},
      feather,
      showStreets: true,
      showFilters: true,
      selectionIndex: 0
    };
  },
  computed: {
    ...mapState(['message']),
    ...mapState('map', ['view']),
    ...mapState('portlandmaps', ['candidates']),
    ...mapState('streets', {
      streets: state => state.list,
      selectedStreets: state => state.selected,
      models: state => state.models
    }),
    ...mapGetters('streets', ['classificationLabel', 'classificationColor']),
    controllableModelGroups() {
      return this.models.reduce((prev, curr) => {
        if (curr.group != 'greenscape') prev.add(curr.group);
        return prev;
      }, new Set());
    },
    enabledModels() {
      return Array.from(this.models).reduce((prev, curr) => {
        if (curr.enabled) prev.add(curr);
        return prev;
      }, new Set());
    },
    filteredStreets() {
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
      }, []);
    },
    selectedStreet() {
      return this.selectedStreets[this.selectionIndex];
    }
  },
  methods: {
    ...mapActions('map', ['setLocation']),
    ...mapActions('streets', ['findStreets', 'highlightStreet']),
    handleClick(event) {
      this.view.hitTest(event).then(response => {
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
    },
    goToAddress(address) {
      this.setLocation(address.location);
    },
    handleExtentChange(extent) {
      if (!this.$route.params.id) {
        this.findStreets(extent);
      }
    },
    handleSelectionChange(index) {
      this.selectionIndex = index;
      this.highlightStreet({ street: this.selectedStreets[this.selectionIndex], move: true });
    },
    filteredClassifications(classifications) {
      return Array.from(
        Array.from(this.enabledModels).reduce((prev, curr) => {
          prev.add(curr);
          return prev;
        }, new Set())
      ).reduce((prev, curr) => {
        if (classifications[curr.group] === curr.value) {
          prev.add({ group: curr.group, value: classifications[curr.group] });
        }
        return prev;
      }, new Set());
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$store.dispatch('clearMessages');
      // access to component instance via `vm`
      if (to.params.id) {
        vm.$store.dispatch('text/findText');
        vm.$store.dispatch('streets/selectStreet', { id: to.params.id });
      } else {
        vm.$store.dispatch('streets/findStreets', vm.$store.state.map.extent);
      }
    });
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.id) {
      this.selectionIndex = 0;
      this.$store.dispatch('streets/selectStreet', { id: to.params.id });
    } else {
      this.$store.dispatch('streets/findStreets', this.$store.state.map.extent);
    }
    next();
  }
};
</script>
