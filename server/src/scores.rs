//! The leaderboard rules, kept free of any HTTP library so both entry points share them.

use crate::db::{Location, NewScore};

/// Vercel sets this on every request, from the visitor's IP.
/// We store only the country, never the IP itself.
pub const COUNTRY_HEADER: &str = "x-vercel-ip-country";

/// How many scores `GET /api/scores` returns.
pub const LEADERBOARD_SIZE: u32 = 10;

/// Refuse bodies bigger than this. A score submission is a few dozen bytes.
pub const MAX_BODY_BYTES: usize = 16 * 1024;

const MAX_NAME_CHARS: usize = 24;
const MAX_SCORE: i64 = 1_000_000;

/// Turn a request body and the country header into a score ready to save,
/// or a message explaining what is wrong with it.
pub fn parse_submission(body: &[u8], country_header: Option<&str>) -> Result<NewScore, String> {
    let new: NewScore =
        serde_json::from_slice(body).map_err(|e| format!("invalid JSON body: {e}"))?;

    let name = new.name.trim().to_string();
    if name.is_empty() || name.chars().count() > MAX_NAME_CHARS {
        return Err(format!("name must be 1 to {MAX_NAME_CHARS} characters"));
    }
    if new.score < 0 || new.score > MAX_SCORE {
        return Err("score is out of range".to_string());
    }

    Ok(NewScore {
        name,
        score: new.score,
        country: country_from(country_header),
    })
}

/// The visitor's country as a two-letter code, or None when the header is missing or junk.
pub fn country_from(header: Option<&str>) -> Option<String> {
    let code = header?.trim().to_ascii_uppercase();
    let looks_valid = code.len() == 2 && code.bytes().all(|b| b.is_ascii_uppercase());
    // "XX" is the conventional "unknown" code; treat it like a missing header.
    (looks_valid && code != "XX").then_some(code)
}

/// Turso from `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`, or an error if the URL is missing.
/// The Vercel function uses this: its filesystem is read-only, so a local file is never an option.
pub fn turso_from_env() -> anyhow::Result<Location> {
    let url = std::env::var("TURSO_DATABASE_URL").unwrap_or_default();
    if url.trim().is_empty() {
        anyhow::bail!("TURSO_DATABASE_URL is not set");
    }
    // A local `turso dev` server needs no token, so a missing one is not an error here.
    let auth_token = std::env::var("TURSO_AUTH_TOKEN").unwrap_or_default();
    Ok(Location::Remote { url, auth_token })
}

/// Turso when `TURSO_DATABASE_URL` is set, otherwise a local SQLite file from `SCORES_DB`
/// (default `scores.db`). Used by the local dev server.
#[cfg(feature = "local")]
pub fn location_from_env() -> Location {
    turso_from_env().unwrap_or_else(|_| Location::Local {
        path: std::env::var("SCORES_DB").unwrap_or_else(|_| "scores.db".to_string()),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_and_trims_a_valid_score() {
        let s = parse_submission(br#"{"name":"  ebuka ","score":420}"#, Some("ng")).unwrap();
        assert_eq!(s.name, "ebuka");
        assert_eq!(s.score, 420);
        assert_eq!(s.country.as_deref(), Some("NG"));
    }

    #[test]
    fn ignores_country_sent_in_the_body() {
        let s = parse_submission(br#"{"name":"a","score":1,"country":"US"}"#, None).unwrap();
        assert_eq!(s.country, None);
    }

    #[test]
    fn rejects_bad_input() {
        assert!(parse_submission(b"nope", None).is_err());
        assert!(parse_submission(br#"{"name":"   ","score":1}"#, None).is_err());
        assert!(parse_submission(br#"{"name":"a","score":-1}"#, None).is_err());
        assert!(parse_submission(br#"{"name":"a","score":1000001}"#, None).is_err());
        let longest = format!(r#"{{"name":"{}","score":1}}"#, "x".repeat(24));
        assert!(parse_submission(longest.as_bytes(), None).is_ok());
        let long = format!(r#"{{"name":"{}","score":1}}"#, "x".repeat(25));
        assert!(parse_submission(long.as_bytes(), None).is_err());
    }

    #[test]
    fn filters_junk_country_headers() {
        assert_eq!(country_from(Some("<script>")), None);
        assert_eq!(country_from(Some("XX")), None);
        assert_eq!(country_from(Some("USA")), None);
        assert_eq!(country_from(Some(" jp ")).as_deref(), Some("JP"));
    }
}
