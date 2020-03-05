<template>
  <section :class="classes">
    <a ref="anchor" :id="id" :class="['float-left']"></a>
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
  },
  computed: {
    classes() {
      if (`#${this.id}` == this.$route.hash) {
        return ['active', '-mx-2', 'px-2', 'bg-cyan-100', 'border', 'border-cyan-800', 'rounded', 'shadow'];
      }
      return undefined;
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

<style lang="scss">
article {
  section {
    &.active {
      blockquote {
        @apply bg-cyan-200 border-cyan-900;
      }
    }
  }
}
</style>
