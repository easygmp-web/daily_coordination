import { GoogleGenAI, Type } from '@google/genai';

export interface RecommendOutfitRequestBody {
  ageGroup?: unknown;
  gender?: unknown;
  styleName?: unknown;
  currentTemp?: unknown;
  apparentTemp?: unknown;
  conditionLabel?: unknown;
  minTemp?: unknown;
  maxTemp?: unknown;
  precipitationProbability?: unknown;
}

export interface ValidatedRecommendOutfitInput {
  ageGroup: string;
  gender: string;
  styleName: string;
  conditionLabel: string;
  currentTemp: number;
  apparentTemp: number;
  minTemp: number;
  maxTemp: number;
  precipitationProbability: number;
}

export interface OutfitRecommendationResult {
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

export class RecommendationServiceError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'RecommendationServiceError';
    this.statusCode = statusCode;
  }
}

function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateRecommendPayload(
  rawBody: unknown
): ValidatedRecommendOutfitInput | null {
  if (!rawBody || typeof rawBody !== 'object') {
    return null;
  }

  const body = rawBody as RecommendOutfitRequestBody;

  if (
    !isNonEmptyString(body.ageGroup) ||
    !isNonEmptyString(body.gender) ||
    !isNonEmptyString(body.styleName) ||
    !isNonEmptyString(body.conditionLabel) ||
    !isValidNumber(body.currentTemp) ||
    !isValidNumber(body.apparentTemp) ||
    !isValidNumber(body.minTemp) ||
    !isValidNumber(body.maxTemp) ||
    !isValidNumber(body.precipitationProbability)
  ) {
    return null;
  }

  return {
    ageGroup: body.ageGroup.trim(),
    gender: body.gender.trim(),
    styleName: body.styleName.trim(),
    conditionLabel: body.conditionLabel.trim(),
    currentTemp: body.currentTemp,
    apparentTemp: body.apparentTemp,
    minTemp: body.minTemp,
    maxTemp: body.maxTemp,
    precipitationProbability: body.precipitationProbability,
  };
}

