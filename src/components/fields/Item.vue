<template>
  <div v-if="value" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 my-3">
    <dt class="text-gray-700">
      <slot name="name">{{ name }}</slot>
    </dt>
    <dd>
      <slot name="value">{{ value }}</slot>
    </dd>
  </div>
</template>

<script>
export default {
  name: 'FieldItem',
  props: ['name', 'value']
};
</script>
