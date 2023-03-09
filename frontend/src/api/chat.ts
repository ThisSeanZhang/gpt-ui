
class ChatReq {
  token: string;
  model: string;
  messages: Message[];
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  user?: string;
  constructor(token: string, model: string) {
    this.token = token;
    this.model = model;
    this.messages = [];
  }
}

class Message {
  speaker: string;
  text: string;

  constructor(speaker:string, text: string) {
    this.speaker = speaker;
    this.text = text;
  }
}

class ExhibitMessage {
  speaker: string;
  text: string;
  select: boolean;

  constructor(msg: {speaker:string, text: string}) {
    this.speaker = msg.speaker;
    this.text = msg.text;
    this.select = true;
  }

  static from(msg: Message): ExhibitMessage {
    return new ExhibitMessage(msg);
  }

  static from_choice(choice: RespChoice): ExhibitMessage {
    return new ExhibitMessage({
      speaker:choice.message.speaker,
      text: choice.message.text
    });
  }
  static from_temp(msg: {speaker: string, text: string, select: Boolean}): ExhibitMessage {
    let result = new ExhibitMessage({
      speaker:msg.speaker,
      text: msg.text
    });
    result.select = msg.select;
    return result;
  }

  get exhibit_speaker(): string {
    if (this.speaker === 'user') {
      return "用户"
    } else if (this.speaker === 'assistant') {
      return "助手"
    } else {
      return ""
    }
  }

  to(): Message {
    return new Message(this.speaker, this.text);
  }
}

class RespChoice {
  index: number;
  message: Message;
  finish_reason: string;

  constructor(
    index: number,
    message: Message,
    finish_reason: string
  ) {
    this.index = index;
    this.message = message;
    this.finish_reason = finish_reason;
  }
}

class RespUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;

  constructor(prompt_tokens: number, completion_tokens: number, total_tokens: number) {
    this.prompt_tokens = prompt_tokens;
    this.completion_tokens = completion_tokens;
    this.total_tokens = total_tokens;
  }
}

class ChatResp {
  id: string;
  object: string;
  created: number;
  choices: RespChoice[];
  usage: RespUsage;

  constructor(
    id: string,
    object: string,
    created: number,
    choices: RespChoice[],
    usage: RespUsage
  ) {
    this.id = id;
    this.object = object;
    this.created = created;
    this.choices = choices;
    this.usage = usage;
  }
}

export {
  ChatReq,
  ChatResp,
  Message,
  ExhibitMessage,
  RespChoice,
  RespUsage,
}
