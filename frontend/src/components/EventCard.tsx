import React from 'react';
import { MapPin, Clock, Calendar, Car } from 'lucide-react';
import { EventSearchResult } from '../types';

interface EventCardProps {
  eventResult: EventSearchResult;
  lang?: 'en' | 'es';
}

const EventCard: React.FC<EventCardProps> = ({ eventResult, lang = 'en' }) => {
  const { event, distance, driving_distance, driving_duration } = eventResult;

  const formatDate = (dateString: string) => {
    // Parse date without timezone conversion by manually creating a local date
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShortDate = (dateString: string) => {
    // Parse date without timezone conversion by manually creating a local date
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Format date display based on start_date and optional end_date
   * - Single date: "Friday, February 20, 2026"
   * - Date range: "Feb 20, 2026 — Feb 22, 2026"
   */
  const formatDateDisplay = (startDate: string, endDate?: string) => {
    if (endDate && endDate !== startDate) {
      return `${formatShortDate(startDate)} — ${formatShortDate(endDate)}`;
    }
    return formatDate(startDate);
  };

  /**
   * Format time display based on start_time and optional end_time
   * - No times: "All Day"
   * - Only start_time: "3:00 PM"
   * - Both times: "3:00 PM - 5:00 PM"
   */
  const formatTimeDisplay = (startTime?: string, endTime?: string) => {
    if (!startTime) {
      return lang === 'es' ? 'Todo el día' : 'All Day';
    }

    const formatTime = (timeStr: string) => {
      // Parse HH:MM:SS format
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
    };

    const formattedStart = formatTime(startTime);

    if (endTime) {
      const formattedEnd = formatTime(endTime);
      return `${formattedStart} - ${formattedEnd}`;
    }

    return formattedStart;
  };

  const formatDistance = (miles: number) => {
    if (miles < 1) {
      return `${Math.round(miles * 5280)} feet`;
    }
    return `${miles.toFixed(1)} miles`;
  };

  const formatDrivingDistance = (meters: number) => {
    const miles = meters * 0.000621371;
    return `${miles.toFixed(1)} miles`;
  };

  const formatDrivingDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Helper to build Google Maps link
  const getGoogleMapsUrl = () => {
    const parts = [event.address, event.address2, event.city, event.state, event.zip]
      .filter(Boolean)
      .join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`;
  };

  const translations = {
    en: {
      straightLine: 'Straight-line',
      driving: 'Driving',
      getDirections: 'Get Directions',
    },
    es: {
      straightLine: 'En línea recta',
      driving: 'En coche',
      getDirections: 'Obtener direcciones',
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="p-6">
        {/* Event Type Badge */}
        <div className="mb-4">
          <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            {event.event_type}
          </span>
        </div>

        {/* Event Details */}
        <div className="space-y-3">
          {/* Date */}
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              {formatDateDisplay(event.start_date, event.end_date)}
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              {formatTimeDisplay(event.start_time, event.end_time)}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start space-x-2 text-gray-700">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="text-sm" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              <div>{event.address}</div>
              {event.address2 && <div>{event.address2}</div>}
              <div>{event.city}, {event.state} {event.zip}</div>
            </div>
          </div>

          {/* Distance Information */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-teal-600">
                <MapPin className="h-4 w-4" />
                <span style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{translations[lang].straightLine}: {formatDistance(distance)}</span>
              </div>
            </div>

            {driving_distance && driving_duration && (
              <div className="flex items-center justify-between text-sm mt-1">
                <div className="flex items-center space-x-1 text-blue-600">
                  <Car className="h-4 w-4" />
                  <span style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{translations[lang].driving}: {formatDrivingDistance(driving_distance)}</span>
                </div>
                <span className="text-gray-500" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  {formatDrivingDuration(driving_duration)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 text-base shadow-lg"
            onClick={() => window.open(getGoogleMapsUrl(), '_blank', 'noopener,noreferrer')}
            type="button"

          >
            {translations[lang].getDirections}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
