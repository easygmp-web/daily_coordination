import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Home, Loader2, MapPin, RefreshCw } from 'lucide-react';
import {
  AgeGroup,
  GenderOption,
  OutfitStyleId,
  STYLE_OPTIONS,
} from '../data/onboardingOptions';
import { WeatherData } from '../services/weatherService';
import {
  fetchOutfitRecommendation,
  OutfitRecommendation,
} from '../services/recommendationService';
import { StyleIllustration } from './StyleIllustrations';

interface RecommendationScreenProps {
  ageGroup: AgeGroup;
  gender: GenderOption;
  styleId: OutfitStyleId;
  locationLabel: string;
  weather: WeatherData;
  onStartOver: () => void;
}

function getPersonEmoji(gender: GenderOption): string {
  if (gender === '여성') return '👩';
  if (gender === '남성') return '👨';
  return '🧑';
}

export function RecommendationScreen({
  ageGroup,
  gender,
  styleId,
  locationLabel,
  weather,
  onStartOver,
}: RecommendationScreenProps) {
  const [recommendation, setRecommendation] = useState<OutfitRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const initialFetchedRef = useRef<boolean>(false);

  const styleOption =
    STYLE_OPTIONS.find((item) => item.id === styleId) ?? STYLE_OPTIONS[0];

  const requestRecommendation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorMessage(null);

    fetchOutfitRecommendation(
      {
        ageGroup,
        gender,
        styleName: styleOption.name,
        weather,
      },
      controller.signal
    )
      .then((result) => {
        setRecommendation(result);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setRecommendation(null);
        setErrorMessage('지금은 추천할 수 없어요. 잠시 후 다시 눌러 주세요');
        setIsLoading(false);
      });
  }, [ageGroup, gender, styleOption.name, weather]);

  useEffect(() => {
    if (!initialFetchedRef.current) {
      initialFetchedRef.current = true;
      requestRecommendation();
    }

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [requestRecommendation]);

  const outfitRows = recommendation
    ? [
        { emoji: recommendation.outerwearEmoji, label: '겉옷', text: recommendation.outerwear },
        { emoji: recommendation.topEmoji, label: '상의', text: recommendation.top },
        { emoji: recommendation.bottomEmoji, label: '하의', text: recommendation.bottom },
        { emoji: recommendation.shoesEmoji, label: '신발', text: recommendation.shoes },
        { emoji: recommendation.accessoryEmoji, label: '소품', text: recommendation.accessory },
      ]
    : [];

  const personEmoji = getPersonEmoji(gender);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-12 sm:pb-16">
      {/* Page Heading */}
      <section className="mb-5 sm:mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
          오늘의 옷차림
        </h1>
      </section>

      {/* Top 1-line Weather Summary */}
      <section aria-label="오늘 날씨 요약" className="mb-7 sm:mb-8">
        <div className="rounded-2xl bg-sky-100/75 border border-sky-200 px-4 sm:px-5 py-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sky-950">
          <span className="inline-flex items-center gap-1 text-sm sm:text-base font-bold text-sky-800 shrink-0">
            <MapPin className="w-4 h-4 text-sky-700" aria-hidden="true" />
            {locationLabel}
          </span>
          <span aria-hidden="true" className="text-sky-400 hidden sm:inline">
            |
          </span>
          <p className="text-base sm:text-lg font-bold leading-snug tabular-nums">
            <span className="mr-1.5" aria-hidden="true">
              {weather.conditionEmoji}
            </span>
            지금 {weather.currentTemp}℃ (체감 {weather.apparentTemp}℃) · {weather.conditionLabel} / 최저{' '}
            {weather.minTemp}℃ · 최고 {weather.maxTemp}℃ · 비 올 확률 {weather.precipitationProbability}%
          </p>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <section
          aria-live="polite"
          className="rounded-3xl bg-white border-2 border-sky-200 p-8 sm:p-12 flex flex-col items-center justify-center text-center gap-4 shadow-xs"
        >
          <Loader2 className="w-12 h-12 animate-spin text-sky-600" aria-hidden="true" />
          <p className="text-xl sm:text-2xl font-bold text-sky-950">
            AI가 옷을 고르는 중이에요…
          </p>
          <p className="text-base sm:text-lg text-slate-500">
            {styleOption.name} 스타일과 오늘 날씨에 꼭 맞게 준비하고 있어요.
          </p>
        </section>
      )}

      {/* Error State */}
      {!isLoading && errorMessage && (
        <section
          role="alert"
          className="rounded-3xl bg-amber-50 border-2 border-amber-200 p-7 sm:p-9 flex flex-col items-center justify-center text-center gap-3"
        >
          <AlertCircle className="w-10 h-10 text-amber-600" aria-hidden="true" />
          <p className="text-xl sm:text-2xl font-bold text-amber-950 leading-snug">
            {errorMessage}
          </p>
        </section>
      )}

      {/* Recommendation Card */}
      {!isLoading && !errorMessage && recommendation && (
        <section aria-label="추천 옷차림">
          <article className="rounded-3xl bg-white border-[3px] border-sky-400 shadow-lg shadow-sky-500/10 overflow-hidden">
            {/* Card Header: Style Illustration & Name */}
            <div className="bg-gradient-to-r from-[#EBF6FF] to-[#F5FAFF] px-5 sm:px-7 py-5 border-b border-sky-100 flex items-center gap-4 sm:gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0">
                <StyleIllustration styleId={styleId} selected />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-medium text-sky-800">
                  {ageGroup} · {gender}
                </p>
                <h2 className="mt-0.5 text-2xl sm:text-3xl font-bold text-slate-900">
                  {styleOption.name}
                </h2>
              </div>
            </div>

            {/* Visual Emoji Outfit Lookbook (Head-to-Toe Outfit Preview) */}
            <div className="px-4 sm:px-7 pt-5 sm:pt-6">
              <div
                aria-label="오늘의 착장 이모지 모습"
                className="rounded-2xl bg-gradient-to-b from-[#EAF6FF] via-[#F4FAFF] to-white border border-sky-200 p-4 sm:p-6"
              >
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-base sm:text-lg font-bold text-sky-950">
                    오늘의 이모지 착장
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-sky-800">
                    {personEmoji} {weather.conditionEmoji}
                  </span>
                </div>

                {/* Head-to-Toe Emoji Silhouette + Side Accessory */}
                <div className="flex flex-col items-center justify-center py-2">
                  {/* Face + Accessory hint */}
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span
                      className="text-5xl sm:text-6xl leading-none select-none"
                      aria-hidden="true"
                    >
                      {personEmoji}
                    </span>
                  </div>

                  {/* Upper body: Outerwear + Top */}
                  <div className="flex items-center justify-center gap-2.5 my-1.5">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white border border-sky-200 shadow-xs flex flex-col items-center justify-center">
                      <span className="text-4xl sm:text-5xl leading-none" aria-hidden="true">
                        {recommendation.outerwearEmoji}
                      </span>
                      <span className="mt-1 text-xs font-bold text-sky-800">겉옷</span>
                    </div>
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white border border-sky-200 shadow-xs flex flex-col items-center justify-center">
                      <span className="text-4xl sm:text-5xl leading-none" aria-hidden="true">
                        {recommendation.topEmoji}
                      </span>
                      <span className="mt-1 text-xs font-bold text-sky-800">상의</span>
                    </div>
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white border border-sky-200 shadow-xs flex flex-col items-center justify-center">
                      <span className="text-4xl sm:text-5xl leading-none" aria-hidden="true">
                        {recommendation.accessoryEmoji}
                      </span>
                      <span className="mt-1 text-xs font-bold text-sky-800">소품</span>
                    </div>
                  </div>

                  {/* Lower body: Bottom + Shoes */}
                  <div className="flex items-center justify-center gap-2.5 mt-1.5">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white border border-sky-200 shadow-xs flex flex-col items-center justify-center">
                      <span className="text-4xl sm:text-5xl leading-none" aria-hidden="true">
                        {recommendation.bottomEmoji}
                      </span>
                      <span className="mt-1 text-xs font-bold text-sky-800">하의</span>
                    </div>
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white border border-sky-200 shadow-xs flex flex-col items-center justify-center">
                      <span className="text-4xl sm:text-5xl leading-none" aria-hidden="true">
                        {recommendation.shoesEmoji}
                      </span>
                      <span className="mt-1 text-xs font-bold text-sky-800">신발</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Outfit Rows */}
            <ul className="divide-y divide-sky-100 px-5 sm:px-7 mt-2">
              {outfitRows.map((item) => (
                <li
                  key={item.label}
                  className="py-4 sm:py-5 flex items-start gap-3.5 sm:gap-4"
                >
                  <span
                    className="text-2xl sm:text-3xl leading-none shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    {item.emoji}
                  </span>
                  <div className="flex-1 min-w-0 sm:flex sm:items-baseline sm:gap-4">
                    <span className="inline-block w-16 shrink-0 text-base sm:text-lg font-bold text-sky-800">
                      {item.label}
                    </span>
                    <p className="mt-0.5 sm:mt-0 text-lg sm:text-xl font-semibold text-slate-900 leading-snug">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Reason Footer */}
            <div className="m-4 sm:m-6 mt-2 rounded-2xl bg-sky-50 border border-sky-200 px-5 py-4 sm:px-6 sm:py-5">
              <div className="text-base sm:text-lg font-bold text-sky-900 mb-1.5">
                💡 추천 이유
              </div>
              <p className="text-lg sm:text-xl font-medium text-slate-800 leading-relaxed">
                {recommendation.reason}
              </p>
            </div>
          </article>
        </section>
      )}

      {/* Bottom Action Buttons: '다시 추천받기' & '처음으로' */}
      <section className="mt-8 sm:mt-10 pt-6 border-t border-sky-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={requestRecommendation}
            className={`min-h-[60px] px-5 rounded-2xl text-xl font-bold flex items-center justify-center gap-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${
              isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white shadow-lg shadow-sky-600/25 cursor-pointer'
            }`}
          >
            <RefreshCw className="w-5 h-5" aria-hidden="true" />
            <span>다시 추천받기</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onStartOver}
            className={`min-h-[60px] px-5 rounded-2xl border-2 text-xl font-bold flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${
              isLoading
                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'border-sky-200 bg-white hover:bg-sky-50 active:scale-[0.99] text-sky-900 cursor-pointer'
            }`}
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            <span>처음으로</span>
          </button>
        </div>
      </section>
    </main>
  );
}
