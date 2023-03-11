<script setup lang="ts">
import { NScrollbar, UploadFileInfo, useNotification } from 'naive-ui';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai.css';
import MarkdownIt from 'markdown-it'
import { nextTick, ref } from 'vue'
import api from '../api'
import { ChatReq, Message, ExhibitMessage, ChatResp, RespChoice, RespUsage } from '../api/chat';
import { Delete, Copy, SendAlt, Restart, Clean, DocumentExport, DocumentImport } from '@vicons/carbon'
import { AxiosError } from 'axios';

import useKeyStore from '../store/key'
import usePromptStore from '../store/prompt'
// import Scrollbar from 'naive-ui/es/scrollbar/src/Scrollbar';

const markdownIt = MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        // return hljs.highlight(str, { language: lang }).value;
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (e) {console.log(e)}
    }

    return ''; // use external default escaping
  }
});
const notification = useNotification()
const keyStore = useKeyStore()
const promptStore = usePromptStore();

const scrollbar = ref<typeof NScrollbar|null>()

const model_choice = ref("gpt-3.5-turbo")
const temperature = ref(6)
const model_options = [
  {
    label: 'gpt-3.5-turbo',
    value: 'gpt-3.5-turbo'
  },
  {
    label: 'gpt-3.5-turbo-0301',
    value: 'gpt-3.5-turbo-0301'
  },
  // {
  //   label: 'text-davinci-003',
  //   value: 'text-davinci-003'
  // },
  // {
  //   label: 'text-davinci-002',
  //   value: 'text-davinci-002'
  // },
  // {
  //   label: 'code-davinci-002',
  //   value: 'code-davinci-002'
  // },
];
const user_messgae = ref<string>("")

const submitable = ref(false)
const history = ref<ExhibitMessage[]>([]);

async function submit(force: boolean = false) {

  if (!force) {
    const message = user_messgae.value.trim();
    user_messgae.value = "";
    if (message.length <= 0) {
      notification.error({
        duration: 1000,
        content: `无法发送空白的消息`
      })
      return;
    }
    history.value.push(new ExhibitMessage({speaker: "user", text: message}));
    auto_scroll()
  }

  submitable.value = true;
  try {
    let data = buildRequest();
    if (data.messages.length <= 1) {
      notification.error({
        duration: 1000,
        content: `没有选中任何消息`
      })
      return;
    }
    console.log(data);
    let result = await api({
      method: 'post',
      url: '/request_model',
      data,
    });
    let chatRespData = result.data;
    let chatResp = new ChatResp(
        chatRespData.id,
        chatRespData.object,
        chatRespData.created,
        chatRespData.choices.map((choice: { index: any; message: { speaker: string; text: string; }; finish_reason: any; }) => new RespChoice(
            choice.index,
            new Message(choice.message.speaker, choice.message.text),
            choice.finish_reason
        )),
        new RespUsage(
            chatRespData.usage.prompt_tokens,
            chatRespData.usage.completion_tokens,
            chatRespData.usage.total_tokens
        )
    );
    console.log(chatResp);
    history.value = history.value.concat(chatResp.choices.map(e => e.message).map(ExhibitMessage.from))

    // 滚动到底下
    auto_scroll()

    notification.success({
      duration: 1000,
      content: '请求成功, []~(￣▽￣)~*'
    })
  } catch (e) {
    let message = e;
    if (e instanceof AxiosError) {
      message = e.response?.data;
    }
    console.log(e);
    notification.error({
      duration: 5000,
      content: `请求失败, ${message}`
    })
  } finally {
    submitable.value = false
  }
}

function buildRequest(): ChatReq {
  let req = new ChatReq(keyStore.current.value, model_choice.value)
  req.temperature = temperature.value / 10;
  let msgs = [];
  msgs.push(new Message("system", promptStore.current.value));
  history.value.filter(e => e.select).forEach(e => msgs.push(e.to()))
  req.messages = msgs;
  return req
}

function export_txt() {
  const file = JSON.stringify(history.value);
  const url = URL.createObjectURL(new Blob([file], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "temp.json";
  link.click();
}

function fileChange(options: { file: UploadFileInfo, fileList: Array<UploadFileInfo>, event?: Event }) {
  console.log("read file: ", options);
  const file = options.file.file;
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string) as {speaker: string, text: string, select: boolean}[];
        history.value = json.map(e => ExhibitMessage.from_temp(e));
        auto_scroll()
      } catch (e) {
        console.error(e);
      }
    };
    reader.readAsText(file);
  }
}
function clean_history(index?: number) {
  if (index !== undefined) {
    history.value.splice(index, 1);
  } else {
    history.value = [];
  }
}

async function copy_text(index: number) {
  try {
    await navigator.clipboard.writeText(history.value[index].text);
    notification.success({
      duration: 1000,
      content: '复制成功, []~(￣▽￣)~*'
    })
  } catch (e) {
    notification.error({
      duration: 1000,
      content: `复制失败: ${e}`
    })
  }
}

const select_index = ref<number | null>(keyStore.current.value === "" ? null : keyStore.all_selects.length - 1)
function handleUpdateValue (value: number | null) {
  keyStore.SELECT(value)
}

function auto_scroll() {
  nextTick(() => {
    if (scrollbar.value !== null && scrollbar.value !== undefined) {
      scrollbar.value.scrollBy({
        top: 1000,
        behavior: 'smooth'
      })
    }
  })
}
</script>

<template>
  <!-- {{ keyStore.current }} -->
