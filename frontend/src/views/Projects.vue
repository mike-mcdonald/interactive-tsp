<template>
  <section class="w-full h-screen">
    <app-map :layers="mapLayers" v-on:click="handleClick">
      <template v-slot:manual>
        <main class="px-2 py-4 w-full h-full flex flex-col-reverse justify-between md:flex-row pointer-events-none">
          <section class="w-full md:w-1/3 h-64 md:h-full flex items-end md:items-start">
            <div
              v-if="!$route.params.id"
              class="w-full bg-white border border-fog-900 rounded-sm shadow max-h-full overflow-y-auto pointer-events-auto"
            >
              <header class="bg-fog-100 border-b border-fog-500 sticky top-0">
                <transition name="fade">
                  <div
                    v-if="message"
                    class="mb-2 px-2 py-3 w-full border-l-8 border-tangerine-800 bg-tangerine-300 text-tangerine-900"
                  >
                    {{ message }}
                  </div>
                </transition>
                <form class="p-2" @submit.prevent>
                  <label for="searchInput" class="sr-only">Search</label>
                  <input
                    id="searchInput"
                    name="searchInput"
                    type="search"
                    role="searchbox"
                    placeholder="Search projects..."
                    required="required"
                    class="w-full px-3 py-2 bg-fog-200 border rounded-sm"
                    :value="searchText"
                    @input="handleSearchChange($event.target.value)"
                  />
                </form>
                <transition name="fade">
                  <div v-if="filteredProjects" class="p-2 flex items-center justify-between">
                    <span>{{ filteredProjects.length }} projects</span>
                    <button
                      v-if="filteredProjects.length > 0"
                      class="px-2 py-1 text-sm"
                      @click="showProjects = !showProjects"
                    >
                      <i v-if="!showProjects" v-html="feather.icons['chevron-down'].toSvg({ class: 'w-5 h-5' })" />
                      <i v-if="showProjects" v-html="feather.icons['chevron-up'].toSvg({ class: 'w-5 h-5' })" />
                    </button>
                  </div>
                </transition>
              </header>
              <transition name="fade">
                <ul v-show="showProjects" class="px-2 list-none">
                  <li v-for="project in filteredProjects" :key="`${project.id}-${project.number}`">
                    <router-link
                      :to="project.id"
                      append
                      class="flex flex-col my-2 px-2 py-3 shadow border rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
                      @mouseover.native="highlightProject({ project })"
                      @focus.native="highlightProject({ project })"
                      @click.native="selectProject(project)"
                    >
                      <h3 class="mb-1">{{ project.name }}</h3>
                      <p class="text-xs">{{ project.description }}</p>
                      <div class="flex flex-row flex-wrap -mx-2 text-xs text-gray-600">
                        <span class="mx-2 flex flex-row items-center">
                          <i v-html="feather.icons['dollar-sign'].toSvg({ class: 'w-3 h-3 mr-1' })" />
                          <span>{{ project.estimatedCost.toLocaleString() }}</span>
                        </span>
                        <span class="mx-2 flex flex-row items-center">
                          <i v-html="feather.icons.calendar.toSvg({ class: 'w-3 h-3 mr-1' })" />
                          <span>{{ project.estimatedTimeframe }}</span>
                        </span>
                      </div>
                    </router-link>
                  </li>
                </ul>
              </transition>
            </div>
            <div
              v-else
              class="w-full p-2 bg-white border border-fog-900 rounded-sm shadow max-h-full overflow-y-auto pointer-events-auto"
            >
              <div>
                <router-link to="/projects" class="border-b-2 border-black">Back to results</router-link>
              </div>
              <pager
                class="my-2"
                v-if="projectList && projectList.length > 1"
                v-model="projectIndex"
                :list="projectList"
                @next="handleProjectChange(projectIndex + 1)"
                @prev="handleProjectChange(projectIndex - 1)"
              />
              <pager
                class="my-2"
                v-if="selectedProjects && selectedProjects.length > 1"
                v-model="selectionIndex"
                :list="
                  selectedProjects.reduce((prev, curr) => {
                    prev.push(curr.id);
                    return prev;
                  }, [])
                "
                @next="handleSelectionChange(selectionIndex + 1)"
                @prev="handleSelectionChange(selectionIndex - 1)"
              />
              <project-component
                class="my-2"
                v-if="selectedProjects && selectedProjects[selectionIndex]"
                :project="selectedProjects[selectionIndex]"
              ></project-component>
            </div>
          </section>

          <section id="filters" class="w-full md:w-1/3 h-64 md:h-full">
            <div
              class="bg-white border border-fog-900 rounded-sm shadow max-h-full overflow-y-auto pointer-events-auto"
            >
              <header class="p-2 flex items-center justify-between bg-fog-100 border-b border-fog-500">
                <h2>Map settings</h2>
                <button class="px-2 py-1 text-sm" @click="showFilters = !showFilters">
                  <i v-if="!showFilters" v-html="feather.icons['chevron-down'].toSvg({ class: 'w-5 h-5' })" />
                  <i v-if="showFilters" v-html="feather.icons['chevron-up'].toSvg({ class: 'w-5 h-5' })" />
                </button>
              </header>
              <main v-show="showFilters" class="p-2">
                <form @submit.prevent>
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
                          ></span>
                        </div>
                      </section>
                    </transition>
                  </div>
                </form>
              </main>
            </div>
          </section>
        </main>
      </template>
    </app-map>
  </section>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { RawLocation, Route } from 'vue-router';
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';

