<template>
  <section>
    <div class="bg-gray-100 text-gray-900 text-base">
      <form
        title="Search"
        role="search"
        action="/"
        class="flex flex-no-wrap md:flex-wrap lg:flex-no-wrap items-center border border-gray-500 shadow rounded"
        @submit.prevent="findCandidates(search)"
      >
        <label for="addressInput" class="sr-only">Address</label>
        <input
          id="addressInput"
          v-model="search"
          name="addressInput"
          type="search"
          role="searchbox"
          placeholder="Search for an address..."
          required="required"
          aria-controls="address-suggest-results"
          class="appearance-none placeholder-gray-600 w-full px-3 py-2 md:border-b lg:border-0 rounded-l md:rounded-l-0 lg:rounded-l bg-gray-100 focus:outline-none focus:shadow-outline"
        />
        <section class="flex flex-row-reverse ml-auto">
          <button aria-label="Search" class="my-1 px-3 py-2 border-l">
            <Search />
          </button>
          <transition name="fade">
            <button
              v-if="search"
              aria-label="Clear"
              class="p-3"
              @click.stop.prevent="
                search = undefined;
                clearCandidates();
              "
            >
              <X />
            </button>
          </transition>
        </section>
      </form>
      <ul id="address-suggest-results" role="listbox" class="list-none m-0 p-0 -mt-1 pt-1">
        <li
          v-for="(candidate, index) in candidates"
          :key="candidate.id"
          :id="`address-suggest-result-${index}`"
          role="option"
          tabindex="0"
          class="p-2 w-full border-b border-l border-r hover:bg-blue-100 cursor-pointer"
          @click="selectCandidate(candidate)"
          @keyup.enter="selectCandidate(candidate)"
          @keyup.space="selectCandidate(candidate)"
        >
          <span
            v-if="candidate.type"
            class="mx-2 px-2 rounded-full bg-blue-500 text-white text-xs font-bold uppercase"
          >{{ candidate.type }}</span>
          <div class="mx-2 text-sm">{{ candidate.name }}</div>
          <div class="flex flex-1 items-center mx-2 text-xs font-bold uppercase">
            <span v-if="candidate.city" class>{{ candidate.city }},</span>
            <span class>{{ candidate.state }}</span>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions } from 'vuex';

import Search from '@/components/icons/Search.vue';
import X from '@/components/icons/X.vue';

export default Vue.extend({
  name: 'AddressSuggest',
  components: {
    Search,
    X
  },
  data() {
    return {
      search: undefined
    };
  },
  computed: {
    ...mapState('portlandmaps', ['candidates'])
  },
  methods: {
    ...mapActions('portlandmaps', ['clearCandidates', 'findCandidates']),
    selectCandidate(candidate: any) {
      this.$emit('candidate-select', candidate);
      this.clearCandidates();
    }
  }
});
</script>

<style lang="scss" scoped>
.fade-enter-active {
  transition: opacity 0.25s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
