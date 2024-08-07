# JSON to Vue

Generates a Vue template from a data object constructed from JSON. The generated template can contain further templates and components too, nested to any depth.

Possible use cases:

- To display content fetched from a CMS.
- To add content stored in `.json` files to a small website.

---

The below code examples are all available at [github.com/grimasod/json-to-vue-examples](https://github.com/grimasod/json-to-vue-examples).

---

**Important: Never include user generated content.**

When using this package (or doing anythings else in Vue.js), always follow the [security guidelines](https://vuejs.org/guide/best-practices/security.html).

> The most straightforward way [to avoid potential malicious code execution] is to make sure the contents of your Vue templates are always trusted and entirely controlled by you.

---

## Installation

`npm install json-to-vue`

or

`yarn add json-to-vue`

## How to Use

There are 2 ways to use this package:

1. Basic - Using the provided component
2. Advanced - Using the composable and writing your own component

---

### 1. Basic - Using the provided component

This is the easiest way to use this package, but can only use globally registered components, that can be accessed by [resolveComponent](https://vuejs.org/api/render-function.html#resolvecomponent)

Use this technique if:

- You don't need to use any components at all
- Or you only use components that:
  - You registered globally
  - Or are installed by a library or other package

Example:

```html
<template>
  <JsonToVue :content="cmsContent" />
</template>

<script setup>
  import { JsonToVue } from "json-to-vue";
  import { ref } from "vue";
  import { useCms } from "@/composables";

  const { getContent } = useCms();
  const cmsContent = ref(getContent("global"));
</script>
```

The component can be used multiple times.

```html
<template>
  <JsonToVue :content="cmsContent1" />
  <JsonToVue :content="cmsContent2" />
</template>
```

---

### The data

Despite the name of this package, a JavaScript Array must be provided as the single attribute. It does not take a JSON string directly. In many cases JSON will be automatically converted to a JavaScript data structure anyway. When that's not the case, it can be converted using [JSON.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)

The `content` attribute must be in the following format:

- The top level and every `children` property must be an array.
- Each item of the array must contain either:
  - A text string (and nothing else) or
  - An object which is used to define an HTML element

An absolute minimal example is:

```json
["Some text to display"]
```

And a very simple example is:

```json
[
  {
    "children": ["One bit of text"]
  },
  {
    "children": ["Another bit of text"]
  }
]
```

Each child will be displayed in an HMTL element, a div by default. So the above example would create 2 divs. To set the element type, just add the `element` property. For example:

```json
[
  {
    "children": ["This is a div"]
  },
  {
    "element": "span",
    "children": ["This is a span"]
  },
  {
    "element": "h1",
    "children": ["This is a H1 heading"]
  }
]
```

To nest elements, just add further children. Notice how both text and further elements can exist as siblings, as in the third list item.

```json
[
  {
    "element": "ul",
    "children": [
      {
        "element": "li",
        "children": ["First item in a list"]
      },
      {
        "element": "li",
        "children": ["Second item in a list"]
      },
      {
        "element": "li",
        "children": [
          "Third item in a list ",
          {
            "element": "span",
            "children": ["with a span within it"]
          },
          "."
        ]
      }
    ]
  }
]
```

Attributes can be added to any element.

```json
[
  {
    "element": "section",
    "attributes": {
      "id": "xyz",
      "class": "italic text-green-600 font-bold text-lg"
    },
    "children": ["This is a section with an id and CSS classes"]
  }
]
```

This means we can include images and links.

```json
[
  {
    "element": "img",
    "attributes": {
      "src": "https://picsum.photos/200/300",
      "class": "border border-3 border-red-200 hover:border-red-600"
    }
  },
  {
    "element": "cite",
    "children": [
      "This image is from ",
      {
        "element": "a",
        "attributes": {
          "href": "https://picsum.photos/",
          "target": "_blank",
          "class": "underline text-blue-600"
        },
        "children": ["Lorem Picsum"]
      }
    ]
  }
]
```

We can also render components, using the `component` property. In this case, the children are used as component slots.

_Keep in mind that with provided the `<JsonToVue>` component, we can only use components that are globally registered with `app.component()` or by another package or library. For working with locally registered components, see the next section._

In the first example below, we use the `router-link` component, which is globally available after installing and configuring [Vue Router](https://router.vuejs.org/).

We provide the `to` attribute to define the internal link.

```json
[
  {
    "component": "router-link",
    "attributes": {
      "to": { "name": "composable" },
      "class": "underline text-blue-600"
    },
    "children": ["Example of using the composable"]
  }
]
```

In the above case there's only one child, which becomes the default slot content.

We can add a `slot` property to use multiple slots. All children that have no slot property or have `slot: 'default'` will be combined into the default slot.

```json
[
  {
    "component": "MyGlobalFoo",
    "children": [
      {
        "children": ["Default slot first child"]
      },
      {
        "slot": "default",
        "children": ["Default slot second child"]
      },
      {
        "slot": "other",
        "children": ["Other slot"]
      }
    ]
  }
]
```

Further `children` can also be included within a slot, and they'll be rendered in the same way as any other children.

```json
[
  {
    "component": "MyGlobalFoo",
    "children": [
      {
        "slot": "default",
        "element": "ul",
        "children": [
          {
            "element": "li",
            "children": ["First grandchild of the component"]
          },
          {
            "element": "li",
            "children": ["Second grandchild of the component"]
          }
        ]
      }
    ]
  }
]
```

We can also use other components in the slots. Meaning we can nest components to any depth.

```json
[
  {
    "component": "MyGlobalFoo",
    "children": [
      {
        "component": "MyGlobalBar",
        "children": ["Bar Component default slot content"]
      }
    ]
  }
]
```

---

### 2. Advanced - Using the composable and writing your own component

With this technique you need to make your own render function component. This lets you to import the specific components to be used.

Our component needs to do two things in the `setup()` hook.

First, any imported components must be registered with JsonToVue using `registerComponents` .

Then `setup()` returns the `generate()` function, as described in the [Declaring Render Functions](https://vuejs.org/guide/extras/render-function.html#declaring-render-functions) documentation.

Here's an example using standard component imports.

MyCMS.js

```javascript
import { useJsonToVue } from "json-to-vue";
import MyLocalFoo from "@/components/MyLocalFoo.vue";
import MyLocalBar from "@/components/MyLocalBar.vue";

const { generate, registerComponents } = useJsonToVue();

export default {
  name: "MyCMS",
  props: {
    content: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    registerComponents({
      MyLocalFoo,
      MyLocalBar,
    });
    return () => generate(props.content);
  },
};
```

Usage

```html
<template>
  <MyCMS :content="cmsContent" />
</template>

<script setup>
import { ref } from 'vue'
import { useCms } from '@/composables'
import MyCMS from '@/components/MyCMS.js'

const { getContent } = useCms()
const cmsContent = ref(getContent('local'))
```

Alternatively, if you have a lot of components and want to use dynamic imports, that can be done by traversing the JSON content and extracting the component names.

Those components still need to be registered with JsonToVue using `registerComponents`.

In this example, we use [`defineAsyncComponent`](https://vuejs.org/api/general.html#defineasynccomponent), which has certain [limitations](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations) when dynamic imports contain a concatenated string.

In this case, we only dynamically import components that are in a `library` subdirectory of the components folder that this file is located in.

MyCMSDynamicImports.js

```javascript
import { defineAsyncComponent } from "vue";
import { useJsonToVue } from "json-to-vue";

const { generate, registerComponents } = useJsonToVue();

const asyncComponents = {};

const getAsyncComponents = (content) => {
  if (!Array.isArray(content)) {
    return null;
  }
  for (const item of content) {
    if (item.component && !(item.component in asyncComponents)) {
      asyncComponents[item.component] = defineAsyncComponent(() =>
        import(`./library/${item.component}.vue`)
      );
    }
    if (item.children) {
      getAsyncComponents(item.children);
    }
  }
};

export default {
  name: "MyCMS",
  props: {
    content: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    getAsyncComponents(props.content);
    registerComponents(asyncComponents);
    return () => generate(props.content);
  },
};
```

Usage

```html
<template>
  <MyCMSDynamic :content="cmsContent" />
</template>

<script setup>
  import { ref } from "vue";
  import { useCms } from "@/composables";
  import MyCMSDynamic from "@/components/MyCMSDynamic.js";

  const { getContent } = useCms();
  const cmsContent = ref(getContent("dynamic"));
</script>
```
