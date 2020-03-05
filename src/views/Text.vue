<template>
  <main class="container mx-auto my-4 flex flex-col md:flex-row-reverse justify-between">
    <aside class="md:w-1/3 px-2">
      <nav class="md:sticky md:top-10 md:overflow-y-auto md:max-h-(screen-16)">
        <ol class="list-none">
          <text-listing
            v-for="section in sectionTree"
            :key="section.id"
            :id="section.id"
            :name="section.name"
            :depth="section.depth"
            :max-depth="1"
            :sections="section.sections"
          />
        </ol>
      </nav>
    </aside>
    <div class="flex flex-col md:w-2/3 px-2">
      <header>
        <section>
          <transition name="fade">
            <div
              v-if="message"
              class="px-2 py-3 w-full border-l-8 border-tangerine-800 bg-tangerine-300 text-tangerine-900"
            >{{ message }}</div>
          </transition>
        </section>
        <nav class="relative my-2">
          <form title="Search" role="search" action="/" class="flex flex-col" @submit.prevent>
            <div>
              <label for="searchInput" class="sr-only">Search</label>
              <input
                id="searchInput"
                name="searchInput"
                type="search"
                role="searchbox"
                placeholder="Search the plan..."
                required="required"
                class="w-full px-3 py-2 bg-fog-200 border rounded"
                v-model="searchQuery"
                @input="handleSearchChange($event.target.value)"
              />
            </div>
          </form>
          <div v-if="searchQuery" class="absolute top-12 bg-white border rounded shadow-lg">
            <div
              v-for="(candidate, index) in candidates"
              :key="candidate.id"
              :class="{ 'w-full': true, 'border-b': index + 1 < candidates.length }"
            >
              <router-link
                :to="`#${candidate.id}`"
                class="flex flex-col p-2 hover:bg-blue-100"
                @click="handleClick(candidate)"
                append
              >
                <div class="mx-2 font-semibold">{{ candidate.name }}</div>
                <div class="mx-2" v-html="candidate.content"></div>
              </router-link>
            </div>
          </div>
        </nav>
      </header>
      <article id="tsp-text">
        <text-section
          v-for="section in sectionTree"
          :key="section.id"
          :id="section.id"
          :content="section.content"
          :sections="section.sections"
        />
      </article>
    </div>
  </main>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions, mapGetters } from 'vuex';

import debounce from 'lodash-es/debounce';

import TextSection from '@/components/text/Section.vue';
import TextListing from '@/components/text/Listing.vue';
import { CombinedVueInstance } from 'vue/types/vue';

export default Vue.extend({
  name: 'TextView',
  components: {
    TextSection,
    TextListing
  },
  data() {
    return {
      searchQuery: ''
    };
  },
  computed: {
    ...mapState(['message']),
    ...mapState('text', ['candidates']),
    ...mapGetters('text', ['sectionTree'])
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$store.commit('setMessage', undefined);
      vm.$store.dispatch('text/findText');
    });
  },
  beforeRouteUpdate(to, from, next) {
    next();
    this.searchQuery = '';
  },
  methods: {
    ...mapActions('text', ['searchIndex']),
    handleSearchChange: debounce(function(this: any, text: string) {
      if (text) this.searchIndex(text);
    }, 500),
    handleClick(candidate: any) {
      this.searchQuery = '';
    }
  }
});
</script>

<style lang="scss">
#tsp-text {
  h1 {
    @apply text-3xl mb-6;
  }

  h2 {
    @apply text-2xl mb-5;
  }

  h3 {
    @apply text-xl mb-4;
  }

  h4 {
    @apply text-lg mb-3;
  }

  h5 {
    @apply text-base mb-2;
  }

  h6 {
    @apply text-sm mb-1;
  }

  p {
    @apply mb-3;
  }

  blockquote {
    @apply px-2 pt-1 border-l-4 border-fog-900 rounded-r bg-fog-200;
  }

  a {
    @apply border-current border-b-2;
  }

  ul {
    @apply list-outside list-disc pl-4;
  }

  ol {
    @apply list-outside list-decimal pl-4;
  }

  table {
    @apply table-fixed border-collapse my-3 border-2 border-current;
    th,
    td {
      @apply border border-current px-4 py-2;
    }
  }
}

@variants hover, focus {
  .translate-r-2px {
    transform: translateX(2px) !important;
  }
  .translate-t-2px {
    transform: translateY(-2px) !important;
  }
  .translate-tr-2px {
    transform: translateX(2px) translateY(-2px) !important;
  }
  .transition-fast {
    transition: all 0.2s ease !important;
  }
}
</style>
