<template>
  <router-link
    :to="`${plan.id}`"
    :append="$route.params.id ? false : true"
    class="block my-2 px-2 py-3 shadow border rounded bg-white hover:bg-blue-100 focus:bg-blue-100"
    @mouseover.native="highlightPlan({ plan })"
    @focus.native="highlightPlan({ plan })"
  >
    <slot>
      <article>
        <header v-if="showType" class="px-2 py-1 mb-2 bg-fog-300 text-fog-900 text-sm rounded-md shadow inline-block">
          Master street plan
        </header>
        <h3 class="text-lg">{{ plan.name }}</h3>
        <main class="text-sm text-gray-700">
          <dl>
            <div class="flex items-center my-1">
              <dt class="mr-2">
                <i v-html="feather.icons['file-text'].toSvg({ class: 'w-4 h-4' })" />
                <span class="sr-only">Documentation</span>
              </dt>
              <dd>
                <a :href="plan.document" target="_blank" class="border-b-2 border-current">
                  {{ plan.document }}
                </a>
              </dd>
            </div>
            <div class="flex items-center my-1">
              <dt class="mr-2">
                <i v-html="feather.icons['map-pin'].toSvg({ class: 'w-4 h-4' })" />
                <span class="sr-only">Feature count</span>
              </dt>
              <dd>
                <span>{{ plan.features.length }} features</span>
              </dd>
            </div>
          </dl>
        </main>
      </article>
    </slot>
  </router-link>
</template>

<script>
import { mapActions } from 'vuex';

import feather from 'feather-icons';

export default {
  name: 'MasterStreetPlan',
  props: {
    plan: {
      type: Object,
      required: true
    },
    showType: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return { feather };
  },
  methods: {
    ...mapActions('masterStreetPlans', ['highlightPlan', 'selectPlan'])
  }
};
</script>
