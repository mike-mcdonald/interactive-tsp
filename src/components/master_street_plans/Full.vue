<template>
  <article>
    <h1 class="mb-3 text-3xl">{{ plan.label }}</h1>
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
      <li v-for="feature in plan.features" :key="feature.name" class="my-2 px-2 flex items-center justify-between">
        <toggle :id="feature.name" :value="feature.enabled" @input="toggleFeature(feature, $event)" class="mr-2" />
        <span class="flex-1 pr-2">{{ feature.label }}</span>
        <span class="px-2 py-1 bg-blue-500 text-white text-xs rounded-md">{{ feature.count }}</span>
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
      this.setLayerVisibility({ layerId: feature.layer.id, visible: enabled });
    }
  }
};
</script>