export async function generateOutfitRecommendation(
  input: ValidatedRecommendOutfitInput
): Promise<OutfitRecommendationResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set.');
    throw new RecommendationServiceError(
      'GEMINI_API_KEY is not configured on the server.',
      500
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const tempDiff = input.maxTemp - input.minTemp;

  const systemInstruction = [
    '당신은 한국인의 일상 옷차림을 친절하고 알기 쉽게 골라 주는 옷차림 도우미입니다.',
    '사용자가 고른 스타일에 딱 맞는 옷차림 정확히 1가지를 겉옷, 상의, 하의, 신발, 소품으로 나누어 추천해 주세요.',
    '규칙:',
    '1. 오늘 기온과 날씨 상태, 체감온도, 강수 확률에 꼭 맞게 추천하세요.',
    '2. 비 올 확률이 높거나(40% 이상) 비·소나기·눈 예보가 있으면 소품이나 신발에 우산 또는 방수 신발을 꼭 포함하세요.',
    '3. 아침저녁과 낮의 기온 차이(일교차)가 크면(예: 8도 이상) 벗고 입기 좋은 껴입기(레이어드)를 추천하세요.',
    '4. 연령대와 성별에 자연스럽게 어울리고, 동네 매장이나 온라인에서 쉽게 구할 수 있는 평범하고 현실적인 옷으로 추천하세요.',
    '5. 성별이 "선택 안 함"이면 성별에 구애받지 않는 무난한 옷차림으로 추천하세요.',
    '6. 특정 브랜드 이름이나 영어 패션 전문 용어는 절대 넣지 마세요.',
    '7. 추천 이유(reason)는 반드시 오늘 날씨 수치를 근거로 한 문장으로만 작성하세요.',
    '8. 모든 문장은 부드러운 존댓말과 쉬운 한국어로 작성하세요.',
    '9. 각 옷 설명 항목(outerwear, top, bottom, shoes, accessory)에는 이모지를 넣지 말고 깔끔한 텍스트만 작성하세요.',
    '10. 대신 각 옷에 가장 잘 어울리는 이모지 1개씩(outerwearEmoji, topEmoji, bottomEmoji, shoesEmoji, accessoryEmoji)을 따로 골라 주세요.',
  ].join('\n');

  const userPrompt = [
    `연령대: ${input.ageGroup}`,
    `성별: ${input.gender}`,
    `고른 스타일: ${input.styleName}`,
    `지금 기온: ${input.currentTemp}℃`,
    `체감온도: ${input.apparentTemp}℃`,
    `날씨 상태: ${input.conditionLabel}`,
    `오늘 최저 기온: ${input.minTemp}℃`,
    `오늘 최고 기온: ${input.maxTemp}℃ (일교차 ${tempDiff}℃)`,
    `강수 확률: ${input.precipitationProbability}%`,
    '',
    '위 조건에 맞는 옷차림 1가지를 JSON으로 추천해 주세요.',
  ].join('\n');

  let rawText = '';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            outerwear: {
              type: Type.STRING,
              description:
                '추천 겉옷 1가지 (쉬운 한국어, 겉옷이 필요 없는 아주 더운 날이면 가벼운 얇은 셔츠나 필요 없음 안내)',
            },
            top: {
              type: Type.STRING,
              description: '추천 상의 1가지',
            },
            bottom: {
              type: Type.STRING,
              description: '추천 하의 1가지',
            },
            shoes: {
              type: Type.STRING,
              description: '추천 신발 1가지',
            },
            accessory: {
              type: Type.STRING,
              description: '추천 소품 1가지 (비 확률이 높으면 우산 등 포함)',
            },
            outerwearEmoji: {
              type: Type.STRING,
              description: '겉옷에 어울리는 이모지 1개 (예: 🧥, 🧶, 🦺)',
            },
            topEmoji: {
              type: Type.STRING,
              description: '상의에 어울리는 이모지 1개 (예: 👕, 👚, 👔, 🧶)',
            },
            bottomEmoji: {
              type: Type.STRING,
              description: '하의에 어울리는 이모지 1개 (예: 👖, 🩳, 👗)',
            },
            shoesEmoji: {
              type: Type.STRING,
              description: '신발에 어울리는 이모지 1개 (예: 👟, 👞, 🥾, 🥿, 👡)',
            },
            accessoryEmoji: {
              type: Type.STRING,
              description:
                '소품에 어울리는 이모지 1개 (예: ☂️, 🧢, 🧣, 🧤, 👜, 🎒, 🕶️)',
            },
            reason: {
              type: Type.STRING,
              description: '오늘 날씨를 근거로 한 한 문장의 존댓말 추천 이유',
            },
          },
          required: [
            'outerwear',
            'top',
            'bottom',
            'shoes',
            'accessory',
            'outerwearEmoji',
            'topEmoji',
            'bottomEmoji',
            'shoesEmoji',
            'accessoryEmoji',
            'reason',
          ],
        },
      },
    });

    rawText = (response.text ?? '').trim();
  } catch (error) {
    console.error('Gemini recommendation error:', error);
    throw new RecommendationServiceError(
      'Failed to generate outfit recommendation.',
      502
    );
  }

  if (!rawText) {
    throw new RecommendationServiceError('Empty response from AI.', 502);
  }

  let parsed: Partial<OutfitRecommendationResult>;
  try {
    parsed = JSON.parse(rawText) as Partial<OutfitRecommendationResult>;
  } catch {
    throw new RecommendationServiceError('Invalid JSON response from AI.', 502);
  }

  if (
    !isNonEmptyString(parsed.outerwear) ||
    !isNonEmptyString(parsed.top) ||
    !isNonEmptyString(parsed.bottom) ||
    !isNonEmptyString(parsed.shoes) ||
    !isNonEmptyString(parsed.accessory) ||
    !isNonEmptyString(parsed.reason)
  ) {
    throw new RecommendationServiceError(
      'Incomplete outfit recommendation.',
      502
    );
  }

  return {
    outerwear: parsed.outerwear.trim(),
    top: parsed.top.trim(),
    bottom: parsed.bottom.trim(),
    shoes: parsed.shoes.trim(),
    accessory: parsed.accessory.trim(),
    outerwearEmoji: isNonEmptyString(parsed.outerwearEmoji)
      ? parsed.outerwearEmoji.trim()
      : '🧥',
    topEmoji: isNonEmptyString(parsed.topEmoji) ? parsed.topEmoji.trim() : '👕',
    bottomEmoji: isNonEmptyString(parsed.bottomEmoji)
      ? parsed.bottomEmoji.trim()
      : '👖',
    shoesEmoji: isNonEmptyString(parsed.shoesEmoji)
      ? parsed.shoesEmoji.trim()
      : '👟',
    accessoryEmoji: isNonEmptyString(parsed.accessoryEmoji)
      ? parsed.accessoryEmoji.trim()
      : '👜',
    reason: parsed.reason.trim(),
  };
}
