import React from 'react';
import { MapPin, Clock, Calendar, Car } from 'lucide-react';
import { EventSearchResult } from '../types';

interface EventCardProps {
  eventResult: EventSearchResult;
}

const EventCard: React.FC<EventCardProps> = ({ eventResult }) => {
  const { event, distance, driving_distance, driving_duration } = eventResult;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
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

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="p-6">
        {/* Event Type Badge */}
        <div className="mb-4">
          <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {event.event_type}
          </span>
        </div>

        {/* Event Details */}
        <div className="space-y-3">
          {/* Date and Time */}
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formatDate(event.event_date)}</span>
          </div>

          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{formatTime(event.event_time)}</span>
          </div>

          {/* Address */}
          <div className="flex items-start space-x-2 text-gray-700">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
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
                <span>Straight-line: {formatDistance(distance)}</span>
              </div>
            </div>

            {driving_distance && driving_duration && (
              <div className="flex items-center justify-between text-sm mt-1">
                <div className="flex items-center space-x-1 text-blue-600">
                  <Car className="h-4 w-4" />
                  <span>Driving: {formatDrivingDistance(driving_distance)}</span>
                </div>
                <span className="text-gray-500">
                  {formatDrivingDuration(driving_duration)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
            Get Directions
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard; 