import { BBox } from '@turf/helpers';
import feather from 'feather-icons';

import { Extent } from 'esri/geometry';
import MapView from 'esri/views/MapView';

import AppMap from '@/components/Map.vue';
import ProjectComponent from '@/components/Project.vue';
import Pager from '@/components/Pager.vue';

import { ProjectState, Project, ViewModel } from '../store/projects/types';
import { AddressCandidate } from '../store/portlandmaps/types';

@Component({
  name: 'Projects',
  components: {
    AppMap,
    ProjectComponent,
    Pager
  },
  data() {
    return { feather };
  },
  computed: {
    ...mapState(['message']),
    ...mapState('map', ['view']),
    ...mapState('projects', {
      models: (state: ProjectState) => state.models,
      projects: (state: ProjectState) => state.list,
      index: (state: ProjectState) => state.index
    }),
    ...mapGetters('projects', ['mapLayers'])
  },
  methods: {
    ...mapActions('map', ['setLayerVisibility']),
    ...mapMutations('projects', ['setModels']),
    ...mapActions('projects', ['findProjects', 'selectProjects', 'highlightProject'])
  },
  beforeRouteEnter(to: Route, from: Route, next: (to?: RawLocation | false | ((vm: Vue) => void)) => void) {
    next(vm => {
      // select the projects layer
      vm.$store.dispatch('map/setLayerVisibility', { layerId: 'projects-10', visible: true });
      vm.$store.dispatch('map/setLayerVisibility', { layerId: 'projects-20', visible: true });
      vm.$store.dispatch('map/setLayerVisibility', { layerId: 'projects-NA', visible: true });
      vm.$store.dispatch('projects/findProjects');
    });
  }
})
export default class Projects extends Vue {
  view!: MapView;
  models!: Array<ViewModel>;
  projects!: Array<Project>;
  index!: lunr.Index;

  setLayerVisibility!: (payload: { layerId: string; visible: boolean }) => void;
  setModels!: (models: Array<ViewModel>) => void;
  selectProjects!: (projects: Array<Project>) => void;
  highlightProject!: (payload: { project: Project; move?: boolean }) => void;

  searchText = '';
  projectIndex = 0;
  selectionIndex = 0;
  show = {};
  showProjects = true;
  showFilters = true;
  // this represents a list of projects that someone got to through clicking on the map
  //    it functions as a list of routes to traverse
  projectList = new Array<string>();

  get total() {
    return this.models.reduce((prev: number, curr: ViewModel) => {
      return prev + (curr.enabled ? curr.count : 0);
    }, 0);
  }

  get filteredProjects() {
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
  }

  get selectedProjects() {
    return this.projects.reduce((prev: Array<Project>, curr: Project) => {
      if (curr.id == this.$route.params.id) {
        prev.push(curr);
      }
      return prev;
    }, new Array<Project>());
  }

  get dataset() {
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
  }

  selectProject(project: Project) {
    this.projectList = new Array<string>();
    this.selectionIndex = 0;
    this.highlightProject({ project, move: true });
  }

  handleSearchChange(value: string) {
    this.searchText = value;
  }

  handleProjectChange(index: number) {
    this.projectIndex = index;
    this.selectionIndex = 0;

    const id = this.projectList[this.projectIndex];
    if (id != this.$router.currentRoute.params.id) {
      this.$router.push({ name: 'projects', params: { id } });
    }

    this.handleSelectionChange(this.selectionIndex);
  }

  handleSelectionChange(index: number) {
    this.selectionIndex = index;

    const project = this.selectedProjects[this.selectionIndex];
    this.highlightProject({ project, move: true });
  }

  handleClick(event: __esri.MapViewClickEvent) {
    this.selectionIndex = this.projectIndex = 0;
    this.view.hitTest(event).then((response: __esri.HitTestResult) => {
      if (response.results.length) {
        const projects = response.results.reduce((prev, curr) => {
          // push each id to the pagination component
          prev.add(curr.graphic.attributes.TranPlanID);
          return prev;
        }, new Set<any>());
        this.projectList = Array.from(projects);
        // do something with the result graphic
        this.$router.push({ name: 'projects', params: { id: this.projectList[0] } });
        this.handleSelectionChange(this.selectionIndex);
      }
    });
  }
}
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
