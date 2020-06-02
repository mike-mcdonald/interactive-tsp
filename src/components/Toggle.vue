<template>
  <div>
    <div class="form-switch inline-block align-middle">
      <input
        v-bind:value="value"
        v-model="isToggleOn"
        v-on:change="$emit('input', $event.target.checked)"
        type="checkbox"
        :name="id"
        :id="id"
        class="form-switch-checkbox"
      />
      <label class="form-switch-label" :for="id"></label>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    this.isToggleOn = this.value;
  },
  props: ['id', 'value'],
  data() {
    return {
      isToggleOn: false
    };
  }
};
</script>

<style lang="scss">
/* CHECKBOX TOGGLE SWITCH */
.form-switch {
  @apply relative select-none w-12 mr-2 leading-normal;
}
.form-switch-checkbox {
  @apply hidden;
}
.form-switch-label {
  @apply block overflow-hidden cursor-pointer bg-white border border-gray-500 rounded-full h-6;
  transition: background-color 0.2s ease-in;
}
.form-switch-label:before {
  @apply absolute block bg-white inset-y-0 w-6 border border-gray-500 rounded-full -ml-1;

  right: 50%;
  content: '';
  transition: all 0.2s ease-in;
}
.form-switch-checkbox:checked + .form-switch-label,
.form-switch-checkbox:checked + .form-switch-label:before {
}
.form-switch-checkbox:checked + .form-switch-label {
  @apply bg-green-500 shadow-none;
}
.form-switch-checkbox:checked + .form-switch-label:before {
  @apply right-0;
}
</style>
