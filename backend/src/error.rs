use async_openai::error::OpenAIError;
use thiserror::Error;
use std::io;

#[derive(Error, Debug)]
pub enum GPTError {
    #[error("{0}")]
    Io(#[from] io::Error),

    #[error("{0}")]
    Serde(#[from] serde_json::Error),

    #[error("{0}")]
    OpenAIError(#[from] OpenAIError),
    
    #[error("Unexpected Role")]
    UnexpectedRole,

    #[error("Server Is Busy Now")]
    ServerIsBusy,

}

/// Result type for kvs.
pub type Result<T> = std::result::Result<T, GPTError>;
