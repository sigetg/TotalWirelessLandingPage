import React, { useState, useEffect } from 'react';
import { Event, EventUpdate } from '../types';
import { eventService } from '../services/api';
import CsvUploadSection from './CsvUploadSection';

interface AdminDataManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditableEvent extends Event {
  isEditing?: boolean;
  isNew?: boolean;
  hasChanges?: boolean;
}

const AdminDataManager: React.FC<AdminDataManagerProps> = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState<EditableEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadEvents();
    }
  }, [isOpen]);

  const loadEvents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const allEvents = await eventService.getAllEvents();
      setEvents(allEvents.map(event => ({ ...event, isEditing: false, isNew: false, hasChanges: false })));
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, isEditing: true } : event
    ));
  };

  const handleCancelEdit = (id: number) => {
    if (events.find(e => e.id === id)?.isNew) {
      // Remove new events that weren't saved
      setEvents(prev => prev.filter(event => event.id !== id));
    } else {
      // Reset to original state
      setEvents(prev => prev.map(event => 
        event.id === id ? { ...event, isEditing: false, hasChanges: false } : event
      ));
    }
  };

  const handleFieldChange = (id: number, field: keyof EventUpdate, value: string) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, [field]: value, hasChanges: true } : event
    ));
  };

  const handleSave = async (id: number) => {
    const event = events.find(e => e.id === id);
    if (!event) return;

    try {
      if (event.isNew) {
        // Create new event
        const newEvent = await eventService.addEvent({
          event_date: event.event_date,
          event_time: event.event_time,
          event_type: event.event_type,
          address: event.address,
          address2: event.address2,
          city: event.city,
          state: event.state,
          zip: event.zip,
          start_date: event.start_date,
          end_date: event.end_date,
        });
        
        setEvents(prev => prev.map(e => 
          e.id === id ? { ...newEvent, isEditing: false, isNew: false, hasChanges: false } : e
        ));
      } else {
        // Update existing event
        const updateData: EventUpdate = {};
        if (event.hasChanges) {
          Object.keys(event).forEach(key => {
            if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'isEditing' && key !== 'isNew' && key !== 'hasChanges') {
              updateData[key as keyof EventUpdate] = event[key as keyof Event] as string;
            }
          });
          
          const updatedEvent = await eventService.updateEvent(id, updateData);
          setEvents(prev => prev.map(e => 
            e.id === id ? { ...updatedEvent, isEditing: false, hasChanges: false } : e
          ));
        }
      }
    } catch (err) {
      setError('Failed to save event');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventService.deleteEvent(id);
      setEvents(prev => prev.filter(event => event.id !== id));
      setSuccess('Event deleted successfully');
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  const handleAddNew = () => {
    // Use a unique negative ID for new events
    const existingIds = events.map(e => e.id);
    const newId = existingIds.length > 0 ? Math.min(...existingIds) - 1 : -1;
    const newEvent: EditableEvent = {
      id: newId,
      event_date: '',
      event_time: '',
      event_type: '',
      address: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      start_date: '',
      end_date: '',
      latitude: 0,
      longitude: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isEditing: true,
      isNew: true,
      hasChanges: false,
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const handleSaveAll = async () => {
    const eventsToSave = events.filter(event => event.hasChanges || event.isNew);
    
    for (const event of eventsToSave) {
      try {
        await handleSave(event.id);
      } catch (err) {
        setError(`Failed to save event ${event.id}`);
        return;
      }
    }
    
    setSuccess('All changes saved successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleUploadSuccess = (message: string) => {
    setSuccess(message);
    loadEvents(); // Reload events after upload
    setTimeout(() => setSuccess(''), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Event Data Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* CSV Upload Section */}
          <div className="p-6 border-b">
            <CsvUploadSection onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-6 mt-4 text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mx-6 mt-4 text-green-600 text-sm bg-green-50 p-2 rounded">
              {success}
            </div>
          )}

          {/* Controls */}
          <div className="p-6 border-b flex justify-between items-center">
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add New Event
            </button>
            
            <button
              onClick={handleSaveAll}
              disabled={!events.some(e => e.hasChanges || e.isNew)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save All Changes
            </button>
          </div>

          {/* Events Table */}
          <div className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-2">Loading events...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zip</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinates</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event, index) => (
                      <tr key={`${event.id}-${index}`} className={event.isNew ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {event.isEditing ? (
                            <input
                              type="date"
                              value={event.event_date}
                              onChange={(e) => handleFieldChange(event.id, 'event_date', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{event.event_date}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {event.isEditing ? (
                            <input
                              type="time"
                              value={event.event_time}
                              onChange={(e) => handleFieldChange(event.id, 'event_time', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{event.event_time}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {event.isEditing ? (
                            <input
                              type="text"
                              value={event.event_type}
                              onChange={(e) => handleFieldChange(event.id, 'event_type', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{event.event_type}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {event.isEditing ? (
                            <input
                              type="text"
                              value={event.address}
                              onChange={(e) => handleFieldChange(event.id, 'address', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{event.address}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {event.isEditing ? (
                            <input
                              type="text"
                              value={event.city}
                              onChange={(e) => handleFieldChange(event.id, 'city', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{event.city}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {event.isEditing ? (
                            <input
                              type="text"
                              value={event.state}
                              onChange={(e) => handleFieldChange(event.id, 'state', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{event.state}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {event.isEditing ? (
                            <input
                              type="text"
                              value={event.zip}
                              onChange={(e) => handleFieldChange(event.id, 'zip', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{event.zip}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {event.latitude && event.longitude && 
                           !isNaN(Number(event.latitude)) && !isNaN(Number(event.longitude)) ? (
                            <span className="text-green-600">
                              ✓ {Number(event.latitude).toFixed(4)}, {Number(event.longitude).toFixed(4)}
                            </span>
                          ) : (
                            <span className="text-red-500">No coordinates</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {event.isEditing ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSave(event.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => handleCancelEdit(event.id)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(event.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(event.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDataManager;
