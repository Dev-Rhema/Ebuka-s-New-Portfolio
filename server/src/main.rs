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

/// Runs locally with `cargo run`, and on Vercel, which starts this binary and forwards
/// requests to it on the port given in the PORT environment variable.
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize the default tracing subscriber.
    tracing_subscriber::fmt::init();

    // PORT (set by Vercel), then the first argument, then 8080.
    let port: u16 = std::env::var("PORT")
        .ok()
        .or_else(|| std::env::args().nth(1))
        .unwrap_or_else(|| DEFAULT_PORT.to_string())
        .parse()?;

    // Open the database once, before accepting anything, so bad config fails loudly at startup.
    // Vercel's filesystem is read-only, so there it must be Turso; locally a file is fine.
    let on_vercel = std::env::var("VERCEL").is_ok();
    let location = if on_vercel {
        scores::turso_from_env()?
    } else {
        scores::location_from_env()
    };
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
                    let origin = req.headers.get("origin").cloned();
                    let mut reply = handle(req, db).await;
                    add_cors_headers(&mut reply, origin.as_deref());
                    reply
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
        // Browsers send this "preflight" before a cross-origin POST with a JSON body.
        (Method::Options, _) => Response::empty(Status::NoContent),
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

/// Tell browsers which sites may call this API. The frontend lives on a different domain.
///
/// With `ALLOWED_ORIGINS` unset, any site may read the leaderboard, which is fine for public
/// data. Set it to a comma-separated list (for example `https://ebuka.dev,http://localhost:5173`)
/// to limit browser access to those sites. This does not stop non-browser clients like curl.
fn add_cors_headers(reply: &mut Reply, origin: Option<&str>) {
    let allowed = std::env::var("ALLOWED_ORIGINS").unwrap_or_default();
    let allow_origin = if allowed.trim().is_empty() {
        Some("*".to_string())
    } else {
        origin
            .filter(|o| allowed.split(',').any(|a| a.trim() == *o))
            .map(str::to_owned)
    };

    let headers = &mut reply.headers;
    if let Some(value) = allow_origin {
        headers.insert("Access-Control-Allow-Origin".into(), value);
    }
    // The answer depends on the Origin header, so caches must not mix answers between sites.
    headers.insert("Vary".into(), "Origin".into());
    headers.insert("Access-Control-Allow-Methods".into(), "GET, POST, OPTIONS".into());
    headers.insert("Access-Control-Allow-Headers".into(), "Content-Type".into());
    headers.insert("Access-Control-Max-Age".into(), "86400".into());
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
