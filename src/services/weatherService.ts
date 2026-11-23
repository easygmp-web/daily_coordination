import { buildApiUrl } from '../lib/apiClient';

export interface WeatherData {
  currentTemp: number;
  apparentTemp: number;
  conditionLabel: string;
  conditionEmoji: string;
  minTemp: number;
  maxTemp: number;
  precipitationProbability: number;
}

export async function fetchOpenMeteoWeather(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<WeatherData> {
  const params = new URLSearchParams({
    lat: lat.toFixed(4),
    lon: lon.toFixed(4),
  });

  const response = await fetch(
    `${buildApiUrl('/api/weather')}?${params.toString()}`,
    {
      method: 'GET',
      signal,
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(`Weather proxy request failed with status ${response.status}`);
  }

  const data = (await response.json()) as Partial<WeatherData>;

  if (
    typeof data.currentTemp !== 'number' ||
    typeof data.apparentTemp !== 'number' ||
    typeof data.conditionLabel !== 'string' ||
    typeof data.conditionEmoji !== 'string' ||
    typeof data.minTemp !== 'number' ||
    typeof data.maxTemp !== 'number' ||
    typeof data.precipitationProbability !== 'number'
  ) {
    throw new Error('Incomplete weather data received from server');
  }

  return {
    currentTemp: data.currentTemp,
    apparentTemp: data.apparentTemp,
    conditionLabel: data.conditionLabel,
    conditionEmoji: data.conditionEmoji,
    minTemp: data.minTemp,
    maxTemp: data.maxTemp,
    precipitationProbability: data.precipitationProbability,
  };
}
