use maplit::hashmap;
use std::{
    collections::HashMap,
    fmt::{Display, Formatter},
    io::Cursor,
};
use tokio::io::{AsyncRead, AsyncWrite, AsyncWriteExt};

/// A response whose body is already in memory. Every handler returns one of these.
pub type Reply = Response<Cursor<Vec<u8>>>;

#[derive(Debug, Clone)]
pub struct Response<S: AsyncRead + Unpin> {
    pub status: Status,
    pub headers: HashMap<String, String>,
    pub data: S,
}

#[derive(Debug, Copy, Clone, Eq, PartialEq, Hash)]
pub enum Status {
    Ok,
    Created,
    BadRequest,
    NotFound,
    MethodNotAllowed,
    InternalServerError,
}

impl Display for Status {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        let text = match self {
            Status::Ok => "200 OK",
            Status::Created => "201 Created",
            Status::BadRequest => "400 Bad Request",
            Status::NotFound => "404 Not Found",
            Status::MethodNotAllowed => "405 Method Not Allowed",
            Status::InternalServerError => "500 Internal Server Error",
        };
        write!(f, "{text}")
    }
}

impl Reply {
    fn from_bytes(status: Status, content_type: &str, bytes: Vec<u8>) -> Self {
        let headers = hashmap! {
            "Content-Type".to_string() => content_type.to_string(),
            "Content-Length".to_string() => bytes.len().to_string(),
            // We serve one request per connection, so tell the client not to wait for more.
            "Connection".to_string() => "close".to_string(),
        };

        Self {
            status,
            headers,
            data: Cursor::new(bytes),
        }
    }

    pub fn from_html(status: Status, data: impl ToString) -> Self {
        Self::from_bytes(status, "text/html; charset=utf-8", data.to_string().into_bytes())
    }

    pub fn from_json(status: Status, value: &impl serde::Serialize) -> Self {
        match serde_json::to_vec(value) {
            Ok(bytes) => Self::from_bytes(status, "application/json", bytes),
            Err(_) => Self::from_bytes(
                Status::InternalServerError,
                "application/json",
                br#"{"error":"could not encode response"}"#.to_vec(),
            ),
        }
    }
}

impl<S: AsyncRead + Unpin> Response<S> {
    pub fn status_and_headers(&self) -> String {
        let headers = self
            .headers
            .iter()
            .map(|(k, v)| format!("{}: {}", k, v))
            .collect::<Vec<_>>()
            .join("\r\n");

        format!("HTTP/1.1 {}\r\n{headers}\r\n\r\n", self.status)
    }

    pub async fn write<O: AsyncWrite + Unpin>(mut self, stream: &mut O) -> anyhow::Result<()> {
        stream
            .write_all(self.status_and_headers().as_bytes())
            .await?;
        tokio::io::copy(&mut self.data, stream).await?;
        stream.flush().await?;
        Ok(())
    }
}
