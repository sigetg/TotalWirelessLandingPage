import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/AdminLayout';
import EventForm from '../../components/EventForm';
import BulkEventForm from '../../components/BulkEventForm';
import { eventService } from '../../services/api';

const AddEventPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await eventService.addEvent(data);
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      navigate('/admin/events');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to create event';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/events');
  };

  const handleBulkSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
    navigate('/admin/events');
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Event</h1>

        {/* Tab buttons */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('single')}
            className={`py-3 px-6 text-sm font-medium ${
              activeTab === 'single'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Single Event
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`py-3 px-6 text-sm font-medium ${
              activeTab === 'bulk'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bulk Add
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          {activeTab === 'single' ? (
            <EventForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              error={error}
            />
          ) : (
            <BulkEventForm onSuccess={handleBulkSuccess} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddEventPage;
