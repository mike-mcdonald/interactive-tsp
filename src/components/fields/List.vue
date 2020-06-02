<template>
  <dl>
    <slot>
      <field-item v-for="(field, index) in fields" :key="index" :name="field.name" :value="field.value" />
    </slot>
    <slot name="extra-fields"></slot>
  </dl>
</template>

<script>
import FieldItem from './Item.vue';

export default {
  name: 'FieldList',
  props: {
    fields: {
      type: Array,
      required: true
    }
  },
  components: {
    FieldItem
  }
};
</script>
