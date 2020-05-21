<template>
  <section :id="id">
    <span v-html="content"></span>
    <text-section
      v-for="section in sections"
      :key="section.id"
      :id="section.id"
      :content="section.content"
      :sections="section.sections"
    />
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'TextSection',
  props: {
    id: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    sections: {
      type: Array
    }
  }
});
</script>
