<template>
  <router-link
    :to="`${plan.id}`"
    :append="$route.params.id ? false : true"
    class="flex flex-col my-2 px-2 py-3 shadow border rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
    @mouseover.native="highlightPlan({ plan })"
    @focus.native="highlightPlan({ plan })"
  >
    <h3>{{ plan.label }}</h3>
    <main>{{ plan.features.length }} features</main>
  </router-link>
</template>

<script>
import { mapActions } from 'vuex';
export default {
  name: 'MasterStreetPlan',
  props: {
    plan: {
      type: Object,
      required: true
    }
  },
  methods: {
    ...mapActions('masterStreetPlans', ['highlightPlan', 'selectPlan'])
  }
};
</script>
