import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import SearchForm from '../components/SearchForm';
import EventCard from '../components/EventCard';
import { eventService } from '../services/api';
import { SearchFormData, EventSearchResult } from '../types';

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useState<SearchFormData | null>(null);

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
      <div className="bg-black text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center space-x-6">
              <a href="#" className="hover:text-gray-300">Español</a>
              <a href="#" className="hover:text-gray-300">Find a store</a>
              <a href="#" className="hover:text-gray-300">Help & support</a>
              <span>611611</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/verizontotallogo.png" 
                alt="Total Wireless" 
                className="h-12 w-auto"
              />
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-900 hover:text-red-600 font-medium">Shop</a>
              <a href="#" className="text-gray-900 hover:text-red-600 font-medium">Deals</a>
              <a href="#" className="text-gray-900 hover:text-red-600 font-medium">Pay</a>
              <a href="#" className="text-gray-900 hover:text-red-600 font-medium">Activate</a>
              <a href="#" className="text-gray-900 hover:text-red-600 font-medium">Why Total Wireless</a>
            </nav>
            
            {/* Right side */}
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-900 hover:text-red-600 font-medium">Login</a>
              <a href="#" className="text-gray-900 hover:text-red-600 font-medium">Total Rewards</a>
              <button className="text-gray-900 hover:text-red-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="text-gray-900 hover:text-red-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-900 to-teal-400 relative overflow-hidden hero-pattern">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center text-white">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Find Events Near You
            </h1>
            <p className="text-xl mb-8">
              Discover exciting events and activities happening in your area
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Events Near You</h2>
          <SearchForm onSearch={handleSearch} isLoading={searchParams ? isLoading : false} />
        </div>

        {/* Results Section */}
        {searchParams && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="text-center">
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                  <span className="text-lg font-medium text-gray-700">Searching for events...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">
                    {error instanceof Error ? error.message : 'An error occurred while searching for events'}
                  </p>
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Found {searchResults.length} events near you
                  </h2>
                  <p className="text-gray-600">
                    Events sorted by distance from your location
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-700">
                    No events found within your search radius. Try expanding your search area or checking a different location.
                  </p>
                </div>
              )}
            </div>

            {/* Results Grid */}
            {searchResults && searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((eventResult) => (
                  <EventCard key={eventResult.event.id} eventResult={eventResult} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Welcome Message */}
        {!searchParams && (
          <div className="text-center py-12">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Event Finder
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Discover exciting events and activities happening near you. 
                Simply enter your location above to get started.
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Nearby Events</h3>
                  <p className="text-gray-600">Search by address, zip code, or city to find events in your area</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-teal-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Information</h3>
                  <p className="text-gray-600">Get accurate distance and driving directions to each event</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Details</h3>
                  <p className="text-gray-600">View dates, times, locations, and event types at a glance</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">
              We use technologies to collect and share information about your use of our site. 
              By continuing, you agree to the use of these capabilities for a better experience and other purposes. 
              Learn more in our <a href="#" className="underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 