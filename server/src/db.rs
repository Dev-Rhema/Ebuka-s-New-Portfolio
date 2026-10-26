use libsql::{Builder, Connection, Database, params};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

/// The first version of the schema. `IF NOT EXISTS` makes it safe to run on every start.
const SCHEMA: &str = "
CREATE TABLE IF NOT EXISTS scores (
    id         INTEGER PRIMARY KEY,
    name       TEXT    NOT NULL,
    score      INTEGER NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS scores_by_score ON scores (score DESC, created_at ASC);
CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL);
";

/// Schema changes after the first version, applied in order. The `schema_version` table
/// records how many have run, so each one runs exactly once per database. A table is used
/// instead of `PRAGMA user_version` because it behaves the same on Turso and on a local file.
const MIGRATIONS: &[&str] = &[
    // 1: country code (ISO 3166-1 alpha-2, e.g. "NG") taken from the proxy's geo header.
    "ALTER TABLE scores ADD COLUMN country TEXT;",
];

/// One row as we send it to the browser.
#[derive(Debug, Clone, Serialize)]
pub struct Score {
    pub name: String,
    pub score: i64,
    pub country: Option<String>,
    pub created_at: String,
}

/// What the browser sends us when a game ends.
#[derive(Debug, Clone, Deserialize)]
pub struct NewScore {
    pub name: String,
    pub score: i64,
    /// Filled in by the server from request headers, never from the JSON body.
    #[serde(skip_deserializing)]
    pub country: Option<String>,
}

/// Where the data lives.
pub enum Location {
    /// A Turso database, reached over HTTPS.
    Remote { url: String, auth_token: String },
    /// A plain SQLite file on disk, for local development.
    #[cfg(feature = "local")]
    Local { path: String },
}

/// Cheap to clone: every clone shares the same connection.
#[derive(Clone)]
pub struct Db {
    // Kept so the database outlives every connection made from it.
    _database: Arc<Database>,
    conn: Connection,
}

impl Db {
    pub async fn open(location: Location) -> anyhow::Result<Self> {
        let (database, is_local) = match location {
            Location::Remote { url, auth_token } => {
                (Builder::new_remote(url, auth_token).build().await?, false)
            }
            #[cfg(feature = "local")]
            Location::Local { path } => (Builder::new_local(path).build().await?, true),
        };
        let conn = database.connect()?;

        if is_local {
            // Turso manages these for you; a local file needs them set. Both return a row,
            // so they go through `query` rather than `execute`.
            conn.query("PRAGMA journal_mode = WAL", ()).await?;
            conn.query("PRAGMA busy_timeout = 5000", ()).await?;
        }

        conn.execute_batch(SCHEMA).await?;
        migrate(&conn).await?;

        Ok(Self {
            _database: Arc::new(database),
            conn,
        })
    }

    pub async fn top_scores(&self, limit: u32) -> anyhow::Result<Vec<Score>> {
        let mut rows = self
            .conn
            .query(
                "SELECT name, score, country, created_at
                 FROM scores
                 ORDER BY score DESC, created_at ASC
                 LIMIT ?1",
                params![limit],
            )
            .await?;

        let mut scores = Vec::new();
        while let Some(row) = rows.next().await? {
            scores.push(Score {
                name: row.get(0)?,
                score: row.get(1)?,
                country: row.get(2)?,
                created_at: row.get(3)?,
            });
        }
        Ok(scores)
    }

    pub async fn insert_score(&self, new: &NewScore) -> anyhow::Result<()> {
        self.conn
            .execute(
                "INSERT INTO scores (name, score, country) VALUES (?1, ?2, ?3)",
                params![new.name.as_str(), new.score, new.country.clone()],
            )
            .await?;
        Ok(())
    }
}

async fn migrate(conn: &Connection) -> anyhow::Result<()> {
    let mut rows = conn
        .query("SELECT COALESCE(MAX(version), 0) FROM schema_version", ())
        .await?;
    let applied: i64 = match rows.next().await? {
        Some(row) => row.get(0)?,
        None => 0,
    };

    for (i, sql) in MIGRATIONS.iter().enumerate().skip(applied as usize) {
        let version = i + 1;
        // One transaction per migration: the change and the version record land together or not at all.
        conn.execute_transactional_batch(&format!(
            "{sql} INSERT INTO schema_version (version) VALUES ({version});"
        ))
        .await?;
    }

    Ok(())
}
