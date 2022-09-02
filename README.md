# JSON to Vue

Generates Vue components from JSON by using the render function.

## Install

`npm install json-to-vue`

or

`yarn add json-to-vue`


## Use 

2 ways to use

1. Using the provided component
2. Writing your own component and using the composable

---

### 1. Component

This is the easiest way to use this package, but can only use globally registered components, that can be accessed by [resolveComponent](https://vuejs.org/api/render-function.html#resolvecomponent)

Use this technique if
- you don't need to use any components at all
- or you only use a few components that you can register globally
- or if all the components are installed by a library.

Example:

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
---

### 2. Composables

With this technique you need to make your own render function component. This enables you to import all the components to be used inside the generated component.

This can be done using standaed component imports, but those components must be registered with JsonToVue using `registerComponents`.

Example:

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

Alternatively, you can use dynamic imports by traversing the JSON content and extracting the component names. They still need to be registered with JsonToVue using `registerComponents`

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