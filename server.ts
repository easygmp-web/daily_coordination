import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  fetchWeatherData,
  parseCoordinates,
  WeatherServiceError,
} from './api/_lib/weather.ts';
import {
  generateOutfitRecommendation,
  RecommendationServiceError,
  validateRecommendPayload,
} from './api/_lib/recommendOutfit.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function applyDevCors(req: Request, res: Response, allowedMethods: string): void {
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
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '64kb' }));

  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({ error: 'Invalid JSON request body.' });
      return;
    }
    next(err);
  });

  app.options('/api/health', (req: Request, res: Response) => {
    applyDevCors(req, res, 'GET, OPTIONS');
    res.status(204).end();
  });

  app.get('/api/health', (req: Request, res: Response) => {
    applyDevCors(req, res, 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      ok: true,
      nodeVersion: process.version,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
      timestamp: new Date().toISOString(),
    });
  });

  app.options('/api/weather', (req: Request, res: Response) => {
    applyDevCors(req, res, 'GET, OPTIONS');
    res.status(204).end();
  });

  app.get('/api/weather', async (req: Request, res: Response) => {
    applyDevCors(req, res, 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'no-store');

    const latRaw = typeof req.query.lat === 'string' ? req.query.lat : undefined;
    const lonRaw = typeof req.query.lon === 'string' ? req.query.lon : undefined;
    const coords = parseCoordinates(latRaw, lonRaw);

    if (!coords) {
      res.status(400).json({ error: 'Invalid latitude or longitude.' });
      return;
    }

    try {
      const weather = await fetchWeatherData(coords.lat, coords.lon);
      res.json(weather);
    } catch (error) {
      if (error instanceof WeatherServiceError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Unexpected weather route error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  app.options('/api/recommend-outfit', (req: Request, res: Response) => {
    applyDevCors(req, res, 'POST, OPTIONS');
    res.status(204).end();
  });

  app.post('/api/recommend-outfit', async (req: Request, res: Response) => {
    applyDevCors(req, res, 'POST, OPTIONS');
    res.setHeader('Cache-Control', 'no-store');

    const validatedInput = validateRecommendPayload(req.body);
    if (!validatedInput) {
      res.status(400).json({ error: 'Invalid request parameters.' });
      return;
    }

    try {
      const recommendation = await generateOutfitRecommendation(validatedInput);
      res.json(recommendation);
    } catch (error) {
      if (error instanceof RecommendationServiceError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Unexpected recommendation route error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
