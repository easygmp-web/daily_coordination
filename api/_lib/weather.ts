export interface WeatherData {
  currentTemp: number;
  apparentTemp: number;
  conditionLabel: string;
  conditionEmoji: string;
  minTemp: number;
  maxTemp: number;
  precipitationProbability: number;
}

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
  };
  daily?: {
    temperature_2m_min?: Array<number | null>;
    temperature_2m_max?: Array<number | null>;
    precipitation_probability_max?: Array<number | null>;
  };
}

export class WeatherServiceError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'WeatherServiceError';
    this.statusCode = statusCode;
  }
}

export function interpretWeatherCode(code: number): {
  label: string;
  emoji: string;
} {
  if (code === 0) {
    return { label: '맑음', emoji: '☀️' };
  }
  if (code === 1) {
    return { label: '대체로 맑음', emoji: '🌤️' };
  }
  if (code === 2) {
    return { label: '구름 조금', emoji: '⛅' };
  }
  if (code === 3) {
    return { label: '흐림', emoji: '☁️' };
  }
  if (code === 45 || code === 48) {
    return { label: '안개', emoji: '🌫️' };
  }
  if (code === 51 || code === 53 || code === 55) {
    return { label: '이슬비', emoji: '🌦️' };
  }
  if (code === 56 || code === 57) {
    return { label: '어는 이슬비', emoji: '🌧️' };
  }
  if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67) {
    return { label: '비', emoji: '🌧️' };
  }
  if (code === 71 || code === 73 || code === 75 || code === 77) {
    return { label: '눈', emoji: '🌨️' };
  }
  if (code === 80 || code === 81 || code === 82) {
    return { label: '소나기', emoji: '🌦️' };
  }
  if (code === 85 || code === 86) {
    return { label: '눈 소나기', emoji: '🌨️' };
  }
  if (code === 95 || code === 96 || code === 99) {
    return { label: '천둥번개', emoji: '⛈️' };
  }
  return { label: '흐림', emoji: '☁️' };
}

export function parseCoordinates(
  latRaw: string | undefined,
  lonRaw: string | undefined
): { lat: number; lon: number } | null {
  if (!latRaw || !lonRaw) {
    return null;
  }

  const lat = Number(latRaw);
  const lon = Number(lonRaw);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return null;
  }

  return { lat, lon };
}

export async function fetchWeatherData(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const baseUrl =
    process.env.OPEN_METEO_API_URL?.trim() ||
    'https://api.open-meteo.com/v1/forecast';

  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: 'temperature_2m,apparent_temperature,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'Asia/Seoul',
    forecast_days: '1',
  });

  const openMeteoApiKey = process.env.OPEN_METEO_API_KEY?.trim();
  if (openMeteoApiKey) {
    params.set('apikey', openMeteoApiKey);
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    console.error('Open-Meteo network error:', error);
    throw new WeatherServiceError(
      'Failed to reach upstream weather service.',
      502
    );
  }

  if (!response.ok) {
    throw new WeatherServiceError(
      `Upstream weather service returned status ${response.status}.`,
      502
    );
  }

  const data = (await response.json()) as OpenMeteoResponse;

  const currentTemp = data.current?.temperature_2m;
  const apparentTemp = data.current?.apparent_temperature;
  const weatherCode = data.current?.weather_code;
  const minTemp = data.daily?.temperature_2m_min?.[0];
  const maxTemp = data.daily?.temperature_2m_max?.[0];
  const precipProb = data.daily?.precipitation_probability_max?.[0];

  if (
    typeof currentTemp !== 'number' ||
    typeof apparentTemp !== 'number' ||
    typeof weatherCode !== 'number' ||
    typeof minTemp !== 'number' ||
    typeof maxTemp !== 'number'
  ) {
    throw new WeatherServiceError(
      'Incomplete weather data received from upstream service.',
      502
    );
  }

  const interpreted = interpretWeatherCode(weatherCode);

  return {
    currentTemp: Math.round(currentTemp),
    apparentTemp: Math.round(apparentTemp),
    conditionLabel: interpreted.label,
    conditionEmoji: interpreted.emoji,
    minTemp: Math.round(minTemp),
    maxTemp: Math.round(maxTemp),
    precipitationProbability:
      typeof precipProb === 'number' ? Math.round(precipProb) : 0,
  };
}
