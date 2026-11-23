import React, { useRef, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  AGE_GROUPS,
  AgeGroup,
  GENDER_OPTIONS,
  GenderOption,
  OutfitStyleId,
  STYLE_OPTIONS,
} from './data/onboardingOptions';
import { BrandSkyMark, StyleIllustration } from './components/StyleIllustrations';
import { WeatherScreen } from './components/WeatherScreen';
import { RecommendationScreen } from './components/RecommendationScreen';
import { WeatherData } from './services/weatherService';

type ScreenStep = 'profile' | 'weather' | 'recommendation';

function getMissingPrompt(
  age: AgeGroup | null,
  gender: GenderOption | null,
  style: OutfitStyleId | null
): string | null {
  const missing: Array<{ label: string; particle: '을' | '를' }> = [];

  if (!age) {
    missing.push({ label: '연령대', particle: '를' });
  }
  if (!gender) {
    missing.push({ label: '성별', particle: '을' });
  }
  if (!style) {
    missing.push({ label: '선호하는 옷 스타일', particle: '을' });
  }

  if (missing.length === 0) {
    return null;
  }

  const last = missing[missing.length - 1];
  const joined = missing.map((item) => item.label).join(', ');
  return `${joined}${last.particle} 골라 주세요`;
}

export default function App() {
  const [step, setStep] = useState<ScreenStep>('profile');
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
  const [selectedGender, setSelectedGender] = useState<GenderOption | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<OutfitStyleId | null>(null);
  const [highlightMissing, setHighlightMissing] = useState(false);

  const [weatherContext, setWeatherContext] = useState<{
    locationLabel: string;
    weather: WeatherData;
  } | null>(null);

  const ageSectionRef = useRef<HTMLElement | null>(null);
  const genderSectionRef = useRef<HTMLElement | null>(null);
  const styleSectionRef = useRef<HTMLElement | null>(null);

  const missingMessage = getMissingPrompt(selectedAge, selectedGender, selectedStyle);
  const isComplete = missingMessage === null;

  const handleDisabledAreaTap = () => {
    if (isComplete) return;
    setHighlightMissing(true);
    window.setTimeout(() => setHighlightMissing(false), 900);

    if (!selectedAge) {
      ageSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (!selectedGender) {
      genderSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (!selectedStyle) {
      styleSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNext = () => {
    if (!isComplete) {
      handleDisabledAreaTap();
      return;
    }
    setStep('weather');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToProfile = () => {
    setStep('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestRecommendation = (locationLabel: string, weather: WeatherData) => {
    setWeatherContext({ locationLabel, weather });
    setStep('recommendation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartOver = () => {
    setSelectedAge(null);
    setSelectedGender(null);
    setSelectedStyle(null);
    setWeatherContext(null);
    setStep('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stepHeaderLabel =
    step === 'profile'
      ? '나에 대해'
      : step === 'weather'
        ? '오늘 날씨'
        : '오늘의 옷차림';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E6F4FF] via-[#F4FAFF] to-white text-slate-900">
      {/* Compact Header */}
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-sky-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandSkyMark />
            <span className="text-xl font-bold tracking-tight text-sky-950 whitespace-nowrap">
              데일리코디
            </span>
          </div>
          <span className="text-sm font-medium text-sky-700 whitespace-nowrap">
            {stepHeaderLabel}
          </span>
        </div>
      </header>

      {step === 'recommendation' &&
      selectedAge &&
      selectedGender &&
      selectedStyle &&
      weatherContext ? (
        <RecommendationScreen
          ageGroup={selectedAge}
          gender={selectedGender}
          styleId={selectedStyle}
          locationLabel={weatherContext.locationLabel}
          weather={weatherContext.weather}
          onStartOver={handleStartOver}
        />
      ) : step === 'weather' ? (
        <WeatherScreen
          onBack={handleBackToProfile}
          onRequestRecommendation={handleRequestRecommendation}
        />
      ) : (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-12 sm:pb-16">
          {/* Page Heading */}
          <section className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
              나에 대해
            </h1>
            <p className="mt-2.5 text-lg sm:text-xl text-slate-600 leading-relaxed">
              편안하고 알맞은 옷차림을 위해 기본 정보를 골라 주세요.
            </p>
          </section>

          <div className="space-y-9 sm:space-y-11">
            {/* 1. 연령대 */}
            <section ref={ageSectionRef} aria-labelledby="age-heading">
              <div className="flex items-baseline justify-between gap-3 mb-3.5">
                <h2 id="age-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
                  연령대
                </h2>
                <span className="text-sm sm:text-base font-medium text-slate-500 whitespace-nowrap">
                  하나만 선택
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {AGE_GROUPS.map((age) => {
                  const isSelected = selectedAge === age;
                  return (
                    <button
                      key={age}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedAge(age)}
                      className={`min-h-[60px] px-3 py-3.5 rounded-2xl text-lg sm:text-xl font-bold transition-all duration-150 cursor-pointer flex items-center justify-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 active:scale-[0.98] ${
                        isSelected
                          ? 'bg-sky-600 text-white border-2 border-sky-700 shadow-md shadow-sky-600/20'
                          : 'bg-white text-slate-800 border-2 border-sky-100 hover:border-sky-300 hover:bg-sky-50/50 shadow-xs'
                      }`}
                    >
                      {age}
                    </button>
                  );
                })}
              </div>
            </section>

            <hr className="border-sky-100" />

            {/* 2. 성별 */}
            <section ref={genderSectionRef} aria-labelledby="gender-heading">
              <div className="flex items-baseline justify-between gap-3 mb-3.5">
                <h2 id="gender-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
                  성별
                </h2>
                <span className="text-sm sm:text-base font-medium text-slate-500 whitespace-nowrap">
                  하나만 선택
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
                {GENDER_OPTIONS.map((gender) => {
                  const isSelected = selectedGender === gender;
                  return (
                    <button
                      key={gender}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedGender(gender)}
                      className={`min-h-[60px] px-2.5 sm:px-5 py-3.5 rounded-2xl text-[17px] sm:text-xl font-bold transition-all duration-150 cursor-pointer flex items-center justify-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 active:scale-[0.98] ${
                        isSelected
                          ? 'bg-sky-600 text-white border-2 border-sky-700 shadow-md shadow-sky-600/20'
                          : 'bg-white text-slate-800 border-2 border-sky-100 hover:border-sky-300 hover:bg-sky-50/50 shadow-xs'
                      }`}
                    >
                      {gender}
                    </button>
                  );
                })}
              </div>
            </section>

            <hr className="border-sky-100" />

            {/* 3. 선호하는 옷 스타일 */}
            <section ref={styleSectionRef} aria-labelledby="style-heading">
              <div className="flex items-baseline justify-between gap-3 mb-3.5">
                <h2 id="style-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
                  선호하는 옷 스타일
                </h2>
                <span className="text-sm sm:text-base font-medium text-slate-500 whitespace-nowrap">
                  하나만 선택
                </span>
              </div>

              <fieldset>
                <legend className="sr-only">선호하는 옷 스타일 선택</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  {STYLE_OPTIONS.map((option) => {
                    const isSelected = selectedStyle === option.id;
                    return (
                      <label
                        key={option.id}
                        className={`relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-150 select-none min-h-[108px] active:scale-[0.99] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-sky-300 ${
                          isSelected
                            ? 'bg-sky-50 border-[3px] border-sky-500 shadow-md shadow-sky-500/15'
                            : 'bg-white border-2 border-sky-100 hover:border-sky-300 hover:bg-sky-50/40 shadow-xs'
                        }`}
                      >
                        <input
                          type="radio"
                          name="outfit-style"
                          value={option.id}
                          checked={isSelected}
                          onChange={() => setSelectedStyle(option.id)}
                          className="sr-only"
                        />

                        {/* Custom SVG illustration */}
                        <div className="w-20 h-20 sm:w-[88px] sm:h-[88px] shrink-0">
                          <StyleIllustration styleId={option.id} selected={isSelected} />
                        </div>

                        {/* Text content */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-lg sm:text-xl font-bold leading-snug ${
                              isSelected ? 'text-sky-950' : 'text-slate-900'
                            }`}
                          >
                            {option.name}
                          </div>
                          <p className="mt-1 text-[15px] sm:text-base text-slate-600 leading-snug">
                            {option.description}
                          </p>
                        </div>

                        {/* Visible Radio Indicator */}
                        <span
                          aria-hidden="true"
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'border-sky-600 bg-sky-600'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          <span
                            className={`w-3 h-3 rounded-full bg-white transition-transform duration-150 ${
                              isSelected ? 'scale-100' : 'scale-0'
                            }`}
                          />
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </section>
          </div>

          {/* Bottom Prompt & Next Button */}
          <section className="mt-10 sm:mt-12 pt-6 border-t border-sky-100">
            <div
              role="status"
              aria-live="polite"
              className={`mb-4 rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all duration-200 ${
                isComplete
                  ? 'bg-sky-50 border border-sky-200 text-sky-900'
                  : highlightMissing
                    ? 'bg-amber-50 border-2 border-amber-400 text-amber-950 scale-[1.01]'
                    : 'bg-sky-50/80 border border-sky-200 text-sky-900'
              }`}
            >
              {isComplete ? (
                <CheckCircle2 className="w-6 h-6 text-sky-600 shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle
                  className={`w-6 h-6 shrink-0 ${
                    highlightMissing ? 'text-amber-600' : 'text-sky-600'
                  }`}
                  aria-hidden="true"
                />
              )}
              <p className="text-base sm:text-lg font-semibold leading-snug">
                {isComplete
                  ? '모두 고르셨어요! 아래 ‘다음’ 버튼을 눌러 주세요.'
                  : missingMessage}
              </p>
            </div>

            <div
              onClick={!isComplete ? handleDisabledAreaTap : undefined}
              className={!isComplete ? 'cursor-not-allowed' : undefined}
            >
              <button
                type="button"
                disabled={!isComplete}
                aria-disabled={!isComplete}
                onClick={handleNext}
                className={`w-full h-14 sm:h-[60px] rounded-2xl text-xl font-bold flex items-center justify-center gap-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${
                  isComplete
                    ? 'bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white shadow-lg shadow-sky-600/25 cursor-pointer'
                    : 'bg-slate-200 text-slate-500 pointer-events-none'
                }`}
              >
                <span>다음</span>
                <ArrowRight className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
