<template>
  <article>
    <h1 class="mb-3 text-3xl">{{ plan.name }}</h1>
    <section class="text-xl text-gray-800">{{ plan.description }}</section>
    <dl>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 my-3">
        <dt class="text-gray-700">Documentation</dt>
        <dd>
          <a :href="plan.document" target="_blank" class="border-b-2 border-current">
            {{ plan.document }}
          </a>
        </dd>
      </div>
    </dl>
    <h2 class="mb-3 text-2xl">Features of the plan</h2>
    <ul v-if="plan.features.length > 0" class="list-none">
      <li v-for="feature in plan.features" :key="feature.id" class="my-2 flex items-center justify-between">
        <toggle :id="feature.id" :value="feature.enabled" @changed="toggleFeature(feature, $event)" class="mr-2" />
        <label :id="`${feature.id}-label`" class="flex-1 pr-2">{{ feature.type }} {{ feature.alignment }}</label>
        <span class="px-2 py-1 bg-blue-500 text-white text-sm rounded-md">{{ feature.count }}</span>
      </li>
    </ul>
    <span v-else class="italic">No features in this plan</span>
  </article>
</template>

<script>
import { mapActions } from 'vuex';

import Toggle from '@/components/Toggle.vue';

export default {
  name: 'MasterStreetPlan',
  components: {
    Toggle
  },
  props: {
    plan: {
      type: Object,
      required: true
    }
  },
  methods: {
    ...mapActions('map', ['setLayerVisibility']),
    ...mapActions('masterStreetPlans', ['highlightFeatures']),
    toggleFeature(feature, enabled) {
      feature.enabled = enabled;
      this.setLayerVisibility({ layerId: feature.layer.id, visible: enabled });
    }
  }
};
</script>
