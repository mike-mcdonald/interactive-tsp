<template>
  <main class="flex flex-col-reverse">
    <section class="flex flex-col md:flex-row container mx-auto h-screen-50 overflow-y-auto">
      <div id="filters" class="w-full md:w-1/3 p-2">
        <form class="flex flex-col m-2" @submit.prevent="">
          <div v-for="model in dataset" :key="model.key">
            <label class="block mb-1 font-semibold" :for="model.key">
              <input
                type="checkbox"
                :id="model.key"
                :checked="model.enabled"
                @change="toggleTimeFrameFilter(model, $event.target.checked)"
              />
              {{ model.label }}
            </label>
            <transition name="fade">
              <section v-if="model.enabled" class="relative">
                <div ref="chart" class="flex flex-row border border-black shadow-inner">
                  <span
                    class="h-4 transition duration-300 ease-in-out"
                    :style="{
                      'background-color': model.color.formatRgb(),
                      width: `${(model.count / total) * 100}%`
                    }"
                    @mouseenter="show[model.key] = true"
                    @mouseleave="show[model.key] = false"
                    @touchenter="show[model.key] = true"
                    @touchleave="show[model.key] = false"
                  ></span>
                </div>
                <transition name="fade">
                  <div
                    v-if="show[model.key]"
                    class="absolute z-50 inset-x-0 top-0 mt-6 p-2 bg-fog-200 border border-fog-900 rounded"
                  >
                    {{ model.label }}: {{ model.count }} / {{ total }}
                  </div>
                </transition>
              </section>
            </transition>
          </div>
        </form>
      </div>
      <div class="w-full md:w-2/3 p-2">
        <transition name="fade">
          <div
            v-if="message"
            class="mb-2 px-2 py-3 w-full border-l-8 border-tangerine-800 bg-tangerine-300 text-tangerine-900"
          >
            {{ message }}
          </div>
        </transition>
        <div v-if="!$route.params.id" class="mx-2">
          <label for="searchInput" class="sr-only">Search</label>
          <input
            id="searchInput"
            name="searchInput"
            type="search"
            role="searchbox"
            placeholder="Search projects..."
            required="required"
            class="w-full px-3 py-2 bg-fog-200 border rounded"
            :value="searchText"
            @input="handleSearchChange($event.target.value)"
          />
        </div>
        <div class="m-2">
          <transition name="fade">
            <div v-if="!$route.params.id && filteredProjects">{{ filteredProjects.length }} projects</div>
            <router-link v-if="$route.params.id" to="/projects" class="border-b-2 border-black"
              >Back to results</router-link
            >
          </transition>
        </div>
        <pager
          class="m-2"
          v-if="$route.params.id && selectedProjects && selectedProjects.length > 1"
          v-model="pageIndex"
          :list="selectedProjects"
          @next="handleProjectChange(pageIndex + 1)"
          @prev="handleProjectChange(pageIndex - 1)"
        />
        <transition name="fade">
          <ul v-if="!$route.params.id" class="list-none">
            <li v-for="project in filteredProjects" :key="`${project.id}-${project.name}`">
              <router-link
                :to="project.id"
                append
                class="flex flex-col m-2 px-2 py-3 shadow border rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
                @mouseover.native="highlightProject(project)"
                @focus.native="highlightProject(project)"
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
        <project-component v-if="$route.params.id && selectedProject" :project="selectedProject"></project-component>
      </div>
    </section>
    <section class="w-full h-screen-50 border-b border-black">
      <app-map :layers="mapLayers" v-on:click="handleClick"> </app-map>
    </section>
  </main>
</template>
<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';

import * as d3 from 'd3';
import _ from 'lodash';
import proj4 from 'proj4';
import { BBox } from '@turf/helpers';

import { Extent } from 'esri/geometry';

import AppMap from '@/components/Map.vue';
import ProjectComponent from '@/components/Project.vue';
import Pager from '@/components/Pager.vue';

import { ProjectState, Project, ViewModel } from '../store/projects/types';
import { AddressCandidate } from '../store/portlandmaps/types';

