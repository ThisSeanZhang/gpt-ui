<script setup lang="ts">
import { SelectOption } from 'naive-ui';
import { ref, watch } from 'vue';
import { ApiKeyPair, get_date } from '../api/common';
import useKeyStore from '../store/key'
import usePromptStore from '../store/prompt'
import { useRouter, useRoute } from 'vue-router'

const route = useRoute();
const router = useRouter();
const keyStore = useKeyStore()
const promptStore = usePromptStore();
const pair = ref(new ApiKeyPair("", ""))

const select_index = ref<number | null>(keyStore.current.value === "" ? null : keyStore.all_selects.length - 1)
const select_prompt = ref(promptStore.current.label)

console.log(route.params.key)
let in_key = typeof route.params.key === 'string' ? route.params.key : route.params.key.join();
if (in_key.length > 0) {
  keyStore.ADD_KEY(new ApiKeyPair(`temp-${keyStore.all_selects.length}`, in_key))
  select_index.value = keyStore.all_selects.length - 1;
}

function add_key() {
  keyStore.ADD_KEY(pair.value)
  select_index.value = keyStore.all_selects.length - 1;
  pair.value = new ApiKeyPair("", "");
}

function handleUpdateValue (value: number | null, option: SelectOption) {
  keyStore.SELECT(value)
}

watch(select_prompt, () => {
  promptStore.CHOICE(select_prompt.value)
  // const result = promptStore.prompts.find(e => e.label === );
  // console.log(result)
  // keyStore.current = result !== undefined ? result : new PromptPair("", "", "");
})

function start() {
  console.log(promptStore.current)
  router.push({name: 'Chat'})
}
</script>

<template>
<n-layout style="height: 100%; padding-top: 60px; ">
<n-space justify="center" align="center" style="height: 100%;">
  <n-grid x-gap="12" :cols="1">
    <n-gi class="each-item">
      <n-divider title-placement="center">
        设置 API KEY
      </n-divider>
    </n-gi>
    <n-gi class="each-item">
      <n-input-group>
        <n-input-group-label>API  Key</n-input-group-label>
        <n-input v-model:value="pair.value" placeholder="填API KEY"/>
        <n-input-group-label>备注</n-input-group-label>
        <n-input v-model:value="pair.label"  placeholder="方便辨认"/>
        <n-button type="primary" ghost @click="add_key">
          加入
        </n-button>
      </n-input-group>
    </n-gi>
    <n-gi class="each-item">
      <n-select v-model:value="select_index" @update:value="handleUpdateValue" :options="keyStore.all_selects" />
    </n-gi>
    <n-gi class="each-item">
      <n-divider title-placement="center">
        设置情景
      </n-divider>
    </n-gi>
    <n-gi class="each-item">
      <n-space>
        <n-radio-group v-model:value="select_prompt" name="radiobuttongroup1">
          <n-radio-button
            v-for="prompt in promptStore.prompts"
            :key="prompt.label"
            :value="prompt.label"
            :label="prompt.label"
          />
          <n-radio-button
            value="self"
            label="自定义"
          />
        </n-radio-group>
      </n-space>

    </n-gi>
    <n-gi>
      <n-thing v-if="select_prompt === 'self'" content-indented style="margin: 5px 0px; border: 0 solid;width: 700px;">
        <n-divider title-placement="center">
          在此输入 GPT 的设定
        </n-divider>
        <n-input v-model:value="promptStore.current.value" type="textarea" rows="2" />
      </n-thing>
      <n-thing v-else content-indented style="margin: 5px 0px; border: 0 solid; width: 700px;">
        <!-- <template #avatar>
          <n-checkbox  />
        </template> -->
        <template #header>
          设定: 
        </template>
        {{ promptStore.current.value }}
      </n-thing>
    </n-gi>
    <n-gi class="each-item">
      <n-button @click="start" type="success">
        开始聊天
      </n-button>
    </n-gi>
  </n-grid>
</n-space>
</n-layout>
</template>

<style>
.each-item {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0px;
}
</style>
