import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/AdminLayout';
import EventForm from '../../components/EventForm';
import { eventService } from '../../services/api';
import { Event } from '../../types';

const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: events, isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ['adminEvents'],
    queryFn: () => eventService.getAllEvents(),
  });

  const event = events?.find((e) => e.id === Number(id));

  const handleSubmit = async (data: any) => {
    if (!id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await eventService.updateEvent(Number(id), data);
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      navigate('/admin/events');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update event';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/events');
  };

  if (isLoadingEvents) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Event not found</p>
          <button
            onClick={() => navigate('/admin/events')}
            className="text-blue-600 hover:text-blue-900 mt-2"
          >
            Back to Events
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Event</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <EventForm
            initialData={event}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditEventPage;
