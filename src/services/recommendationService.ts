import { AgeGroup, GenderOption } from '../data/onboardingOptions';
import { buildApiUrl } from '../lib/apiClient';
import { WeatherData } from './weatherService';

export interface OutfitRecommendation {
  outerwear: string;
  top: string;
  bottom: string;
  shoes: string;
  accessory: string;
  outerwearEmoji: string;
  topEmoji: string;
  bottomEmoji: string;
  shoesEmoji: string;
  accessoryEmoji: string;
  reason: string;
}

export interface RecommendOutfitPayload {
  ageGroup: AgeGroup;
  gender: GenderOption;
  styleName: string;
  weather: WeatherData;
}

export async function fetchOutfitRecommendation(
  payload: RecommendOutfitPayload,
  signal?: AbortSignal
): Promise<OutfitRecommendation> {
  const response = await fetch(buildApiUrl('/api/recommend-outfit'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      ageGroup: payload.ageGroup,
      gender: payload.gender,
      styleName: payload.styleName,
      currentTemp: payload.weather.currentTemp,
      apparentTemp: payload.weather.apparentTemp,
      conditionLabel: payload.weather.conditionLabel,
      minTemp: payload.weather.minTemp,
      maxTemp: payload.weather.maxTemp,
      precipitationProbability: payload.weather.precipitationProbability,
    }),
  });

  if (!response.ok) {
    throw new Error(`Recommendation request failed with status ${response.status}`);
  }

  const data = (await response.json()) as Partial<OutfitRecommendation>;

  if (
    typeof data.outerwear !== 'string' ||
    typeof data.top !== 'string' ||
    typeof data.bottom !== 'string' ||
    typeof data.shoes !== 'string' ||
    typeof data.accessory !== 'string' ||
    typeof data.reason !== 'string'
  ) {
    throw new Error('Invalid recommendation response format');
  }

  return {
    outerwear: data.outerwear,
    top: data.top,
    bottom: data.bottom,
    shoes: data.shoes,
    accessory: data.accessory,
    outerwearEmoji:
      typeof data.outerwearEmoji === 'string' && data.outerwearEmoji.trim()
        ? data.outerwearEmoji.trim()
        : '🧥',
    topEmoji:
      typeof data.topEmoji === 'string' && data.topEmoji.trim()
        ? data.topEmoji.trim()
        : '👕',
    bottomEmoji:
      typeof data.bottomEmoji === 'string' && data.bottomEmoji.trim()
        ? data.bottomEmoji.trim()
        : '👖',
    shoesEmoji:
      typeof data.shoesEmoji === 'string' && data.shoesEmoji.trim()
        ? data.shoesEmoji.trim()
        : '👟',
    accessoryEmoji:
      typeof data.accessoryEmoji === 'string' && data.accessoryEmoji.trim()
        ? data.accessoryEmoji.trim()
        : '👜',
    reason: data.reason,
  };
}
