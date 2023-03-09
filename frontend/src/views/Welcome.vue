<script setup lang="ts">
import { UploadFileInfo, useNotification } from 'naive-ui';
import { ref } from 'vue'
import api from '../api'
import { ChatReq, Message, ExhibitMessage, ChatResp, RespChoice, RespUsage } from '../api/chat';
import { Delete, Copy } from '@vicons/carbon'
import { AxiosError } from 'axios';

const notification = useNotification()

const token = ref("")
const token_label = ref("")
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
const character_setting = ref("你是一个很棒的助手")
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
  let req = new ChatReq(token.value, model_choice.value)
  req.temperature = temperature.value / 10;
  let msgs = [];
  msgs.push(new Message("system", character_setting.value));
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
</script>

<template>
<div style="height: 100%; position: relative">
<n-layout position="absolute">
  <n-layout-header style="height: 64px; padding: 5px;">
    <n-grid :cols="5" style="height: 64px;" :x-gap="5">
      <n-gi :span="1" style="display: flex; justify-content: center;align-items: center;">
          <n-input-group >
            <!-- <n-input-group-label>请输入API Key 标签(以便选择)</n-input-group-label> -->
            <!-- <n-input v-model="token_label" :style="{ width: '66%' }" placeholder="请输入API Key 标签(以便选择)"/> -->
            <n-input-group-label>API Key</n-input-group-label>
            <n-input v-model:value="token" placeholder="API Key"/>
            <!-- <n-button type="primary" ghost>
              添加
            </n-button> -->
          </n-input-group>
      </n-gi>
      <n-gi :span="1" style="display: flex; justify-content: center;align-items: center;">
        <n-input-group-label>模型温度(0 ~ 20)</n-input-group-label>
        <n-input-number
          v-model:value="temperature"
          placeholder="模型温度(0 ~ 20)"
          :min="0"
          :max="20"
        />
      </n-gi>
      <n-gi :span="1" style="display: flex; justify-content: center;align-items: center;">
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
      <n-gi :span="2" style="display: flex; justify-content: center;align-items: center;">
        <n-input-group>
          <n-input-group-label>在此输入 GPT 的设定</n-input-group-label>
          <n-input v-model:value="character_setting" type="textarea" rows="2" />
        </n-input-group>
      </n-gi>
    </n-grid>
  </n-layout-header>
  <!-- head end -->
  <n-layout-content style="height: calc(100% - 164px)" content-style="padding: 24px;" :native-scrollbar=false >
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
      {{ each.text }}
    </n-thing>
  </n-layout-content>
  <!-- content end -->
  <n-layout-footer position="absolute" style="height: 100px; padding: 10px;">
    <n-grid :cols="20" style="height: 64px;" :x-gap="5">
      <n-gi :span="16" style="display: flex; justify-content: center;align-items: center;">
        <n-input v-model:value="user_messgae" type="textarea" rows="2" placeholder="请在此处输入对话"/>
      </n-gi>
      <n-gi :span="2">
        <n-spin :show="submitable" style="display: flex; justify-content: center;align-items: center;">
          <n-space vertical justify="space-between" align="center">
            <n-button type="primary" :disabled="submitable" @click="submit()">
              提交
            </n-button>
            <n-button type="primary" dashed :disabled="submitable" @click="submit(true)">
              再生成一次
            </n-button>
          </n-space>
        </n-spin>
      </n-gi>
      <n-gi :span="1" style="display: flex; justify-content: center;align-items: center;">
        <n-space vertical justify="space-between" align="center">
          <n-popconfirm :show-icon="false" negative-text="取消" positive-text="确定" @positive-click="clean_history()">
            <template #trigger>
              <n-button type="error">清屏</n-button>
            </template>
            确认清空所有会话记录?
          </n-popconfirm>
        </n-space>
      </n-gi>
      <n-gi :span="1" style="display: flex; justify-content: center;align-items: center;">
        <n-space vertical justify="space-between" align="center">
          <n-button type="primary" @click="export_txt()">会话导出</n-button>
          <n-upload :show-file-list="false" @change="fileChange" >
            <n-button>会话导入</n-button>
          </n-upload>
        </n-space>
      </n-gi>
    </n-grid>
  </n-layout-footer>
</n-layout>
</div>
</template>

<style scoped>
</style>
