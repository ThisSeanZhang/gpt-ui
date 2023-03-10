<script setup lang="ts">
import Welcome from './views/Welcome.vue'
import { darkTheme, NConfigProvider, NNotificationProvider } from 'naive-ui'

</script>

<template>
<n-config-provider :theme="darkTheme">
  <n-notification-provider>
    <router-view/>
  </n-notification-provider>
</n-config-provider>
</template>

<style scoped>
.n-config-provider {
  height: 100%;
  width: 100%;
}
</style>
