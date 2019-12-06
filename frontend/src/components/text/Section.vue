<template>
  <section>
    <a :id="id" :class="['float-left']"></a>
    <span v-html="content"></span>
    <div>
      <text-section
        v-for="section in sections"
        :key="section.id"
        :id="section.id"
        :content="section.content"
        :sections="section.sections"
      />
    </div>
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
