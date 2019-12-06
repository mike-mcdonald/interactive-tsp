<template>
  <li tabindex="0" role="button" class="px-2 py-1 transition-fast hover:translate-tr-2px hover:text-blue-900">
    <router-link :to="`#${this.id}`" :class="classes" append>{{ name }}</router-link>
    <ol v-if="depth < maxDepth">
      <text-listing
        v-for="section in sections"
        :key="section.id"
        :id="section.id"
        :name="section.name"
        :depth="section.depth"
        :max-depth="maxDepth"
        :sections="section.sections"
      />
    </ol>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'TextListing',
  props: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    depth: {
      type: Number
    },
    maxDepth: {
      type: Number
    },
    sections: {
      type: Array
    }
  },
  computed: {
    classes() {
      return [`ml-${+this.depth * 2}`, this.depth == 0 ? 'font-bold' : 'font-base'];
    }
  }
});
</script>
