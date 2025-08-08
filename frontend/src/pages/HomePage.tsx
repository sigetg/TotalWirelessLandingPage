import React, { useState, useCallback, useEffect } from 'react';
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
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Don't show error to user, just fall back to UTC
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    }
  }, []);

  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
  } = useQuery<EventSearchResult[]>({
    queryKey: ['events', searchParams, userLocation],
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
                src="/totalwireless_logo.png" 
                alt="Total Wireless" 
                className="h-28 w-auto"
                style={{ height: '108px' }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="rounded-2xl shadow-xl mx-4 sm:mx-6 lg:mx-8 my-8 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/blue_ad.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              {translations[lang].findEvents}
            </h1>
            <p className="text-xl mb-8 text-white drop-shadow-lg">
              {translations[lang].discover}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8 rounded-2xl shadow-xl p-8 relative overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/aqua_ad.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 drop-shadow-lg">
              {lang === 'es' ? 'Buscar eventos' : 'Find Events'}
            </h2>
            <SearchForm 
              onSearch={handleSearch} 
              isLoading={searchParams ? isLoading : false} 
              lang={lang} 
              translations={translations[lang]}
              userLocation={userLocation}
            />
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
                    {error instanceof Error && (error as any)?.response?.data?.error
                      ? (error as any).response.data.error
                      : error instanceof Error
                      ? error.message
                      : translations[lang].error}
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