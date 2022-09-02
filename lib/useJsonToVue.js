import { h, resolveComponent  } from 'vue'

const localComponents = {}

const registerComponents = (newComponents) => {
  for (const comp in newComponents) {
    localComponents[comp] = newComponents[comp]
  }
}

const generate = (content, isSlots = false) => {
  if (!Array.isArray(content)) {
    return null
  }
  if (isSlots) {
    const slots = content.reduce(
      (previousValue, currentValue) => ({
        ...previousValue,
        ...!currentValue.slot || currentValue.slot === 'default'
          ? { default: [...previousValue.default, currentValue] }
          : { [currentValue.slot]: () => generate([currentValue]) }
      }),
      { default: [] })
    return {
      ...slots,
      default: () => generate(slots.default)
    }
  }
  return content.map(item => {
    if (typeof item === 'string') {
      return item
    }
    const globalComponent = item.component ? localComponents[item.component] || resolveComponent(item.component) : null
    return h(
      globalComponent || item.element || 'div',
      item.attributes || null,
      generate(item.children, globalComponent && (typeof globalComponent !== 'string'))
    )
  })
}

export function useJsonToVue() {
  return {
    registerComponents,
    generate
  }
}
