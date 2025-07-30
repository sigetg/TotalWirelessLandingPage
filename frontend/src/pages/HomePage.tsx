import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import SearchForm from '../components/SearchForm';
import EventCard from '../components/EventCard';
import { eventService } from '../services/api';
import { SearchFormData, EventSearchResult } from '../types';

const translations = {
  es: {
    findEvents: 'Me alegro que hayas llegado',
    discover: 'Ingresa tu código postal o dirección y mira lo que sucede en tu área',
    findEventsHeader: 'Me alegro que hayas llegado',
    searching: 'Buscando eventos...',
    error: 'Ocurrió un error al buscar eventos',
    noResults: 'No se encontraron eventos para los criterios de búsqueda.',
    enterLocation: 'Ingrese cualquier combinación de dirección, código postal o ciudad y estado',
    welcome: 'Bienvenido a Buscador de Eventos',
    welcomeDesc: 'Descubre eventos y actividades emocionantes cerca de ti. Simplemente ingresa tu ubicación arriba para comenzar.',
    feature1Title: 'Encuentra eventos cercanos',
    feature1Desc: 'Busca por dirección, código postal o ciudad para encontrar eventos en tu área',
    feature2Title: 'Información en tiempo real',
    feature2Desc: 'Obtén distancia precisa y direcciones para cada evento',
    feature3Title: 'Detalles del evento',
    feature3Desc: 'Consulta fechas, horarios, ubicaciones y tipos de eventos de un vistazo',
  },
  en: {
    findEvents: 'Glad you made it here',
    discover: "Enter your zip code or address and see what's happening in your area",
    findEventsHeader: 'Glad you made it here',
    searching: 'Searching for events...',
    error: 'An error occurred while searching for events',
    noResults: 'No events found for the search criteria.',
    enterLocation: 'Enter any combination of address, zip code, or city and state',
    welcome: 'Welcome to Event Finder',
    welcomeDesc: 'Discover exciting events and activities happening near you. Simply enter your location above to get started.',
    feature1Title: 'Find Nearby Events',
    feature1Desc: 'Search by address, zip code, or city to find events in your area',
    feature2Title: 'Real-time Information',
    feature2Desc: 'Get accurate distance and driving directions to each event',
    feature3Title: 'Event Details',
    feature3Desc: 'View dates, times, locations, and event types at a glance',
  }
};

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useState<SearchFormData | null>(null);
  const [lang, setLang] = useState<'en' | 'es'>('en');

  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
  } = useQuery<EventSearchResult[]>({
    queryKey: ['events', searchParams],
    queryFn: () => {
      if (!searchParams) return Promise.resolve([]);
      
      // Filter out empty values
      const params = Object.fromEntries(
        Object.entries(searchParams).filter(([_, value]) => value !== '' && value !== undefined)
      );
      
      // Only proceed if we have at least one search parameter
      if (Object.keys(params).length === 0) {
        return Promise.resolve([]);
      }
      
      return eventService.searchEventsByLocation(params);
    },
    enabled: !!searchParams && Object.keys(searchParams).some(key => searchParams[key as keyof SearchFormData] !== '' && searchParams[key as keyof SearchFormData] !== undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleSearch = useCallback((data: SearchFormData) => {
    // Only set search params if we have at least one non-empty value
    const hasValidParams = Object.values(data).some(value => value !== '' && value !== undefined);
    if (hasValidParams) {
      setSearchParams(data);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center py-2">
            <button
              className="hover:text-gray-300 focus:outline-none"
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            >
              {lang === 'es' ? 'English' : 'Español'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-4">
            {/* Logo */}
            <div className="flex items-center justify-center w-full">
              <img 
                src="/verizontotallogo.png" 
                alt="Total Wireless" 
                className="h-28 w-auto"
                style={{ height: '108px' }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-slate-900 rounded-2xl shadow-xl mx-4 sm:mx-6 lg:mx-8 my-8 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              {translations[lang].findEvents}
            </h1>
            <p className="text-xl mb-8 text-teal-300" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              {translations[lang].discover}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl shadow-xl p-8 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              {lang === 'es' ? 'Buscar eventos' : 'Find Events'}
            </h2>
            <SearchForm onSearch={handleSearch} isLoading={searchParams ? isLoading : false} lang={lang} translations={translations[lang]} />
          </div>
        </div>

        {/* Results Section */}
        {searchParams && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="text-center">
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                  <span className="text-lg font-medium text-gray-700">{translations[lang].searching}</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">
                    {error instanceof Error
                      ? translations[lang].error
                      : (error as any)?.response?.data?.error || translations[lang].error}
                  </p>
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div>
                  {/* Results Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((result, idx) => (
                      <EventCard key={idx} eventResult={result} lang={lang} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-lg">{translations[lang].noResults}</div>
              )}
            </div>
          </div>
        )}

        {/* Welcome Message */}
        {!searchParams && (
          <div className="text-center py-12">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {translations[lang].welcome}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {translations[lang].welcomeDesc}
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{translations[lang].feature1Title}</h3>
                  <p className="text-gray-600">{translations[lang].feature1Desc}</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-teal-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{translations[lang].feature2Title}</h3>
                  <p className="text-gray-600">{translations[lang].feature2Desc}</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{translations[lang].feature3Title}</h3>
                  <p className="text-gray-600">{translations[lang].feature3Desc}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        </div>
      </footer>
    </div>
  );
};

export default HomePage; 