import type { IncomingMessage, ServerResponse } from 'node:http';

export interface ServerlessRequest extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
}

export interface ServerlessResponse extends ServerResponse {
  status?: (statusCode: number) => ServerlessResponse;
  json?: (body: unknown) => void;
  send?: (body: string | Buffer) => void;
}

const MAX_BODY_BYTES = 64 * 1024;

export function applyCorsHeaders(
  req: ServerlessRequest,
  res: ServerlessResponse,
  allowedMethods: string
): void {
  const configuredOrigin = process.env.ALLOWED_ORIGIN?.trim();
  const requestOrigin = req.headers.origin;

  if (configuredOrigin && configuredOrigin !== '*') {
    const allowedList = configuredOrigin
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (requestOrigin && allowedList.includes(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      res.setHeader('Vary', 'Origin');
    } else if (allowedList.length > 0) {
      res.setHeader('Access-Control-Allow-Origin', allowedList[0]);
      res.setHeader('Vary', 'Origin');
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', allowedMethods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export function sendJson(
  res: ServerlessResponse,
  statusCode: number,
  payload: unknown
): void {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    const statusRes = res.status(statusCode);
    if (typeof statusRes.json === 'function') {
      statusRes.json(payload);
      return;
    }
  }

  res.statusCode = statusCode;
  res.end(JSON.stringify(payload));
}

export function sendNoContent(res: ServerlessResponse): void {
  res.statusCode = 204;
  res.end();
}

export function getQueryParam(
  req: ServerlessRequest,
  key: string
): string | undefined {
  const queryValue = req.query?.[key];
  if (typeof queryValue === 'string') {
    return queryValue;
  }
  if (Array.isArray(queryValue) && typeof queryValue[0] === 'string') {
    return queryValue[0];
  }

  const rawUrl = req.url ?? '';
  try {
    const parsedUrl = new URL(rawUrl, 'http://localhost');
    return parsedUrl.searchParams.get(key) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function readJsonBody(req: ServerlessRequest): Promise<unknown> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      return JSON.parse(req.body);
    }
    if (Buffer.isBuffer(req.body)) {
      return JSON.parse(req.body.toString('utf8'));
    }
    return req.body;
  }

  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += bufferChunk.length;
    if (totalBytes > MAX_BODY_BYTES) {
      throw new Error('Request body too large');
    }
    chunks.push(bufferChunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) {
    return {};
  }

  return JSON.parse(raw);
}
