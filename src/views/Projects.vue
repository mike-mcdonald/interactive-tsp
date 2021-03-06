<template>
  <main class="flex flex-col-reverse sm:flex-row md:flex-col-reverse lg:flex-row">
    <h1 class="sr-only">Project listings</h1>
    <section
      class="w-full sm:w-1/3 md:w-full lg:w-1/3 xl:w-1/4 h-full sm:h-screen md:h-full lg:h-(screen-16) overflow-y-auto border-t sm:border-t-0 md:border-t lg:border-t-0 sm:border-r md:border-r-0 lg:border-r border-black"
    >
      <section class="m-2">
        <div v-if="!$route.params.id">
          <header>
            <form class="text-base" @submit.prevent>
              <label for="searchInput" class="sr-only">Search</label>
              <div class="mt-1 relative rounded">
                <div class="absolute inset-y-0 left-0 px-2 flex items-center pointer-events-none">
                  <Search />
                </div>
                <input
                  id="searchInput"
                  name="searchInput"
                  type="search"
                  role="searchbox"
                  placeholder="Search projects..."
                  required="required"
                  class="appearance-none placeholder-gray-600 w-full px-3 pl-8 py-2 bg-gray-100 border border-gray-500 rounded shadow focus:outline-none focus:shadow-outline"
                  :value="searchText"
                  @input="handleSearchChange($event.target.value)"
                />
              </div>
            </form>
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
                <h3 class="my-2 text-gray-800 text-lg">Project settings</h3>
                <div v-for="model in dataset" :key="model.key">
                  <label class="flex items-center" :for="model.key">
                    <input
                      type="checkbox"
                      :id="model.key"
                      :checked="model.enabled"
                      @change="toggleTimeFrameFilter(model, $event.target.checked)"
                    />
                    <div
                      v-if="model.color"
                      class="h-4 w-4 px-2 mx-2 border border-gray-900"
                      :style="{
                        'background-color': model.color.formatRgb()
                      }"
                    ></div>
                    <span>{{ model.label }}</span>
                  </label>
                </div>
                <h3 class="my-2 text-gray-800 text-lg">Map extent settings</h3>
                <div>
                  <label class="flex items-center">
                    <input type="checkbox" id="filterExtent" v-model="filterExtent" />

                    <span class="px-2">Filter projects by map extent</span>
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
          <transition name="fade">
            <ul v-show="showProjects" class="list-none">
              <li v-for="project in filteredProjects" :key="`${project.id}-${project.number}`">
                <router-link
                  :to="project.id"
                  append
                  class="flex flex-col my-2 px-2 py-3 shadow border rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
                  @mouseover.native="highlightProject({ project })"
                  @focus.native="highlightProject({ project })"
                  @click.native="selectProject(project)"
                >
                  <h3>{{ project.name }}</h3>
                  <p class="my-2 text-sm">{{ project.description }}</p>
                  <div class="flex flex-row flex-wrap -mx-2 text-xs text-gray-600">
                    <span class="mx-2 flex flex-row items-center">
                      <i
                        v-html="
                          feather.icons['dollar-sign'].toSvg({
                            class: 'w-3 h-3 mr-1'
                          })
                        "
                      />
                      <span>{{ project.estimatedCost.toLocaleString() }}</span>
                    </span>
                    <span class="mx-2 flex flex-row items-center">
                      <i
                        v-html="
                          feather.icons.calendar.toSvg({
                            class: 'w-3 h-3 mr-1'
                          })
                        "
                      />
                      <span>{{ project.estimatedTimeframe }}</span>
                    </span>
                  </div>
                </router-link>
              </li>
            </ul>
          </transition>
        </div>
        <div v-else>
          <div>
            <router-link
              to="/projects"
              class="border-current border-b-2 transition ease-in-out duration-150 hover:text-blue-600 focus:text-blue-600"
              >Back to results</router-link
            >
          </div>
          <pager
            class="my-3"
            v-if="projectList && projectList.length > 1"
            v-model="projectIndex"
            :list="projectList"
            @next="handleProjectChange(projectIndex + 1)"
            @prev="handleProjectChange(projectIndex - 1)"
          />
          <pager
            class="my-3"
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
            class="my-3"
            v-if="selectedProjects && selectedProjects[selectionIndex]"
            :project="selectedProjects[selectionIndex]"
          ></project-component>
        </div>
      </section>
    </section>
    <section
      class="w-full sm:w-2/3 md:w-full lg:w-2/3 xl:w-3/4 h-screen-50 sm:h-screen md:h-screen-50 lg:h-(screen-16) overflow-y-auto"
    >
      <app-map :layers="mapLayers" v-on:click="handleClick" />
    </section>
  </main>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { RawLocation, Route } from 'vue-router';
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';

