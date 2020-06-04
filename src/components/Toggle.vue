<template>
  <div class="p-1 flex items-center justify-between border-2 border-current rounded text-base">
    <button :id="id" role="switch" :aria-checked="String(value)" :aria-labelledby="`${id}-label`" @click="toggle">
      <span class="px-1 rounded">on</span>
      <span class="px-1 rounded">off</span>
    </button>
  </div>
</template>

<script>
// component inspired by https://inclusive-components.design/toggle-button/
export default {
  props: {
    id: {
      type: String,
      required: true
    },
    value: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    toggle() {
      this.$emit('changed', !this.value);
    }
  }
};
</script>

<style lang="scss" scoped>
[role='switch'][aria-checked='true'] :first-child,
[role='switch'][aria-checked='false'] :last-child {
  @apply bg-black text-white;
}
</style>
