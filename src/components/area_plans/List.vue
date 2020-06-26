<template>
  <router-link
    :to="`${plan.id}`"
    :append="$route.params.id ? false : true"
    class="block my-2 px-2 py-3 shadow border rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
    @mouseover.native="highlightPlan({ plan })"
    @focus.native="highlightPlan({ plan })"
  >
    <slot>
      <span class="px-2 py-1 mb-2 bg-fog-300 text-fog-900 text-sm rounded-md shadow inline-block">Area plan</span>
      <h3 class="text-lg">{{ plan.name }}</h3>
    </slot>
  </router-link>
</template>

<script>
import { mapActions } from 'vuex';
export default {
  name: 'AreaPlan',
  props: {
    plan: {
      type: Object,
      required: true
    }
  },
  methods: {
    ...mapActions('areaPlans', ['highlightPlan', 'selectPlan'])
  }
};
</script>
