<template>
  <article class="p-2">
    <h1 class="mb-3 text-3xl lg:text-4xl">{{ project.name }}</h1>
    <dl>
      <div class="flex flex-wrap items-center mb-2">
        <dt>Transportation planning ID:</dt>
        <dd class="ml-2">{{ project.id }}</dd>
      </div>
      <div class="flex flex-wrap items-center mb-2">
        <dt>Project number:</dt>
        <dd class="ml-2">{{ project.number }}</dd>
      </div>
      <div class="flex flex-wrap items-center mb-2">
        <dt>Description:</dt>
        <dd class="ml-2">{{ project.description }}</dd>
      </div>
      <div class="flex flex-wrap items-center mb-2">
        <dt>Location:</dt>
        <dd class="ml-2">{{ project.location }}</dd>
      </div>
      <div class="flex flex-wrap items-center mb-2">
        <dt>Lead agency:</dt>
        <dd class="ml-2">{{ project.agency }}</dd>
      </div>
      <div class="flex flex-wrap items-center mb-2">
        <dt>Estimated cost:</dt>
        <dd class="ml-2">{{ project.estimatedCost ? project.estimatedCost.toLocaleString() : 'N/A' }}</dd>
      </div>
      <div class="flex flex-wrap items-center mb-2">
        <dt>Estimated time frame:</dt>
        <dd class="ml-2">{{ project.estimatedTimeframe }}</dd>
      </div>
      <div class="flex flex-wrap items-center mb-2">
        <dt>Project district:</dt>
        <dd class="ml-2">{{ project.district }}</dd>
      </div>
      <div class="flex flex-wrap items-center mb-2">
        <dt>Facility owner:</dt>
        <dd class="ml-2">{{ project.facilityOwner }}</dd>
      </div>
      <div class="flex flex-wrap items-center mb-2">
        <dt>Pattern area:</dt>
        <dd class="ml-2">{{ project.patternArea }}</dd>
      </div>
      <div class="flex flex-wrap items-center mb-2">
        <dt>Funding category:</dt>
        <dd class="ml-2">{{ project.fundingCategory }}</dd>
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
