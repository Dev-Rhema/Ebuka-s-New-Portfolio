use server::{
    db::{Db, Location},
    scores,
};
use tokio::{io::BufStream, net::TcpListener};
use tracing::{error, info};

mod req;
mod res;

use req::{Method, Request};
use res::{Reply, Response, Status};

static DEFAULT_PORT: &str = "8080";
static NOT_FOUND_PAGE: &str = include_str!("../static/404.html");

/// The local development server. In production the same routes are served by the
/// Vercel function in `../api/scores.rs`, which shares the `server` library with this file.
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize the default tracing subscriber.
    tracing_subscriber::fmt::init();

    let port: u16 = std::env::args()
        .nth(1)
        .unwrap_or_else(|| DEFAULT_PORT.to_string())
        .parse()?;

    // Open the database once, before accepting anything, so bad config fails loudly at startup.
    let location = scores::location_from_env()?;
    match &location {
        Location::Remote { url, .. } => info!(%url, "using Turso database"),
        Location::Local { path } => info!(%path, "using local database file"),
    }
    let db = Db::open(location).await?;

    let listener = TcpListener::bind(format!("0.0.0.0:{port}")).await?;
    info!("listening on: {}", listener.local_addr()?);

    loop {
        let (stream, addr) = listener.accept().await?;
        let mut stream = BufStream::new(stream);
        let db = db.clone();

        tokio::spawn(async move {
            info!(?addr, "new connection");

            let response = match req::parse_request(&mut stream).await {
                Ok(req) => {
                    info!(method = ?req.method, path = %req.path, "incoming request");
                    handle(req, db).await
                }
                Err(e) => {
                    info!(?e, "failed to parse request");
                    bad_request("malformed request")
                }
            };

            if let Err(e) = response.write(&mut stream).await {
                error!(?e, "failed to write response");
            }
        });
    }
}

/// The whole router: match on (method, path), top to bottom.
async fn handle(req: Request, db: Db) -> Reply {
    match (req.method, req.path.as_str()) {
        (Method::Get, "/api/scores") => get_scores(db).await,
        (Method::Post, "/api/scores") => post_score(req, db).await,
        (Method::Get, _) => Response::from_html(Status::NotFound, NOT_FOUND_PAGE),
        _ => Response::from_json(
            Status::MethodNotAllowed,
            &serde_json::json!({ "error": "method not allowed" }),
        ),
    }
}

async fn get_scores(db: Db) -> Reply {
    match db.top_scores(scores::LEADERBOARD_SIZE).await {
        Ok(scores) => Response::from_json(Status::Ok, &scores),
        Err(e) => {
            error!(?e, "could not read scores");
            internal_error()
        }
    }
}

async fn post_score(req: Request, db: Db) -> Reply {
    let country = req.headers.get(scores::COUNTRY_HEADER).map(String::as_str);
    let new = match scores::parse_submission(&req.body, country) {
        Ok(new) => new,
        Err(message) => return bad_request(&message),
    };

    match db.insert_score(&new).await {
        Ok(()) => Response::from_json(Status::Created, &serde_json::json!({ "ok": true })),
        Err(e) => {
            error!(?e, "could not save score");
            internal_error()
        }
    }
}

fn bad_request(message: &str) -> Reply {
    Response::from_json(Status::BadRequest, &serde_json::json!({ "error": message }))
}

fn internal_error() -> Reply {
    Response::from_json(
        Status::InternalServerError,
        &serde_json::json!({ "error": "something went wrong" }),
    )
}
