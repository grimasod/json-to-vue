<template>
  <div>
    <JsonToVue :content="demo" />
  </div>
</template>

<script setup lang="ts">
import { JsonToVue } from '../lib/jsonToVue'
import { ref } from 'vue'

const demo = ref([
  {
    element: 'h1',
    children: ['JSON to Vue']
  },
  {
    attributes: {
      style: 'display: flex; flex-direction: column;'
    },
    children: [
      {
        element: 'a',
        attributes: {
          href: 'https://github.com/grimasod/json-to-vue',
          target: '_blank'
        },
        children: ['Git']
      },
      {
        element: 'a',
        attributes: {
          href: 'https://www.npmjs.com/package/json-to-vue',
          target: '_blank'
        },
        children: ['NPM']
      },
      {
        element: 'a',
        attributes: {
          href: 'https://json-to-vue.circleoflifecycle.com/',
          target: '_blank'
        },
        children: ['Examples']
      }
    ]
  }
])
</script>
