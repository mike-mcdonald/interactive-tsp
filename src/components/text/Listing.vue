<template>
  <li role="button" class="hover:text-blue-900">
    <router-link tabindex="0" :to="`#${this.id}`" :class="classes" append>{{ name }}</router-link>
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
      return [
        'px-2',
        'py-1',
        'flex',
        'border-2',
        'border-transparent',
        'hover:text-blue-800',
        'focus:text-blue-800',
        'focus:border-2',
        'focus:border-current',
        this.depth == 0 ? 'font-bold' : 'font-base'
      ];
    }
  }
});
</script>
