import {
  applyCorsHeaders,
  readJsonBody,
  sendJson,
  sendNoContent,
  type ServerlessRequest,
  type ServerlessResponse,
} from './_lib/http.js';
import {
  generateOutfitRecommendation,
  RecommendationServiceError,
  validateRecommendPayload,
} from './_lib/recommendOutfit.js';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  applyCorsHeaders(req, res, 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    sendNoContent(res);
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  let parsedBody: unknown;
  try {
    parsedBody = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON request body.' });
    return;
  }

  const validatedInput = validateRecommendPayload(parsedBody);
  if (!validatedInput) {
    sendJson(res, 400, { error: 'Invalid request parameters.' });
    return;
  }

  try {
    const recommendation = await generateOutfitRecommendation(validatedInput);
    sendJson(res, 200, recommendation);
  } catch (error) {
    if (error instanceof RecommendationServiceError) {
      sendJson(res, error.statusCode, { error: error.message });
      return;
    }
    console.error('Unexpected recommendation handler error:', error);
    sendJson(res, 500, { error: 'Internal server error.' });
  }
}
