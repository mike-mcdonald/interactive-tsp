<template>
  <section>
    <div class="bg-gray-100 text-gray-900 text-base">
      <form
        title="Search"
        role="search"
        action="/"
        class="flex flex-wrap items-center border border-gray-500 shadow rounded"
        @submit.prevent="findCandidates({ search, searchType })"
      >
        <label for="addressInput" class="sr-only">Address</label>
        <input
          id="addressInput"
          v-model="search"
          name="addressInput"
          type="search"
          role="searchbox"
          placeholder="Search..."
          required="required"
          aria-controls="address-suggest-results"
          class="flex-1 appearance-none placeholder-gray-600 p-2 rounded bg-transparent focus:outline-none focus:shadow-outline"
        />
        <div class="relative flex items-center">
          <select
            aria-label="Search type"
            class="appearance-none h-full pl-2 pr-5 py-2 border-transparent rounded bg-transparent focus:outline-none focus:shadow-outline"
            v-model="searchType"
          >
            <option value="address">Address</option>
            <option value="taxLot">Tax lot</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center">
            <i v-html="feather.icons['chevron-down'].toSvg({ class: 'w-5 h-5' })" />
          </div>
        </div>
        <button aria-label="Search" class="p-2 rounded focus:outline-none focus:shadow-outline">
          <Search />
        </button>
      </form>
      <ul id="address-suggest-results" role="listbox" class="list-none m-0 p-0 -mt-1 pt-1">
        <li
          v-for="(candidate, index) in candidates"
          :key="candidate.id"
          :id="`address-suggest-result-${index}`"
          role="option"
          tabindex="0"
          class="p-2 w-full border-b border-r hover:bg-blue-100 cursor-pointer"
          @click="selectCandidate(candidate)"
          @keyup.enter="selectCandidate(candidate)"
          @keyup.space="selectCandidate(candidate)"
        >
          <span
            v-if="candidate.type"
            class="mx-2 px-2 rounded-full bg-blue-500 text-white text-xs font-bold uppercase"
            >{{ candidate.type }}</span
          >
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
<script>
import { mapState, mapActions } from 'vuex';

import feather from 'feather-icons';

import Search from '@/components/icons/Search.vue';

export default {
  name: 'AddressSuggest',
  components: {
    Search
  },
  data() {
    return {
      search: undefined,
      searchType: 'address',
      feather
    };
  },
  computed: {
    ...mapState('portlandmaps', ['candidates'])
  },
  methods: {
    ...mapActions('portlandmaps', ['clearCandidates', 'findCandidates']),
    selectCandidate(candidate) {
      this.$emit('candidate-select', candidate);
      this.clearCandidates();
    }
  }
};
</script>
