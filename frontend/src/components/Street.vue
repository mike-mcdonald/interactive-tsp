<template>
  <article class="px-2" v-if="street">
    <h1 class="mb-3 text-3xl lg:text-4xl">{{ street.name }}</h1>
    <p class="mb-3 text-2xl" v-if="street.block">{{ street.block }}
    block</p>
    <div class="flex flex-wrap items-center mb-3">
      <dl>
        <div class="flex flex-wrap items-center">
          <dt>Transportation planning ID:</dt>
          <dd class="ml-2">{{ street.id }}</dd>
        </div>
      </dl>
    </div>
    <h2 class="mb-3 text-2xl lg:text-3xl">Classifications</h2>
    <dl>
      <div v-for="(classification, index) in Object.keys(street.classifications)" :key="index" class="flex flex-wrap items-center mb-2">
        <dt>{{ classification.charAt(0).toUpperCase() + classification.slice(1) }} classification:</dt>
        <dd class="ml-2">
          <a href="#" class="border-b-2 border-black">{{ street.classifications[classification] }}</a>
        </dd>
      </div>
    </dl>
    <h2 class="mb-3 text-2xl lg:text-3xl">Projects affecting this street</h2>
    <ul class="list-none m-0">
      <li class="my-2" v-for="project in street.projects" :key="project.id">
        <a href="#" class="border-b-2 border-black">{{ project.name }}</a>
      </li>
    </ul>
  </article>
</template>
<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

export default Vue.extend({
  name: 'Street',
  computed: {
    ...mapState('streets', {
      street: (state: any) => state.selected
    })
  },
  methods: {
    ...mapActions('streets', ['selectStreet']),

  },
  mounted: function () {
    this.selectStreet(this.$route.params.id);
  }
})
</script>