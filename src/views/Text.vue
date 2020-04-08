<template>
  <main class="container mx-auto my-4 flex flex-col md:flex-row-reverse justify-between">
    <aside class="md:w-1/3 px-2">
      <nav class="md:sticky md:top-10 md:overflow-y-auto md:max-h-(screen-16) text-sm md:text-base">
        <ol class="p-2 list-none">
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
          <messages />
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
                class="appearance-none placeholder-gray-600 w-full px-3 py-2 bg-gray-100 border border-gray-500 rounded shadow focus:outline-none focus:shadow-outline"
                v-model="searchQuery"
                @input="handleSearchChange($event.target.value)"
              />
            </div>
          </form>
          <div v-if="searchQuery" class="absolute top-12 bg-white border rounded shadow-lg">
            <div
              v-for="(candidate, index) in candidates"
              :key="candidate.id"
              :class="{
                'w-full': true,
                'border-b': index + 1 < candidates.length
              }"
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

import Messages from '@/components/message/List.vue';
import TextSection from '@/components/text/Section.vue';
import TextListing from '@/components/text/Listing.vue';
import { CombinedVueInstance } from 'vue/types/vue';

export default Vue.extend({
  name: 'TextView',
  components: {
    Messages,
    TextSection,
    TextListing
  },
  data() {
    return {
      searchQuery: ''
    };
  },
  computed: {
    ...mapState('text', ['candidates']),
    ...mapGetters('text', ['sectionTree'])
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$store.commit('setMessages', undefined);
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
    @apply text-3xl my-6;
  }

  h2 {
    @apply text-2xl my-5;
  }

  h3 {
    @apply text-xl my-4;
  }

  h4 {
    @apply text-lg my-3;
  }

  h5 {
    @apply text-base my-2;
  }

  h6 {
    @apply text-sm my-1;
  }

  p {
    @apply my-3;
  }

  blockquote {
    @apply px-4 py-2 border border-l-4 border-gray-900 rounded;
  }

  a {
    @apply border-current border-b-2 transition ease-in-out duration-150;
    &:hover {
      @apply text-blue-600;
    }
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

@media print {
  input,
  button,
  nav {
    display: none;
  }
  #tsp-text {
    page-break-before: always;
    & > section {
      page-break-before: always;
    }
    blockquote {
      @apply py-0 border-0 border-l-4 rounded-none;
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
