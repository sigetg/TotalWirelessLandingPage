import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import EventListPage from './pages/admin/EventListPage';
import AddEventPage from './pages/admin/AddEventPage';
import EditEventPage from './pages/admin/EditEventPage';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/admin" element={<AdminLoginPage />} />
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute>
                    <EventListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/new"
                element={
                  <ProtectedRoute>
                    <AddEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditEventPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
