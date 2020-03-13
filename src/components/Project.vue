<template>
  <article>
    <h1 class="mb-3 text-3xl lg:text-4xl">{{ project.name }}</h1>
    <p class="my-3 text-xl font-thin">{{ project.description }}</p>
    <dl>
      <div class="my-3 xl:grid xl:grid-cols-2 xl:gap-3">
        <dt class="font-semibold">Project number</dt>
        <dd>{{ project.number }}</dd>
      </div>
      <div class="my-3 xl:grid xl:grid-cols-2 xl:gap-3">
        <dt class="font-semibold">Transportation plan ID</dt>
        <dd>{{ project.id }}</dd>
      </div>
      <div class="my-3 xl:grid xl:grid-cols-2 xl:gap-3">
        <dt class="font-semibold">Location</dt>
        <dd>{{ project.location }}</dd>
      </div>
      <div class="my-3 xl:grid xl:grid-cols-2 xl:gap-3">
        <dt class="font-semibold">Lead agency</dt>
        <dd>{{ project.agency }}</dd>
      </div>
      <div class="my-3 xl:grid xl:grid-cols-2 xl:gap-3">
        <dt class="font-semibold">Estimated cost</dt>
        <dd>{{ project.estimatedCost ? project.estimatedCost.toLocaleString() : 'N/A' }}</dd>
      </div>
      <div class="my-3 xl:grid xl:grid-cols-2 xl:gap-3">
        <dt class="font-semibold">Estimated time frame</dt>
        <dd>{{ project.estimatedTimeframe }}</dd>
      </div>
      <div class="my-3 xl:grid xl:grid-cols-2 xl:gap-3">
        <dt class="font-semibold">Project district</dt>
        <dd>{{ project.district }}</dd>
      </div>
      <div class="my-3 xl:grid xl:grid-cols-2 xl:gap-3">
        <dt class="font-semibold">Facility owner</dt>
        <dd>{{ project.facilityOwner }}</dd>
      </div>
      <div class="my-3 xl:grid xl:grid-cols-2 xl:gap-3">
        <dt class="font-semibold">Pattern area</dt>
        <dd>{{ project.patternArea }}</dd>
      </div>
      <div class="my-3 xl:grid xl:grid-cols-2 xl:gap-3">
        <dt class="font-semibold">Funding category</dt>
        <dd>{{ project.fundingCategory }}</dd>
      </div>
    </dl>
  </article>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'Project',
  props: {
    project: {
      type: Object,
      required: true
    }
  }
});
</script>
