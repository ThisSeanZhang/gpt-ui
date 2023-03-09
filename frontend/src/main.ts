import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import {
  // create naive ui
  create,
  // component
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NSpace,
  NInput,
  NInputNumber,
  NInputGroup,
  NInputGroupLabel,
  NCheckbox,
  NButton,
  NSelect,
  NGrid,
  NGi,
  NUpload,
  NThing,
} from 'naive-ui'

const naive = create({
components: [
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NSpace,
  NInput,
  NInputNumber,
  NInputGroup,
  NInputGroupLabel,
  NCheckbox,
  NButton,
  NSelect,
  NGrid,
  NGi,
  NUpload,
  NThing,
]
})

createApp(App).use(naive).mount('#app')
