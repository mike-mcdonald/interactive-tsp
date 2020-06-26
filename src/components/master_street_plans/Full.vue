<template>
  <article>
    <h1 class="mb-3 text-3xl">{{ plan.name }}</h1>
    <p class="text-xl text-gray-800">{{ plan.description }}</p>
    <field-list :fields="fields">
      <template v-slot:extra-fields>
        <field-item v-if="plan.document" name="Document" :value="plan.document">
          <template v-slot:value>
            <a :href="plan.document" class="border-b-2 border-current">{{ plan.document }}</a>
          </template>
        </field-item>
      </template>
    </field-list>
    <h2 class="mb-3 text-2xl">Features of the plan</h2>
    <ul v-if="plan.features.length > 0" class="list-none">
      <li v-for="feature in plan.features" :key="feature.id" class="my-2 flex items-center justify-between">
        <toggle :id="feature.id" :value="feature.enabled" @changed="handleToggle(feature, $event)" class="mr-2" />
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
import FieldItem from '@/components/fields/Item.vue';
import FieldList from '@/components/fields/List.vue';

export default {
  name: 'MasterStreetPlan',
  components: {
    FieldItem,
    FieldList,
    Toggle
  },
  props: {
    plan: {
      type: Object,
      required: true
    }
  },
  computed: {
    fields() {
      return ['adopted', 'manager'].map(key => {
        return {
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: this.plan[key]
        };
      });
    }
  },
  methods: {
    ...mapActions('map', ['setLayerVisibility']),
    ...mapActions('masterStreetPlans', ['toggleFeature']),
    handleToggle(feature, enabled) {
      this.toggleFeature({ feature, value: enabled });
    }
  }
};
</script>