<div style="height: 100%; position: relative">
<n-layout position="absolute">
  <n-layout-header style="height: 64px; padding: 5px;">
    <n-grid cols="1 400:2 1000:5" style="height: 64px;" :x-gap="5">
      <n-gi span="0 400:1 1000:1" style="display: flex; justify-content: center;align-items: center;">
        <n-input-group >
            <n-input-group-label>API Key</n-input-group-label>
            <n-select v-model:value="select_index" @update:value="handleUpdateValue" :options="keyStore.all_selects" />
          </n-input-group>
      </n-gi>
      <n-gi span="1 400:1 1000:1" style="display: flex; justify-content: center;align-items: center;">
        <n-input-group-label>模型温度(0 ~ 20)</n-input-group-label>
        <n-input-number
          v-model:value="temperature"
          placeholder="模型温度(0 ~ 20)"
          :min="0"
          :max="20"
        />
      </n-gi>
      <n-gi span="0 400:0 1000:1" style="display: flex; justify-content: center;align-items: center;">
        <n-input-group>
          <n-input-group-label>模型选择</n-input-group-label>
          <n-select
            v-model:value="model_choice"
            filterable
            placeholder="模型选择"
            :options="model_options"
          />
        </n-input-group>
      </n-gi>
      <n-gi span="0 400:0 1000:2" style="display: flex; justify-content: center;align-items: center;">
        <n-input v-model:value="promptStore.current.value" type="textarea" rows="2" />
      </n-gi>
    </n-grid>
  </n-layout-header>
  <!-- head end -->
  <n-layout-content style="height: calc(100% - 144px)">
    <n-scrollbar ref="scrollbar" style="height: 100%">
      <n-space style="padding:5px 20px;" vertical>
        <n-thing content-indented  v-for="(each, index) of history" style="margin: 5px 0px; border: 0 solid">
          <template #avatar>
            <n-checkbox @update:checked="check => each.select = check " :checked="each.select.valueOf()" />
          </template>
          <template #header>
            {{each.exhibit_speaker}}
          </template>
        <template #header-extra>
          <n-space>
            <n-popconfirm :show-icon="false" negative-text="取消" positive-text="确定" @positive-click="clean_history(index)">
              <template #trigger>
                <n-button text type="error"><n-icon><Delete /></n-icon></n-button>
              </template>
              确认删除?
            </n-popconfirm>
            <n-button text type="info" @click="copy_text(index)"><n-icon><Copy /></n-icon></n-button>
          </n-space>
        </template>
        <div v-html="markdownIt.render(each.text)"></div>
          <!-- {{ each.text }} -->
        </n-thing>
      </n-space>
    </n-scrollbar>
  </n-layout-content>
  <!-- content end -->
  <n-layout-footer position="absolute" style="height: 80px; padding: 10px;">
    <n-grid cols="10 1000:20" :x-gap="5">
      <n-gi span="8 1000:16">
        <n-input @keyup.enter="submit()" v-model:value="user_messgae" type="textarea" rows="2" placeholder="请在此处输入对话"/>
      </n-gi>
      <!-- when less then 1000px -->
      <n-gi span="2 1000:0">
        <n-grid cols="2">
          <n-gi span="1">
            <n-spin :show="submitable" style="display: flex; justify-content: center;align-items: center;">
              <n-space vertical justify="space-between" align="center">
                <n-button type="primary" text style="font-size: 25px" :disabled="submitable" @click="submit()">
                  <template #icon><n-icon><SendAlt /></n-icon></template>
                </n-button>
                <n-button type="info" text style="font-size: 25px" :disabled="submitable" @click="submit(true)">
                  <template #icon><n-icon><Restart /></n-icon></template>
                </n-button>
              </n-space>
            </n-spin>
          </n-gi>
          <n-gi span="1">
            <n-space vertical justify="space-between" align="center">
              <n-popconfirm :show-icon="false" negative-text="取消" positive-text="确定" @positive-click="clean_history()">
                <template #trigger>
                  <n-button type="error" text style="font-size: 20px"><n-icon><Clean /></n-icon></n-button>
                </template>
                确认清空所有会话记录?
              </n-popconfirm>
            </n-space>
          </n-gi>
        </n-grid>
      </n-gi>
      <!-- when more then 1000px -->
      <n-gi span="0 1000:4">
        <n-grid cols="3">
          <n-gi span="1">
            <n-spin :show="submitable" style="display: flex; justify-content: center;align-items: center;">
              <n-space vertical justify="space-between" align="center">
                <n-button type="primary" text style="font-size: 25px" :disabled="submitable" @click="submit()">
                  <template #icon><n-icon><SendAlt /></n-icon></template>
                </n-button>
                <n-button type="info" text style="font-size: 25px" :disabled="submitable" @click="submit(true)">
                  <template #icon><n-icon><Restart /></n-icon></template>
                </n-button>
              </n-space>
            </n-spin>
          </n-gi>
          <n-gi span="1">
            <n-space vertical justify="space-between" align="center">
              <n-popconfirm :show-icon="false" negative-text="取消" positive-text="确定" @positive-click="clean_history()">
                <template #trigger>
                  <n-button type="error" text style="font-size: 20px"><n-icon><Clean /></n-icon></n-button>
                </template>
                确认清空所有会话记录?
              </n-popconfirm>
            </n-space>
          </n-gi>
          <n-gi span="1">
            <n-space vertical justify="space-between" align="center">
              <n-button type="success" text @click="export_txt()"><n-icon><DocumentExport /></n-icon></n-button>
              <n-upload :show-file-list="false" @change="fileChange" ><n-button type="warning" text><n-icon><DocumentImport /></n-icon></n-button></n-upload>
            </n-space>
          </n-gi>
        </n-grid>
      </n-gi>
    </n-grid>
  </n-layout-footer>
</n-layout>
</div>
</template>

<style scoped>

</style>
