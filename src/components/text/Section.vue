<template>
  <section>
    <a ref="anchor" :id="id" :class="['float-left']"></a>
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
  },
  mounted() {
    if (this.$route.hash == `#${this.id}`) {
      setTimeout(() => {
        (this.$refs['anchor'] as Element).scrollIntoView();
      }, 100);
    }
  }
});
</script>
