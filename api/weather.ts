import {
  applyCorsHeaders,
  getQueryParam,
  sendJson,
  sendNoContent,
  type ServerlessRequest,
  type ServerlessResponse,
} from './_lib/http.js';
import {
  fetchWeatherData,
  parseCoordinates,
  WeatherServiceError,
} from './_lib/weather.js';

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

  const coords = parseCoordinates(
    getQueryParam(req, 'lat'),
    getQueryParam(req, 'lon')
  );
  if (!coords) {
    sendJson(res, 400, { error: 'Invalid latitude or longitude.' });
    return;
  }

  try {
    const weather = await fetchWeatherData(coords.lat, coords.lon);
    sendJson(res, 200, weather);
  } catch (error) {
    if (error instanceof WeatherServiceError) {
      sendJson(res, error.statusCode, { error: error.message });
      return;
    }
    console.error('Unexpected weather handler error:', error);
    sendJson(res, 500, { error: 'Internal server error.' });
  }
}
