<template>
  <section>
    <Textfield
      title="Enter address"
      id="addressInput"
      size="60"
      placeholder="Enter an address to search"
      required="true"
      @input="handleInput"
    ></Textfield>
    <div v-for="(result, index) in results" :key="index">
      <div role="button" href="#" class="p-2 border-2 flex flex-wrap cursor-pointer hover:bg-blue-100">
        <span
          v-if="result.attributes.type"
          class="flex items-center flex-initial rounded-full bg-blue-500 text-white uppercase px-2 py-1 text-xs font-bold mx-2"
          >{{ result.attributes.type }}</span
        >
        <div class="mx-2">{{ result.address }}</div>
        <div v-if="result.attributes.city" class="flex flex-1 items-center mx-2">
          <span class="text-gray-800 uppercase text-xs font-bold">{{ result.attributes.city }},</span>
          <span class="text-gray-800 uppercase text-xs font-bold">{{ result.attributes.state }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
<script lang="ts">
import axios from 'axios';
import Vue from 'vue';

import Textfield from 'portland-pattern-lab/source/_patterns/02-molecules/form/Textfield.vue';

export default Vue.extend({
  name: 'AddressSearch',
  components: { Textfield },
  data: function() {
    return {
      search: '',
      results: ''
    };
  },
  methods: {
    handleInput: async function(text: string) {
      const body = {
        api_key: '',
        query: text
      };

      const encodeData = function(data: any) {
        let formBody = [];

        for (let key in data) {
          let encodedKey = encodeURIComponent(key);
          let encodedValue = encodeURIComponent(data[key]);
          formBody.push(encodedKey + '=' + encodedValue);
        }

        return formBody.join('&');
      };

      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      axios
        .post('https://www.portlandmaps.com/api/suggest/', encodeData(body), config)
        .then(res => {
          if (res.data.candidates) {
            this.results = res.data.candidates;
          }
        })
        .catch(err => console.error(err));
    }
  }
});
</script>
