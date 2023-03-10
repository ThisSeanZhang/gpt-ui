import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import store from './store';
import router from './router';
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
  NIcon,
  NPopconfirm,
  NSpin,
  NDivider,
  NRadioGroup,
  NRadioButton,
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
  NIcon,
  NPopconfirm,
  NSpin,
  NDivider,
  NRadioGroup,
  NRadioButton,
]
})

createApp(App)
  .use(store)
  .use(naive)
  .use(router)
  .mount('#app')
