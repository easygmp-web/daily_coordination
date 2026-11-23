import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import {
  CITIES,
  CityName,
  OTHER_CITY_DISTRICTS,
  SEOUL_GU_LIST,
} from '../data/koreaLocations';
import { fetchOpenMeteoWeather, WeatherData } from '../services/weatherService';

interface SelectedLocation {
  label: string;
  lat: number;
  lon: number;
  source: 'gps' | 'manual';
}

type GeoStatus = 'checking' | 'granted' | 'failed' | 'skipped';

interface WeatherScreenProps {
  onBack: () => void;
  onRequestRecommendation: (locationLabel: string, weather: WeatherData) => void;
}

export function WeatherScreen({ onBack, onRequestRecommendation }: WeatherScreenProps) {
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('checking');
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(true);

  const [selectedCity, setSelectedCity] = useState<CityName | null>(null);
  const [selectedSeoulGu, setSelectedSeoulGu] = useState<string | null>(null);
  const [seoulDongQuery, setSeoulDongQuery] = useState<string>('');

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [highlightLocationPrompt, setHighlightLocationPrompt] = useState<boolean>(false);

  const userInteractedManuallyRef = useRef<boolean>(false);
  const locationSectionRef = useRef<HTMLElement | null>(null);

  const requestCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('failed');
      setIsPickerOpen(true);
      return;
    }

    userInteractedManuallyRef.current = false;
    setGeoStatus('checking');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (userInteractedManuallyRef.current) {
          return;
        }
        setGeoStatus('granted');
        setIsPickerOpen(false);
        setSelectedLocation({
          label: '현재 위치',
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          source: 'gps',
        });
      },
      () => {
        if (userInteractedManuallyRef.current) {
          return;
        }
        setGeoStatus('failed');
        setIsPickerOpen(true);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    requestCurrentLocation();
  }, []);

  useEffect(() => {
    if (!selectedLocation) {
      setWeather(null);
      setWeatherError(null);
      setIsLoadingWeather(false);
      return;
    }

    const controller = new AbortController();
    setIsLoadingWeather(true);
    setWeatherError(null);

    fetchOpenMeteoWeather(selectedLocation.lat, selectedLocation.lon, controller.signal)
      .then((data) => {
        setWeather(data);
        setIsLoadingWeather(false);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setWeather(null);
        setWeatherError('날씨 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
        setIsLoadingWeather(false);
      });

    return () => {
      controller.abort();
    };
  }, [selectedLocation]);

  const handleCitySelect = (city: CityName) => {
    userInteractedManuallyRef.current = true;
    if (geoStatus === 'checking') {
      setGeoStatus('skipped');
    }
    setSelectedCity(city);
    setSelectedSeoulGu(null);
    setSeoulDongQuery('');
  };

  const handleSelectManualLocation = (label: string, lat: number, lon: number) => {
    userInteractedManuallyRef.current = true;
    if (geoStatus === 'checking') {
      setGeoStatus('skipped');
    }
    setSelectedLocation({
      label,
      lat,
      lon,
      source: 'manual',
    });
    setIsPickerOpen(false);
  };

  const handleRetryWeather = () => {
    if (!selectedLocation) return;
    setSelectedLocation({ ...selectedLocation });
  };

  const handleRecommendClick = () => {
    if (!weather || !selectedLocation || isLoadingWeather) {
      setHighlightLocationPrompt(true);
      window.setTimeout(() => setHighlightLocationPrompt(false), 900);
      locationSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onRequestRecommendation(selectedLocation.label, weather);
  };

  const seoulSearchMatches = useMemo(() => {
    const trimmed = seoulDongQuery.trim();
    if (!trimmed) return [];
    const results: Array<{ gu: string; name: string; lat: number; lon: number }> = [];
    for (const guItem of SEOUL_GU_LIST) {
      for (const dong of guItem.dongs) {
        if (dong.name.includes(trimmed) || guItem.gu.includes(trimmed)) {
          results.push({
            gu: guItem.gu,
            name: dong.name,
            lat: dong.lat,
            lon: dong.lon,
          });
        }
      }
    }
    return results;
  }, [seoulDongQuery]);

  const activeSeoulGuObj = useMemo(
    () => SEOUL_GU_LIST.find((item) => item.gu === selectedSeoulGu) ?? null,
    [selectedSeoulGu]
  );

  const locationHeaderMessage =
    geoStatus === 'failed'
      ? '위치를 찾지 못했어요. 지역을 골라 주세요'
      : '지역을 골라 주세요';

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-12 sm:pb-16">
      {/* Page Heading */}
      <section className="mb-7 sm:mb-9">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
          오늘 날씨
        </h1>
        <p className="mt-2.5 text-lg sm:text-xl text-slate-600 leading-relaxed">
          계신 곳을 정하면 지금 기온과 오늘 날씨를 바로 확인해 드려요.
        </p>
      </section>

      <div className="space-y-8">
        {/* Location Status & Selector Section */}
        <section ref={locationSectionRef} aria-labelledby="location-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
            <h2 id="location-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
              위치 선택
            </h2>

            {selectedLocation && !isPickerOpen && (
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="min-h-[44px] px-4 py-2 rounded-xl border-2 border-sky-200 bg-white hover:bg-sky-50 text-sky-800 font-bold text-base cursor-pointer transition-colors whitespace-nowrap"
              >
                다른 지역 고르기
              </button>
            )}
          </div>

          {/* Geolocation checking banner */}
          {geoStatus === 'checking' && !selectedLocation && (
            <div className="mb-4 rounded-2xl bg-sky-50 border border-sky-200 px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sky-900">
                <Loader2 className="w-5 h-5 animate-spin text-sky-600 shrink-0" aria-hidden="true" />
                <span className="text-base sm:text-lg font-semibold">
                  현재 위치를 확인하고 있어요…
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  userInteractedManuallyRef.current = true;
                  setGeoStatus('skipped');
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-sky-200 text-sky-800 font-semibold text-sm sm:text-base cursor-pointer hover:bg-sky-100/60 transition-colors"
              >
                직접 지역 고르기
              </button>
            </div>
          )}

          {/* Selected Location Summary Card (when picker collapsed) */}
          {selectedLocation && !isPickerOpen && (
            <div className="rounded-2xl bg-white border-2 border-sky-200 px-5 py-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-sky-700" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">선택된 지역</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">
                    {selectedLocation.label}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manual City & District Picker */}
          {isPickerOpen && (
            <div
              className={`rounded-3xl bg-white border-2 p-4 sm:p-6 shadow-xs transition-all ${
                highlightLocationPrompt
                  ? 'border-amber-400 ring-4 ring-amber-100'
                  : 'border-sky-100'
              }`}
            >
              {/* Prompt Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  {geoStatus === 'failed' ? (
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" aria-hidden="true" />
                  ) : (
                    <MapPin className="w-6 h-6 text-sky-600 shrink-0" aria-hidden="true" />
                  )}
                  <p className="text-lg sm:text-xl font-bold text-slate-900">
                    {locationHeaderMessage}
                  </p>
                </div>

                {geoStatus !== 'checking' && 'geolocation' in navigator && (
                  <button
                    type="button"
                    onClick={requestCurrentLocation}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-semibold text-sm sm:text-base flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <Navigation className="w-4 h-4" aria-hidden="true" />
                    <span>내 위치로 찾기</span>
                  </button>
                )}
              </div>

              {/* 8 Cities Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CITIES.map((city) => {
                  const isActive = selectedCity === city;
                  return (
                    <button
                      key={city}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => handleCitySelect(city)}
                      className={`min-h-[58px] px-4 py-3 rounded-2xl text-lg sm:text-xl font-bold transition-all duration-150 cursor-pointer flex items-center justify-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 active:scale-[0.98] ${
                        isActive
                          ? 'bg-sky-600 text-white border-2 border-sky-700 shadow-md shadow-sky-600/20'
                          : 'bg-sky-50/50 text-slate-800 border-2 border-sky-100 hover:border-sky-300 hover:bg-sky-50'
                      }`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>

              {/* Sub-region Selection: Seoul (동 단위) */}
              {selectedCity === '서울' && (
                <div className="mt-6 pt-5 border-t border-sky-100 space-y-5">
                  <div>
                    <label
                      htmlFor="seoul-dong-search"
                      className="block text-base sm:text-lg font-bold text-slate-900 mb-2"
                    >
                      서울 동 선택
                    </label>
                    <div className="relative">
                      <Search
                        className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="seoul-dong-search"
                        type="text"
                        value={seoulDongQuery}
                        onChange={(e) => setSeoulDongQuery(e.target.value)}
                        placeholder="동 이름 검색 (예: 역삼동, 여의도동, 잠실동)"
                        className="w-full min-h-[54px] pl-11 pr-11 py-3 rounded-2xl border-2 border-sky-200 bg-sky-50/30 text-base sm:text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                      />
                      {seoulDongQuery && (
                        <button
                          type="button"
                          onClick={() => setSeoulDongQuery('')}
                          aria-label="검색어 지우기"
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-sky-100 cursor-pointer"
                        >
                          <X className="w-5 h-5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search results if typing */}
                  {seoulDongQuery.trim().length > 0 ? (
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-slate-600 mb-3">
                        검색 결과 ({seoulSearchMatches.length}곳)
                      </p>
                      {seoulSearchMatches.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {seoulSearchMatches.map((item) => {
                            const fullLabel = `서울 ${item.gu} ${item.name}`;
                            const isPicked = selectedLocation?.label === fullLabel;
                            return (
                              <button
                                key={fullLabel}
                                type="button"
                                onClick={() =>
                                  handleSelectManualLocation(fullLabel, item.lat, item.lon)
                                }
                                className={`min-h-[56px] px-4 py-3 rounded-2xl text-left text-base sm:text-lg font-bold transition-all cursor-pointer flex items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${
                                  isPicked
                                    ? 'bg-sky-600 text-white border-2 border-sky-700'
                                    : 'bg-white text-slate-800 border-2 border-sky-100 hover:border-sky-300 hover:bg-sky-50'
                                }`}
                              >
                                <span>{item.name}</span>
                                <span
                                  className={`text-sm font-medium ${
                                    isPicked ? 'text-sky-100' : 'text-slate-500'
                                  }`}
                                >
                                  {item.gu}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-base text-slate-600 py-4 px-4 rounded-2xl bg-sky-50/60 border border-sky-100">
                          검색 결과가 없어요. 아래에서 구를 먼저 골라 동을 선택해 보세요.
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Step 1: Pick Gu in Seoul */}
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-slate-600 mb-2.5">
                          1) 먼저 구를 골라 주세요
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                          {SEOUL_GU_LIST.map((item) => {
                            const isGuSelected = selectedSeoulGu === item.gu;
                            return (
                              <button
                                key={item.gu}
                                type="button"
                                aria-pressed={isGuSelected}
                                onClick={() => setSelectedSeoulGu(item.gu)}
                                className={`min-h-[50px] px-2.5 py-2.5 rounded-xl text-base sm:text-lg font-bold transition-all cursor-pointer flex items-center justify-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${
                                  isGuSelected
                                    ? 'bg-sky-100 text-sky-900 border-2 border-sky-500'
                                    : 'bg-white text-slate-800 border-2 border-sky-100 hover:border-sky-300 hover:bg-sky-50/60'
                                }`}
                              >
                                {item.gu}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 2: Pick Dong in selected Gu */}
                      {activeSeoulGuObj && (
                        <div className="pt-4 border-t border-sky-100">
                          <p className="text-sm sm:text-base font-semibold text-sky-900 mb-2.5">
                            2) {activeSeoulGuObj.gu}의 동을 골라 주세요
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {activeSeoulGuObj.dongs.map((dong) => {
                              const fullLabel = `서울 ${activeSeoulGuObj.gu} ${dong.name}`;
                              const isPicked = selectedLocation?.label === fullLabel;
                              return (
                                <button
                                  key={dong.name}
                                  type="button"
                                  aria-pressed={isPicked}
                                  onClick={() =>
                                    handleSelectManualLocation(fullLabel, dong.lat, dong.lon)
                                  }
                                  className={`min-h-[54px] px-3 py-3 rounded-2xl text-base sm:text-lg font-bold transition-all cursor-pointer flex items-center justify-center text-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${
                                    isPicked
                                      ? 'bg-sky-600 text-white border-2 border-sky-700 shadow-sm'
                                      : 'bg-sky-50/60 text-slate-900 border-2 border-sky-100 hover:border-sky-400 hover:bg-sky-50'
                                  }`}
                                >
                                  {dong.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Sub-region Selection: Other Cities (군/구 단위) */}
              {selectedCity && selectedCity !== '서울' && (
                <div className="mt-6 pt-5 border-t border-sky-100">
                  <p className="text-base sm:text-lg font-bold text-slate-900 mb-3">
                    {selectedCity} 세부 지역을 골라 주세요
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    {OTHER_CITY_DISTRICTS[selectedCity].map((district) => {
                      const fullLabel = `${selectedCity} ${district.name}`;
                      const isPicked = selectedLocation?.label === fullLabel;
                      return (
                        <button
                          key={district.name}
                          type="button"
                          aria-pressed={isPicked}
                          onClick={() =>
                            handleSelectManualLocation(fullLabel, district.lat, district.lon)
                          }
                          className={`min-h-[56px] px-3 py-3 rounded-2xl text-base sm:text-lg font-bold transition-all cursor-pointer flex items-center justify-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${
                            isPicked
                              ? 'bg-sky-600 text-white border-2 border-sky-700 shadow-md shadow-sky-600/20'
                              : 'bg-sky-50/60 text-slate-900 border-2 border-sky-100 hover:border-sky-400 hover:bg-sky-50'
                          }`}
                        >
                          {district.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Weather Display Section */}
        {(selectedLocation || isLoadingWeather || weatherError) && (
          <section aria-labelledby="weather-heading" aria-live="polite">
            <h2 id="weather-heading" className="text-xl sm:text-2xl font-bold text-slate-900 mb-3.5">
              날씨 안내
            </h2>

            {isLoadingWeather && (
              <div className="rounded-3xl bg-white border-2 border-sky-200 p-7 sm:p-9 flex flex-col items-center justify-center text-center gap-3 shadow-xs">
                <Loader2 className="w-10 h-10 animate-spin text-sky-600" aria-hidden="true" />
                <p className="text-xl sm:text-2xl font-bold text-sky-950">
                  날씨를 확인하는 중…
                </p>
                {selectedLocation && (
                  <p className="text-base text-slate-500">{selectedLocation.label}</p>
                )}
              </div>
            )}

            {!isLoadingWeather && weatherError && (
              <div className="rounded-3xl bg-amber-50 border-2 border-amber-200 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-lg font-bold text-amber-950">{weatherError}</p>
                </div>
                <button
                  type="button"
                  onClick={handleRetryWeather}
                  className="min-h-[48px] px-5 py-2.5 rounded-xl bg-white border-2 border-amber-300 text-amber-950 font-bold text-base flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-100/60 transition-colors shrink-0"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  <span>다시 확인하기</span>
                </button>
              </div>
            )}

            {!isLoadingWeather && !weatherError && weather && selectedLocation && (
              <div className="rounded-3xl bg-gradient-to-br from-white via-[#F5FAFF] to-[#E6F4FF] border-2 border-sky-300 p-6 sm:p-8 shadow-md shadow-sky-500/10">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sky-800 font-bold text-base sm:text-lg">
                    <MapPin className="w-5 h-5 text-sky-600 shrink-0" aria-hidden="true" />
                    <span>{selectedLocation.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetryWeather}
                    aria-label="날씨 새로고침"
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/90 border border-sky-200 text-sky-800 text-sm font-semibold flex items-center gap-1.5 hover:bg-sky-50 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    <span>새로고침</span>
                  </button>
                </div>

                {/* Big Hero Weather Line */}
                <p className="text-2xl sm:text-4xl font-bold text-slate-900 leading-snug tracking-tight tabular-nums">
                  <span className="mr-2" aria-hidden="true">
                    {weather.conditionEmoji}
                  </span>
                  지금 {weather.currentTemp}℃{' '}
                  <span className="text-xl sm:text-2xl font-semibold text-slate-700">
                    (체감 {weather.apparentTemp}℃)
                  </span>{' '}
                  · {weather.conditionLabel}
                </p>

                <hr className="my-4 sm:my-5 border-sky-200/80" />

                {/* Big Daily Summary Line */}
                <p className="text-lg sm:text-2xl font-bold text-sky-950 leading-relaxed tabular-nums">
                  오늘 최저 {weather.minTemp}℃ · 최고 {weather.maxTemp}℃ · 비 올 확률{' '}
                  {weather.precipitationProbability}%
                </p>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Bottom Action Buttons: '이전' & '🤖 옷차림 추천받기' */}
      <section className="mt-10 sm:mt-12 pt-6 border-t border-sky-100">
        {!weather && !isLoadingWeather && (
          <p className="mb-4 text-base sm:text-lg font-semibold text-sky-900 bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3">
            먼저 위에서 지역을 골라 오늘 날씨를 확인해 주세요.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[60px] px-5 rounded-2xl border-2 border-sky-200 bg-white hover:bg-sky-50 text-sky-900 text-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 active:scale-[0.99]"
          >
            <ArrowLeft className="w-6 h-6" aria-hidden="true" />
            <span>이전</span>
          </button>

          <button
            type="button"
            onClick={handleRecommendClick}
            className={`min-h-[60px] px-5 rounded-2xl text-xl font-bold flex items-center justify-center gap-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${
              weather && !isLoadingWeather
                ? 'bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white shadow-lg shadow-sky-600/25 cursor-pointer'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>🤖 옷차림 추천받기</span>
          </button>
        </div>
      </section>
    </main>
  );
}
