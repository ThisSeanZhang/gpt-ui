use async_openai::types::{CreateChatCompletionRequestArgs, CreateChatCompletionRequest, ChatCompletionRequestMessageArgs, Role, CreateChatCompletionResponse, ChatChoice, ChatCompletionResponseMessage, Usage};
use serde::{Deserialize, Serialize};

use crate::error::{Result, GPTError};

#[derive(Serialize, Deserialize, Debug)]
pub struct ChatReq {
    pub token:String,
    pub model: String,
    pub messages: Vec<Message>,
    pub temperature: Option<f64>,
    pub top_p: Option<f64>,
    pub n: Option<i32>,
    pub stream: Option<bool>,
    pub stop: Option<Vec<String>>,
    pub max_tokens: Option<u16>,
    pub presence_penalty: Option<f64>,
    pub frequency_penalty: Option<f64>,
    pub logit_bias: Option<std::collections::HashMap<String, f64>>,
    pub user: Option<String>
}

impl ChatReq {
    pub fn into_chat_req(self) -> Result<CreateChatCompletionRequest> {
      
      let mut messages = vec![];
      for each in self.messages {
        let role = match each.speaker.as_str() {
            "system" => Role::System,
            "user" => Role::User,
            "assistant" => Role::Assistant,
            _ => return Err(GPTError::UnexpectedRole)
        };
        
        messages.push(ChatCompletionRequestMessageArgs::default()
        .role(role)
        .content(each.text)
        .build()?);
      }
      CreateChatCompletionRequestArgs::default()
        .max_tokens(self.max_tokens.unwrap_or(512u16))
        .model(self.model)
        .messages(messages)
        .build()
        .map_err(GPTError::OpenAIError)
    }
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct Message {
  speaker: String,
  text: String
}

impl Message {
  fn from_chat(message: ChatCompletionResponseMessage) -> Message {
    let ChatCompletionResponseMessage{role, content} = message;
    let speaker = match role {
      Role::System => "system",
      Role::User => "user",
      Role::Assistant => "assistant",
    }.to_owned();

    Message {
      speaker,
      text: content,
    }
  }
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct RespChoice {
  index: u32,
  message: Message,
  finish_reason: Option<String>
}

impl RespChoice {
  fn from_choice(chat: ChatChoice ) -> RespChoice {
    let ChatChoice { index, message, finish_reason } = chat;
    RespChoice {
        index,
        message: Message::from_chat(message),
        finish_reason
    }
  }
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct RespUsage {
  prompt_tokens:u32,
  completion_tokens:u32,
  total_tokens:u32
}

impl RespUsage {
  fn from_chat_usage(usage: Option<Usage>) -> Option<RespUsage>{
    if let Some(Usage{ prompt_tokens, completion_tokens, total_tokens }) = usage {
        Some(RespUsage{
          prompt_tokens, completion_tokens, total_tokens
        })
    } else {
      None
    }
  }
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct ChatResp {
  id:String,
  object:String,
  created:u32,
  choices: Vec<RespChoice>,
  usage: Option<RespUsage>
}

impl ChatResp {
  pub fn from_chatresp(result: CreateChatCompletionResponse) -> ChatResp {
    let CreateChatCompletionResponse {id, object, created ,choices: chat_choices, usage, ..} = result;
    let mut choices = vec![];
    for choice in chat_choices {
      choices.push(RespChoice::from_choice(choice));
    }
    ChatResp { id, object, created, choices, usage:RespUsage::from_chat_usage(usage) }
  }
}
