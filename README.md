# JSON to Vue

Generates Vue components from JSON by using the render function.

## Install

`npm install json-to-vue`

or

`yarn add json-to-vue`


## Use 

2 ways to use

### 1. Component

Example

```
<template>
  <JsonToVue :json="cmsContent" />
</template>

<script setup>
import { JsonToVue } from 'json-to-vue'
import { ref } from 'vue'
import { useCms } from '@/composables'

const { getContent } = useCms()
const cmsContent = ref(getContent('global'))

</script>
```

### 2. Composables

MyCMS.js
```
import { useJsonToVue } from 'json-to-vue'
import MyLocalFoo from '@/components/MyLocalFoo.vue'
import MyLocalBar from '@/components/MyLocalBar.vue'

const { generate, registerComponents } = useJsonToVue()

export default {
  name: 'MyCMS',
  props: {
    json: {
      type: Object,
      required: true
    }
  },
  setup (props) {
    registerComponents({
      MyLocalFoo,
      MyLocalBar
    })
    return () => generate(props.json)
  }
}
```

Usage
```
<template>
  <MyCMS :json="cmsContent" />
</template>

<script setup>
import { ref } from 'vue'
import { useCms } from '@/composables'
import MyCMS from '@/components/MyCMS.js'

const { getContent } = useCms()
const cmsContent = ref(getContent('local'))
```

#### Composables with dynamic imports

```
import { defineAsyncComponent } from 'vue'
import { useJsonToVue } from 'json-to-vue'

const { generate, registerComponents } = useJsonToVue()

const asyncComponents = {}

const getAsyncComponents = (content) => {
  if (!Array.isArray(content)) {
    return null
  }
  for (const item of content) {
    if (item.component && !(item.component in asyncComponents)) {
      asyncComponents[item.component] = defineAsyncComponent(() => import(`./library/${item.component}.vue`))
    }
    if (item.children) {
      getAsyncComponents(item.children)
    }
  }
}

export default {
  name: 'MyCMS',
  props: {
    json: {
      type: Object,
      required: true
    }
  },
  setup (props) {
    getAsyncComponents(props.json)
    registerComponents(asyncComponents)
    return () => generate(props.json)
  }
}
```

Usage
```
<template>
  <MyCMSDynamic :json="cmsContent" />
</template>

<script setup>
import { ref } from 'vue'
import { useCms } from '@/composables'
import MyCMSDynamic from '@/components/MyCMSDynamic.js'

const { getContent } = useCms()
const cmsContent = ref(getContent('dynamic'))

</script>
```