import intersects from '@turf/boolean-intersects';
import { BBox, feature } from '@turf/helpers';
import feather from 'feather-icons';

import { Extent } from 'esri/geometry';
import MapView from 'esri/views/MapView';

import AppMap from '@/components/Map.vue';
import Messages from '@/components/message/List.vue';
import ProjectComponent from '@/components/Project.vue';
import Pager from '@/components/Pager.vue';
import Search from '@/components/icons/Search.vue';

import { ProjectState, Project, ViewModel } from '../store/projects/types';
import bboxPolygon from '@turf/bbox-polygon';
import proj4 from 'proj4';

@Component({
  name: 'Projects',
  components: {
    AppMap,
    Messages,
    ProjectComponent,
    Pager,
    Search
  },
  data() {
    return { feather };
  },
  computed: {
    ...mapState(['message']),
    ...mapState('map', ['view', 'extent']),
    ...mapState('projects', {
      models: (state: ProjectState) => state.models,
      projects: (state: ProjectState) => state.list,
      index: (state: ProjectState) => state.index
    }),
    ...mapGetters('projects', ['mapLayers'])
  },
  methods: {
    ...mapActions('map', ['setLayerVisibility', 'resetExtent']),
    ...mapMutations('projects', ['setModels']),
    ...mapActions('projects', ['findProjects', 'highlightProject'])
  },
  beforeRouteEnter(to: Route, from: Route, next: (to?: RawLocation | false | ((vm: Vue) => void)) => void) {
    next(vm => {
      vm.$store.dispatch('clearMessages');

      // select the projects layer
      vm.$store.dispatch('map/setLayerVisibility', {
        layerId: 'projects-10',
        visible: true
      });
      vm.$store.dispatch('map/setLayerVisibility', {
        layerId: 'projects-20',
        visible: true
      });
      vm.$store.dispatch('map/setLayerVisibility', {
        layerId: 'projects-NA',
        visible: true
      });

      if (to.params.id) {
        vm.$store.dispatch('projects/highlightProject', {
          project: { id: to.params.id },
          move: true
        });
      } else {
        vm.$store.dispatch('projects/findProjects');
      }
    });
  },
  beforeRouteUpdate(to: Route, from: Route, next: (to?: RawLocation | false | ((vm: Vue) => void)) => void) {
    next();
  }
})
export default class Projects extends Vue {
  view!: MapView;
  extent!: Extent;
  models!: Array<ViewModel>;
  projects!: Array<Project>;
  index!: lunr.Index;

  setLayerVisibility!: (payload: { layerId: string; visible: boolean }) => void;
  setModels!: (models: Array<ViewModel>) => void;
  highlightProject!: (payload: { project: Project; move?: boolean }) => void;

  searchText = '';
  projectIndex = 0;
  selectionIndex = 0;
  show = {};
  showProjects = true;
  showFilters = true;
  filterExtent = false;
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
      projects = this.index.search(this.searchText).map((val: lunr.Index.Result) => {
        return (
          this.projects.find((proj: Project) => {
            return proj.id == val.ref;
          }) || { id: val.ref }
        );
      });
    }

    if (this.filterExtent) {
      let { xmin, ymin, xmax, ymax } = this.extent;
      [xmin, ymin] = proj4(this.extent.spatialReference.wkid.toString(), 'EPSG:4326', [xmin, ymin]);
      [xmax, ymax] = proj4(this.extent.spatialReference.wkid.toString(), 'EPSG:4326', [xmax, ymax]);
      const bbox: BBox = [xmin, ymin, xmax, ymax];
      const polygon = bboxPolygon(bbox);
      projects = projects.reduce((prev: Array<Project>, curr: Project) => {
        if (intersects(polygon, feature(curr.geometry))) {
          prev.push(curr);
        }
        return prev;
      }, new Array<Project>());
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
    this.view.hitTest(event).then((response: __esri.HitTestResult) => {
      if (response.results.length) {
        this.selectionIndex = this.projectIndex = 0;
        const projects = response.results.reduce((prev, curr) => {
          // push each id to the pagination component
          const graphic = curr.graphic;

          if (!graphic.attributes) return prev;

          if (Object.keys(graphic.attributes).find(key => key === 'TranPlanID')) {
            prev.add(curr.graphic.attributes.TranPlanID);
          }

          return prev;
        }, new Set<string>());
        this.projectList = Array.from(projects);
        this.$router.push({
          name: 'projects',
          params: { id: this.projectList[0] }
        });
        this.handleSelectionChange(this.selectionIndex);
      }
    });
  }
}
</script>
