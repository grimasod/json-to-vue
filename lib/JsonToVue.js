import { useJsonToVue } from './useJsonToVue'
const { generate } = useJsonToVue()

export const JsonToVue =  {
  name: 'JsonToVue',
  props: {
    content: {
      type: Object,
      required: true
    }
  },
  setup (props) {
    return () => generate(props.content)
  }
}
