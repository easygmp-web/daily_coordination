import {
  applyCorsHeaders,
  sendJson,
  sendNoContent,
  type ServerlessRequest,
  type ServerlessResponse,
} from './_lib/http.js';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  applyCorsHeaders(req, res, 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    sendNoContent(res);
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    nodeVersion: process.version,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    timestamp: new Date().toISOString(),
  });
}