export default Vue.extend({
  name: 'Projects',
  components: {
    AppMap,
    ProjectComponent,
    Pager
  },
  data() {
    return {
      searchText: undefined,
      selectedProjects: new Array<string>(),
      pageIndex: 0,
      show: {}
    };
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // select the projects layer
      vm.$store.dispatch('map/setLayerVisibility', { layerId: 'projects-10', visible: true });
      vm.$store.dispatch('map/setLayerVisibility', { layerId: 'projects-20', visible: true });
      vm.$store.dispatch('map/setLayerVisibility', { layerId: 'projects-NA', visible: true });
      vm.$store.dispatch('projects/findProjects');
      if (to.params.id) {
        vm.$store.dispatch('projects/selectProjects', { id: to.params.id });
      }
    });
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.id) {
      this.$store.dispatch('projects/selectProjects', { id: to.params.id });
    } else {
      this.selectedProjects = new Array<string>();
    }
    next();
  },
  computed: {
    ...mapState(['message']),
    ...mapState('map', ['view']),
    ...mapState('projects', {
      models: (state: ProjectState) => state.models,
      projects: (state: ProjectState) => state.list,
      index: (state: ProjectState) => state.index,
      selectedProject: (state: ProjectState) => (state.selected ? state.selected[0] : undefined)
    }),
    ...mapGetters('projects', ['mapLayers']),
    total() {
      return this.models.reduce((prev: number, curr: ViewModel) => {
        return prev + (curr.enabled ? curr.count : 0);
      }, 0);
    },
    filteredProjects() {
      const enabledTimeframes = this.models.reduce((prev: Map<string, boolean>, curr: ViewModel) => {
        if (curr.enabled) {
          prev.set(curr.value, curr.enabled);
        }
        return prev;
      }, new Map<string, boolean>());

      let projects = this.projects;

      if (this.searchText && this.searchText.length > 0) {
        projects = this.index.search(this.searchText).map((val: any) => {
          return (
            this.projects.find((proj: Project) => {
              return proj.id == val.ref;
            }) || { id: val.ref }
          );
        });
      }

      return projects.reduce((prev: Array<Project>, curr: Project) => {
        if (curr.estimatedTimeframe && enabledTimeframes.has(curr.estimatedTimeframe)) {
          prev.push(curr);
        }
        return prev;
      }, new Array<Project>());
    },
    dataset() {
      return this.models.map((model: ViewModel) => {
        model.count = this.filteredProjects.reduce((prev: number, curr: Project) => {
          if (curr.estimatedTimeframe == model.value) {
            prev = prev + 1;
          }
          return prev;
        }, 0);
        return model;
      });
    }
  },
  methods: {
    ...mapActions('map', ['setLayerVisibility']),
    ...mapMutations('projects', ['setModels', 'addTimeframe', 'removeTimeframe']),
    ...mapActions('projects', ['findProjects', 'filterProjects', 'highlightProjects']),
    toggleTimeFrameFilter(model: ViewModel, value: boolean) {
      this.setModels(
        this.models.reduce((prev: Array<ViewModel>, curr: ViewModel) => {
          if (curr.key === model.key) {
            curr.enabled = value;
            curr.mapLayer.visible = value;
            this.setLayerVisibility({ layerId: curr.key, visible: value });
          }
          return prev;
        }, this.models)
      );
    },
    highlightProject(project: Project) {
      if (project.geometry) {
        this.highlightProjects({ projects: [project] });
      }
    },
    handleSearchChange(value: string) {
      this.searchText = value;
    },
    handleProjectChange(index: number) {
      this.pageIndex = index;
      this.$router.push({ name: 'projects', params: { id: this.selectedProjects[index] } });
    },
    handleClick(event: __esri.MapViewClickEvent) {
      this.pageIndex = 0;
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
    }
  },
  mounted() {
    this.show = this.models.reduce((prev, curr) => {
      prev[curr.key] = false;
      return prev;
    }, {});
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
