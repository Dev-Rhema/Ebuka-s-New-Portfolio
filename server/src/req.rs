use anyhow::Ok;
use server::scores::MAX_BODY_BYTES;
use std::collections::HashMap;
use tokio::io::{AsyncBufRead, AsyncBufReadExt, AsyncReadExt};


#[derive(Debug, Clone, Eq, PartialEq)]
pub struct Request {
    pub method: Method,
    pub path: String,
    pub headers: HashMap<String, String>,
    pub body: Vec<u8>,
}

#[derive(Debug, Copy, Clone, Eq, PartialEq, Hash)]
pub enum Method {
    Get,
    Post,
    Options,
}

impl TryFrom<&str> for Method {
    type Error = anyhow::Error;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "GET" => Ok(Method::Get),
            "POST" => Ok(Method::Post),
            "OPTIONS" => Ok(Method::Options),
            m => Err(anyhow::anyhow!("unsupported method: {m}")),
        }
    }
}

pub async fn parse_request(mut stream: impl AsyncBufRead + Unpin) -> anyhow::Result<Request> {
    let mut line_buffer = String::new();
    stream.read_line(&mut line_buffer).await?;

    let mut parts = line_buffer.split_whitespace();

    let method: Method = parts
        .next()
        .ok_or(anyhow::anyhow!("missing method"))
        .and_then(TryInto::try_into)?;

    let path: String = parts
        .next()
        .ok_or(anyhow::anyhow!("missing path"))
        .map(Into::into)?;

    let mut headers = HashMap::new();

    loop {
        line_buffer.clear();
        stream.read_line(&mut line_buffer).await?;

        if line_buffer.is_empty() || line_buffer == "\n" || line_buffer == "\r\n" {
            break;
        }

        // Split only at the first colon so values like "localhost:8080" survive.
        let (key, value) = line_buffer
            .split_once(':')
            .ok_or(anyhow::anyhow!("malformed header line"))?;

        // Header names are case-insensitive; values are not, so leave them alone.
        headers.insert(key.trim().to_ascii_lowercase(), value.trim().to_string());
    }

    let chunked = headers
        .get("transfer-encoding")
        .is_some_and(|v| v.eq_ignore_ascii_case("chunked"));

    let body = if chunked {
        read_chunked_body(&mut stream).await?
    } else {
        let content_length: usize = headers
            .get("content-length")
            .map(|v| v.parse())
            .transpose()?
            .unwrap_or(0);

        if content_length > MAX_BODY_BYTES {
            anyhow::bail!("body too large: {content_length} bytes");
        }

        let mut body = vec![0; content_length];
        stream.read_exact(&mut body).await?;
        body
    };

    Ok(Request {
        method,
        path,
        headers,
        body,
    })
}

/// Read a body sent with `Transfer-Encoding: chunked`, used when the sender doesn't know
/// the length up front. Each chunk is a hex size line, that many bytes, then a blank line,
/// and a chunk of size 0 marks the end.
async fn read_chunked_body(stream: &mut (impl AsyncBufRead + Unpin)) -> anyhow::Result<Vec<u8>> {
    let mut body = Vec::new();
    let mut line = String::new();

    loop {
        line.clear();
        stream.read_line(&mut line).await?;
        // The size can be followed by ";extension", which we ignore.
        let size_text = line.split(';').next().unwrap_or("").trim();
        let size = usize::from_str_radix(size_text, 16)
            .map_err(|_| anyhow::anyhow!("bad chunk size: {size_text:?}"))?;

        if size == 0 {
            // Skip optional trailer headers up to the final blank line.
            loop {
                line.clear();
                let read = stream.read_line(&mut line).await?;
                if read == 0 || line == "\r\n" || line == "\n" {
                    break;
                }
            }
            return Ok(body);
        }

        if body.len() + size > MAX_BODY_BYTES {
            anyhow::bail!("body too large");
        }

        let start = body.len();
        body.resize(start + size, 0);
        stream.read_exact(&mut body[start..]).await?;

        // Each chunk's data is followed by CRLF.
        line.clear();
        stream.read_line(&mut line).await?;
    }
}
