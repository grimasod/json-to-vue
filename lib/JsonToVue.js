import { useJsonToVue } from './useJsonToVue'
const { generate } = useJsonToVue()

// export default {
export const JsonToVue =  {
  name: 'JsonToVue',
  props: {
    content: {
      type: Object,
      required: true
    }
  },
  setup (props) { // , { attrs, slots, emit, expose }
    return () => generate(props.content)
  }
}
