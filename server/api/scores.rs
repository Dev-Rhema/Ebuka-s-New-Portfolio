//! `GET /api/scores` and `POST /api/scores` as a Vercel Function.
//!
//! All the real work lives in the `server` library, shared with the local dev server.
//! This file only translates between Vercel's request/response types and that library,
//! and adds the CORS headers the frontend needs, since it lives on a different domain.

use http_body_util::{BodyExt, Limited};
use serde_json::{Value, json};
use server::{db::Db, scores};
use tokio::sync::OnceCell;
use vercel_runtime::{Error, Request, Response, run, service_fn};

/// One database handle per function instance. Vercel reuses warm instances across
/// requests, so this is opened on the first request and kept for the ones after it.
static DB: OnceCell<Db> = OnceCell::const_new();

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(handler)).await
}

async fn handler(req: Request) -> Result<Response<String>, Error> {
    let origin = req
        .headers()
        .get("origin")
        .and_then(|v| v.to_str().ok())
        .map(str::to_owned);

    let mut reply = match req.method().as_str() {
        "GET" => get_scores().await,
        "POST" => post_score(req).await,
        // Browsers send this "preflight" before a cross-origin POST with a JSON body.
        "OPTIONS" => empty_reply(204),
        _ => json_reply(405, json!({ "error": "method not allowed" })),
    };

    add_cors_headers(&mut reply, origin.as_deref());
    Ok(reply)
}

async fn get_scores() -> Response<String> {
    let db = match db().await {
        Ok(db) => db,
        Err(reply) => return reply,
    };

    match db.top_scores(scores::LEADERBOARD_SIZE).await {
        Ok(rows) => json_reply(200, json!(rows)),
        Err(e) => {
            eprintln!("could not read scores: {e:?}");
            internal_error()
        }
    }
}

async fn post_score(req: Request) -> Response<String> {
    let country = req
        .headers()
        .get(scores::COUNTRY_HEADER)
        .and_then(|v| v.to_str().ok())
        .map(str::to_owned);

    // Limited stops reading once the body passes the cap, so a huge upload can't exhaust memory.
    let body = match Limited::new(req.into_body(), scores::MAX_BODY_BYTES).collect().await {
        Ok(collected) => collected.to_bytes(),
        Err(_) => return json_reply(400, json!({ "error": "body too large or unreadable" })),
    };

    let new = match scores::parse_submission(&body, country.as_deref()) {
        Ok(new) => new,
        Err(message) => return json_reply(400, json!({ "error": message })),
    };

    let db = match db().await {
        Ok(db) => db,
        Err(reply) => return reply,
    };

    match db.insert_score(&new).await {
        Ok(()) => json_reply(201, json!({ "ok": true })),
        Err(e) => {
            eprintln!("could not save score: {e:?}");
            internal_error()
        }
    }
}

/// The shared database handle, opened on first use. A failed open is not cached,
/// so the next request tries again instead of the instance staying broken.
async fn db() -> Result<&'static Db, Response<String>> {
    DB.get_or_try_init(|| async { Db::open(scores::turso_from_env()?).await })
        .await
        .map_err(|e: anyhow::Error| {
            eprintln!("could not open database: {e:?}");
            internal_error()
        })
}

/// Tell browsers which sites may call this API.
///
/// With `ALLOWED_ORIGINS` unset, any site may read the leaderboard, which is fine for public
/// data. Set it to a comma-separated list (for example `https://ebuka.dev,http://localhost:5173`)
/// to limit browser access to those sites. This does not stop non-browser clients like curl.
fn add_cors_headers(reply: &mut Response<String>, origin: Option<&str>) {
    let allowed = std::env::var("ALLOWED_ORIGINS").unwrap_or_default();
    let allow_origin = if allowed.trim().is_empty() {
        Some("*".to_string())
    } else {
        origin
            .filter(|o| allowed.split(',').any(|a| a.trim() == *o))
            .map(str::to_owned)
    };

    let headers = reply.headers_mut();
    if let Some(value) = allow_origin.and_then(|v| v.parse().ok()) {
        headers.insert("Access-Control-Allow-Origin", value);
    }
    // The answer depends on the Origin header, so caches must not mix answers between sites.
    headers.insert("Vary", "Origin".parse().unwrap());
    headers.insert("Access-Control-Allow-Methods", "GET, POST, OPTIONS".parse().unwrap());
    headers.insert("Access-Control-Allow-Headers", "Content-Type".parse().unwrap());
    headers.insert("Access-Control-Max-Age", "86400".parse().unwrap());
}

fn json_reply(status: u16, body: Value) -> Response<String> {
    Response::builder()
        .status(status)
        .header("Content-Type", "application/json")
        // Scores change constantly; never let Vercel's CDN or the browser cache them.
        .header("Cache-Control", "no-store")
        .body(body.to_string())
        .expect("static status and headers are valid")
}

fn empty_reply(status: u16) -> Response<String> {
    Response::builder()
        .status(status)
        .body(String::new())
        .expect("static status is valid")
}

fn internal_error() -> Response<String> {
    json_reply(500, json!({ "error": "something went wrong" }))
}
