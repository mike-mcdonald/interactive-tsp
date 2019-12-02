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
      <div class="m-2">
        <transition name="fade">
          <div v-if="!$route.params.id && projects">{{ projects.length }} projects found in view</div>
          <router-link v-if="$route.params.id" to="/projects" class="border-b-2 border-black"
            >Back to results</router-link
          >
        </transition>
      </div>
      <pager
        class="m-2"
        v-if="selectedProjects && selectedProjects.length > 1"
        :list="selectedProjects"
        @change="handleProjectChange"
      />
      <transition name="fade">
        <ul v-if="!$route.params.id" class="list-none">
          <li v-for="project in projects" :key="project.id" @mouseover="highlightProject(project)">
            <router-link
              :to="project.id"
              append
              class="flex flex-col m-2 px-2 py-3 shadow rounded bg-white hover:bg-blue-100"
              :class="{ 'border-t': index == 0 }"
            >
              <h3 class="mb-1">{{ project.name }}</h3>
              <p class="text-xs">{{ project.description }}</p>
              <div class="flex flex-row flex-wrap -mx-2 text-xs text-gray-600">
                <span class="mx-2 flex flex-row items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="w-3 h-3 mr-1"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <span>{{ project.estimatedCost.toLocaleString() }}</span>
                </span>
                <span class="mx-2 flex flex-row items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="w-3 h-3 mr-1"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>

                  <span>{{ project.estimatedTimeframe }}</span>
                </span>
              </div>
            </router-link>
          </li>
        </ul>
      </transition>
      <project-component v-if="selectedProject" :project="selectedProject"></project-component>
    </section>
    <section class="w-full md:w-2/3 h-screen-50 md:h-screen">
      <app-map :layers="layers" v-on:click="handleClick" v-on:extent-change="handleExtentChange"></app-map>
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
import Pager from '@/components/Pager.vue';

import { ProjectState, Project } from '../store/projects/types';
import { AddressCandidate } from '../store/portlandmaps/types';

export default Vue.extend({
  name: 'Projects',
  components: {
    AddressSuggest,
    AppMap,
    ProjectComponent,
    Pager
  },
  data() {
    return {
      selectedProjects: new Array<string>()
    };
  },
  computed: {
    ...mapState(['message']),
    ...mapState('map', ['view']),
    ...mapState('projects', {
      layers: (state: ProjectState) => state.layers,
      projects: (state: ProjectState) => state.list,
      selectedProject: (state: ProjectState) => (state.selected ? state.selected[0] : undefined)
    })
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // select the projects layer
      vm.$store.dispatch('map/setLayerVisibility', { layerId: 'projects-10', visible: true });
      vm.$store.dispatch('map/setLayerVisibility', { layerId: 'projects-20', visible: true });
      vm.$store.dispatch('map/setLayerVisibility', { layerId: 'projects-NA', visible: true });
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
    highlightProject(project: Project) {
      if (project.geometry) {
        this.highlightProjects({ projects: [project] });
      }
    },
    handleExtentChange(extent: __esri.Extent) {
      this.findProjects(extent);
    },
    handleProjectChange(id: string) {
      this.$router.push({ name: 'projects', params: { id } });
    },
    handleClick(event: __esri.MapViewClickEvent) {
      this.view.hitTest(event).then((response: __esri.HitTestResult) => {
        if (response.results.length) {
          this.selectedProjects = new Array<string>();
          response.results.forEach(result => {
            // push each id to the pagination component
            this.selectedProjects.push(result.graphic.attributes.TranPlanID);
          });
          // do something with the result graphic
          this.$router.push({ name: 'projects', params: { id: this.selectedProjects[0] } });
        }
      });
    },
    ...mapActions('map', ['setLocation']),
    ...mapActions('projects', ['findProjects', 'highlightProjects'])
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
