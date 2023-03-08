<script setup lang="ts">
import { ref } from 'vue'
import api from '../api'
import { ChatReq, Message, ExhibitMessage, ChatResp, RespChoice, RespUsage } from '../api/chat';

const token = ref("")
const user_messgae = ref<string>("")
const character_setting = ref("你是一个很棒助手")
const submitable = ref(false)
const history = ref<ExhibitMessage[]>([]);

async function submit(force: boolean = false) {

  if (!force) {
    const message = user_messgae.value.trim();
    user_messgae.value = "";
    if (message.length <= 0) {
      return;
    }
    history.value.push(new ExhibitMessage({speaker: "user", text: message}));
  }

  submitable.value = true;
  try {
    let data = buildRequest();
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
    
  } catch (e) {
    console.log(e);
  } finally {
    submitable.value = false
  }
}

function buildRequest(): ChatReq {
  let req = new ChatReq(token.value, "gpt-3.5-turbo")
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

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string) as {speaker: string, text: string, select: Boolean}[];
        history.value = json.map(e => ExhibitMessage.from_temp(e));
      } catch (e) {
        console.error(e);
      }
    };
    reader.readAsText(file);
  }
}
</script>

<template>
  <div>
    <div>
      token: 
    <input type="text" v-model="token">
    </div>
    <div>
      描述GPT的设定:
    <textarea v-model="character_setting" rows="4" cols="50">
    </textarea>
    </div>
  </div>

  <div>
    <div v-for="each in history">
      <span><input type="checkbox" v-model="each.select"></span> <span>{{each.speaker}}</span>: <span>{{ each.text }}</span>
    </div>
  </div>

  <div>
    <textarea v-model="user_messgae" rows="4" cols="50"></textarea>
    <button type="button" :disabled="submitable" @click="submit()">提交</button>
    <button type="button" :disabled="submitable" @click="submit(true)">根据选择再生成一次</button>
    <button type="button" @click="export_txt()">导出当前的会话记录, 以便下次导入使用</button>
  </div>
  <div>
    <input type="file" @change="onFileChange" />
    <button type="button" @click="export_txt()">导出当前的会话记录, 以便下次导入使用</button>
  </div>
</template>

<style scoped>
</style>
