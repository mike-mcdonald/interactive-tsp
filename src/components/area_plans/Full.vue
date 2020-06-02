<template>
  <article>
    <h1 class="mb-3 text-3xl">{{ plan.name }}</h1>
    <field-list :fields="fields">
      <template v-slot:extra-fields>
        <field-item v-if="plan.document" name="Document" :value="plan.document">
          <template v-slot:value>
            <a :href="plan.document" class="border-b-2 border-current">{{ plan.document }}</a>
          </template>
        </field-item>
      </template>
    </field-list>
  </article>
</template>

<script>
import FieldItem from '@/components/fields/Item.vue';
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
    FieldItem,
    FieldList
  },
  computed: {
    fields() {
      return ['manager', 'requirements', 'adopted'].map(key => {
        return {
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: this.plan[key]
        };
      });
    }
  }
};
</script>
