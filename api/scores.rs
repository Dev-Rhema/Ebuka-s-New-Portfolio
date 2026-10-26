//! `GET /api/scores` and `POST /api/scores` as a Vercel Function.
//!
//! All the real work lives in the `server` library, shared with the local dev server.
//! This file only translates between Vercel's request/response types and that library.

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
    let reply = match req.method().as_str() {
        "GET" => get_scores().await,
        "POST" => post_score(req).await,
        _ => json_reply(405, json!({ "error": "method not allowed" })),
    };
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
    DB.get_or_try_init(|| async { Db::open(scores::location_from_env()?).await })
        .await
        .map_err(|e: anyhow::Error| {
            eprintln!("could not open database: {e:?}");
            internal_error()
        })
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

fn internal_error() -> Response<String> {
    json_reply(500, json!({ "error": "something went wrong" }))
}
