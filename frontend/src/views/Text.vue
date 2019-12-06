<template>
  <main class="container mx-auto my-4 flex flex-col md:flex-row-reverse justify-between">
    <aside class="md:w-1/3 px-2">
      <nav class="md:sticky md:top-10 md:overflow-y-auto md:max-h-(screen-16)">
        <ol class="list-none">
          <text-listing
            v-for="section in sections"
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
    <article id="tsp-text" class="md:w-2/3 px-2">
      <text-section
        v-for="section in sections"
        :key="section.id"
        :id="section.id"
        :content="section.content"
        :sections="section.sections"
      />
    </article>
  </main>
</template>

<script lang="ts">
import Vue from 'vue';

import TextSection from '@/components/text/Section.vue';
import TextListing from '@/components/text/Listing.vue';
import { mapState, mapActions } from 'vuex';

export default Vue.extend({
  name: 'TextView',
  components: {
    TextSection,
    TextListing
  },
  computed: {
    ...mapState('text', ['sections'])
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$store.dispatch('text/findText');
    });
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
