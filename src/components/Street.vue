<template>
  <article>
    <h1 class="mb-3 text-3xl lg:text-4xl">{{ street.name || 'Unnamed segment' }}</h1>
    <p class="my-3 text-2xl font-thin" v-if="street.block">{{ street.block }} block</p>
    <section>
      <dl>
        <div class="my-3 xl:grid xl:grid-cols-2 xl:gap-3">
          <dt class="font-semibold">Transportation plan ID:</dt>
          <dd>{{ street.id }}</dd>
        </div>
        <div
          v-for="(classification, index) in classificationKeys()"
          :key="index"
          class="my-3 xl:grid xl:grid-cols-2 xl:gap-3"
        >
          <dt class="font-semibold">
            {{ classification.charAt(0).toUpperCase() + classification.slice(1) }} classification:
          </dt>
          <dd>
            <router-link
              v-if="
                classification != 'greenscape' &&
                  classificationLabel(classification, street.classifications[classification]) != 'N/A'
              "
              :to="{
                name: 'text',
                hash: `#${classificationLabel(classification, street.classifications[classification])
                  .toLowerCase()
                  .split(' ')
                  .join('-')}`
              }"
              class="border-current border-b-2"
              >{{ classificationLabel(classification, street.classifications[classification]) }}</router-link
            >
            <span v-else>{{ classificationLabel(classification, street.classifications[classification]) }}</span>
          </dd>
        </div>
      </dl>
    </section>
    <transition name="fade">
      <section v-if="street.projects && street.projects.length > 0">
        <h2 class="mb-3 text-2xl lg:text-3xl">Projects near this street</h2>
        <ul class>
          <li v-for="project in street.projects" :key="project.id">
            <router-link
              :to="`/projects/${project.id}`"
              class="flex flex-col my-2 px-2 py-3 shadow border rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
            >
              <h3 class="mb-1">{{ project.name }}</h3>
              <p class="text-sm">{{ project.description }}</p>
              <div class="flex flex-row flex-wrap -mx-2 text-sm text-gray-600">
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
      </section>
    </transition>
  </article>
</template>
<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState, mapGetters } from 'vuex';

import { Street, StreetState } from '@/store/streets/types';

export default Vue.extend({
  name: 'Street',
  props: {
    street: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters('streets', ['classificationLabel', 'classificationColor'])
  },
  methods: {
    classificationKeys: function() {
      return this.street && this.street.classifications ? Object.keys(this.street.classifications) : [];
    }
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