import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/AdminLayout';
import { eventService } from '../../services/api';
import { Event } from '../../types';

type SortColumn = 'event_type' | 'event_date' | 'event_time' | 'address' | 'city' | 'state';
type SortDirection = 'asc' | 'desc';
type EventTab = 'active' | 'inactive';

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const isEventActive = (event: Event): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If event has end_date, check if it's still running
  if (event.end_date) {
    // Parse date string - handle both "2026-02-15" and "2026-02-15T00:00:00.000Z"
    const endDate = new Date(event.end_date);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today;
  }

  // Otherwise check event_date
  const eventDate = new Date(event.event_date);
  eventDate.setHours(0, 0, 0, 0);
  return eventDate >= today;
};

const EventListPage: React.FC = () => {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('event_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [activeTab, setActiveTab] = useState<EventTab>('active');
  const queryClient = useQueryClient();

  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ['adminEvents'],
    queryFn: () => eventService.getAllEventsAdmin(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => eventService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      setDeleteId(null);
    },
  });

  const filteredAndSortedEvents = useMemo(() => {
    if (!events) return [];

    // Filter by active/inactive tab
    const tabFiltered = events.filter((event) => {
      const active = isEventActive(event);
      return activeTab === 'active' ? active : !active;
    });

    // Filter by search term
    const filtered = tabFiltered.filter((event) => {
      const term = searchTerm.toLowerCase();
      return (
        event.event_type.toLowerCase().includes(term) ||
        event.address.toLowerCase().includes(term) ||
        event.city.toLowerCase().includes(term) ||
        event.state.toLowerCase().includes(term)
      );
    });

    // Sort by selected column
    return [...filtered].sort((a, b) => {
      let aVal: string | Date;
      let bVal: string | Date;

      if (sortColumn === 'event_date') {
        aVal = new Date(a.event_date);
        bVal = new Date(b.event_date);
      } else {
        aVal = (a[sortColumn] || '').toLowerCase();
        bVal = (b[sortColumn] || '').toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [events, searchTerm, sortColumn, sortDirection, activeTab]);

  const eventCounts = useMemo(() => {
    if (!events) return { active: 0, inactive: 0 };
    return events.reduce(
      (acc, event) => {
        if (isEventActive(event)) {
          acc.active++;
        } else {
          acc.inactive++;
        }
        return acc;
      },
      { active: 0, inactive: 0 }
    );
  }, [events]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIndicator = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Link
          to="/admin/events/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Event
        </Link>
      </div>

      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Events
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'active'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {eventCounts.active}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inactive'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Inactive Events
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'inactive'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {eventCounts.inactive}
            </span>
          </button>
        </nav>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to load events
        </div>
      ) : (activeTab === 'active' ? eventCounts.active : eventCounts.inactive) > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {filteredAndSortedEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No events match your search</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort('event_type')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Type<SortIndicator column="event_type" />
                  </th>
                  <th
                    onClick={() => handleSort('event_date')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Date<SortIndicator column="event_date" />
                  </th>
                  <th
                    onClick={() => handleSort('event_time')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Time<SortIndicator column="event_time" />
                  </th>
                  <th
                    onClick={() => handleSort('address')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Address<SortIndicator column="address" />
                  </th>
                  <th
                    onClick={() => handleSort('city')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    City<SortIndicator column="city" />
                  </th>
                  <th
                    onClick={() => handleSort('state')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    State<SortIndicator column="state" />
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {event.event_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(event.event_date)}
                      {event.start_date && event.end_date && (
                        <span className="block text-xs text-gray-400">
                          {formatDate(event.start_date)} - {formatDate(event.end_date)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.event_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.address}
                      {event.address2 && <span>, {event.address2}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/events/${event.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={deleteMutation.isPending && deleteId === event.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {deleteMutation.isPending && deleteId === event.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {searchTerm
              ? `No ${activeTab} events match your search`
              : `No ${activeTab} events found`}
          </p>
          {activeTab === 'active' && !searchTerm && (
            <Link
              to="/admin/events/new"
              className="text-blue-600 hover:text-blue-900 mt-2 inline-block"
            >
              Add your first event
            </Link>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default EventListPage;
