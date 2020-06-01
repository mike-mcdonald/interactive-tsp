<template>
  <article>
    <h1 class="mb-3 text-3xl">{{ plan.name }}</h1>
    <field-list :fields="fields" />
  </article>
</template>

<script>
import FieldList from '@/components/fields/List.vue';

export default {
  name: 'AreaPlan',
  props: {
    plan: {
      type: Object,
      required: true
    }
  },
  components: {
    FieldList
  },
  computed: {
    fields() {
      return ['manager', 'requirements', 'adopted', 'document'].map(key => {
        return {
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: this.plan[key]
        };
      });
    }
  }
};
</script>
