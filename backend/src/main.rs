use std::{path::PathBuf, env, sync::Mutex, collections::HashMap, net::SocketAddr};

use actix_files::Files;
use actix_web::{App, HttpResponse, HttpServer, post, web};
use clap::Parser;

use async_openai::Client;

#[macro_use]
extern crate log;

use crate::{api::{ChatReq, ChatResp}, error::GPTError};
mod api;
mod error;

fn get_default_web_root() -> std::io::Result<PathBuf> {
    env::current_dir().map(|path| path.join("static"))
}

#[derive(Parser)]
struct Args {
    
    #[arg(short, long)]
    web_path: Option<PathBuf>,

    #[arg(value_name = "IP:PORT",
        long,
        default_value = "0.0.0.0:65525",
    )]
    addr: SocketAddr,

    #[arg(value_name = "LogLevel",
        long,
        default_value = "info",
    )]
    log_level: String,
}

#[post("/request_model")]
async fn request_model(clients: web::Data<Mutex<HashMap<String, Client>>>, chat_req: web::Json<ChatReq>) -> HttpResponse {
    info!("Request: {chat_req:?}");
    let token = chat_req.0.token.clone();

    if token.len() == 0 {
        return HttpResponse::BadRequest().body("请填入 API KEY");
    }

    let client = {
        if let Ok(mut clients_lock) = clients.try_lock() {
            clients_lock.entry(token.clone()).or_insert_with(|| {
                let client = Client::new();
                client.with_api_key(token)
            }).clone()
        } else {
            return HttpResponse::ServiceUnavailable().body(GPTError::ServerIsBusy.to_string())
        }
    };

    let resp = match  chat_req.0.into_chat_req() {
        Ok(req) => {
            let resp = client.chat().create(req).await;
            drop(client);
            match resp {
                Ok(resp) => Ok(resp),
                Err(e) => Err(GPTError::OpenAIError(e))
            }
        },
        Err(e) => {
            Err(e)
        }
    };

    match resp {
        Ok(resp) => {
            let resp = ChatResp::from_chatresp(resp);
            info!("Response: {resp:?}");
            HttpResponse::Ok().json(resp)
        },
        Err(e) => {
            HttpResponse::InternalServerError().body(e.to_string())
        }
    }
}


async fn not_found() -> HttpResponse {
    HttpResponse::NotFound().body("Not Found")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let args = Args::parse();
    env::set_var("RUST_LOG", args.log_level);
    env_logger::init();

    let share_clinet = web::Data::new(Mutex::new(HashMap::<String, Client>::new()));
    let web_path = args.web_path.unwrap_or_else(|| get_default_web_root().unwrap());

    info!("using webroot folder: {:?}", web_path);
    info!("listening address: {:?}", args.addr);
    
    HttpServer::new(move ||  {
        App::new()
            .app_data(share_clinet.clone())
            .service(request_model)
            .service(
                Files::new("/", web_path.clone())
                    .index_file("index.html")
                    .show_files_listing(),
            )
            .default_service(actix_web::web::route().to(not_found))
    })
    .bind(args.addr)?
    .run()
    .await
}