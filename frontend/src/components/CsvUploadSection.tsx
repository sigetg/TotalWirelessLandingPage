import React, { useState } from 'react';
import { eventService } from '../services/api';

interface CsvUploadSectionProps {
  onUploadSuccess: (message: string) => void;
}

const CsvUploadSection: React.FC<CsvUploadSectionProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      setError('');
      setSuccess('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const response = await eventService.bulkUploadEvents(selectedFile);
      if (response.success) {
        setSuccess(response.message);
        onUploadSuccess(response.message);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('csv-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(response.error || 'Upload failed');
        if (response.details) {
          setError(response.error + ': ' + response.details.join(', '));
        }
      }
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError('');
    setSuccess('');
    const fileInput = document.getElementById('csv-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">CSV Upload</h3>
      
      <div className="space-y-3">
        <div>
          <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 mb-1">
            Select CSV File
          </label>
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
          />
        </div>

        {selectedFile && (
          <div className="text-sm text-gray-600">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm bg-green-50 p-2 rounded">
            {success}
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload CSV'}
          </button>
          
          <button
            onClick={handleClear}
            disabled={isUploading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Clear
          </button>
        </div>

        <div className="text-xs text-gray-500">
          <p>CSV format should include columns: event_date, event_time, event_type, address, address2, city, state, zip, start_date, end_date</p>
        </div>
      </div>
    </div>
  );
};

export default CsvUploadSection;
