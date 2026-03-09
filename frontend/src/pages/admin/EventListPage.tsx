import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/AdminLayout';
import { eventService } from '../../services/api';
import { Event } from '../../types';

type SortColumn = 'event_type' | 'start_date' | 'end_date' | 'start_time' | 'address' | 'city' | 'state' | 'zip';
type SortDirection = 'asc' | 'desc';
type EventTab = 'active' | 'inactive';

const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('T')[0].split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return 'All Day';
  // Parse HH:MM:SS format
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

const isEventActive = (event: Event): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If event has end_date, check if it's still running
  if (event.end_date) {
    const [ey, em, ed] = event.end_date.split('T')[0].split('-');
    const endDate = new Date(Number(ey), Number(em) - 1, Number(ed));
    return endDate >= today;
  }

  // Otherwise check start_date
  const [sy, sm, sd] = event.start_date.split('T')[0].split('-');
  const startDate = new Date(Number(sy), Number(sm) - 1, Number(sd));
  return startDate >= today;
};

const EventListPage: React.FC = () => {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('start_date');
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

      if (sortColumn === 'start_date') {
        aVal = new Date(a.start_date);
        bVal = new Date(b.start_date);
      } else if (sortColumn === 'end_date') {
        aVal = a.end_date ? new Date(a.end_date) : new Date(a.start_date);
        bVal = b.end_date ? new Date(b.end_date) : new Date(b.start_date);
      } else if (sortColumn === 'start_time') {
        aVal = a.start_time || '';
        bVal = b.start_time || '';
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
                    onClick={() => handleSort('start_date')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Start Date<SortIndicator column="start_date" />
                  </th>
                  <th
                    onClick={() => handleSort('end_date')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    End Date<SortIndicator column="end_date" />
                  </th>
                  <th
                    onClick={() => handleSort('start_time')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Time<SortIndicator column="start_time" />
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
                  <th
                    onClick={() => handleSort('zip')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    ZIP<SortIndicator column="zip" />
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
                      {formatDate(event.start_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.end_date ? formatDate(event.end_date) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(event.start_time)}
                      {event.end_time && (
                        <span className="text-gray-400"> - {formatTime(event.end_time)}</span>
                      )}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.zip}
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
