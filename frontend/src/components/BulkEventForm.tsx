import React, { useState, useRef } from 'react';
import { eventService } from '../services/api';
import { BulkAddError, EventFormData } from '../types';

interface BulkEventFormProps {
  onSuccess: () => void;
}

const BulkEventForm: React.FC<BulkEventFormProps> = ({ onSuccess }) => {
  const [csvText, setCsvText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<BulkAddError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleCsv = `start_date,end_date,start_time,end_time,event_type,address,address2,city,state,zip
2025-03-15,,10:00,,SSI,123 Main St,,Los Angeles,CA,90001
2025-03-20,2025-03-22,3pm,5pm,Event Landing Page,456 Oak Ave,,San Diego,CA,92101`;

  const downloadSample = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event_upload_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): EventFormData[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have a header row and at least one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['start_date', 'event_type', 'address', 'city', 'state', 'zip'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    return lines.slice(1).filter(line => line.trim()).map(line => {
      // Handle CSV parsing with potential commas in quoted fields
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const obj: Record<string, string> = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] || '';
      });

      return {
        start_date: obj.start_date,
        end_date: obj.end_date || undefined,
        start_time: obj.start_time || undefined,
        end_time: obj.end_time || undefined,
        event_type: obj.event_type,
        address: obj.address,
        address2: obj.address2 || '',
        city: obj.city,
        state: obj.state,
        zip: obj.zip,
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setCsvText(''); // Clear text when file is selected
      setErrors([]);
      setSuccessCount(null);

      // Read file content and show in textarea
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCsvText(content);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvText(e.target.value);
    setFile(null); // Clear file when text is changed
    setErrors([]);
    setSuccessCount(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    setErrors([]);
    setSuccessCount(null);

    if (!csvText.trim()) {
      setErrors([{ row: 0, address: '', error: 'Please upload a CSV file or paste CSV content' }]);
      return;
    }

    setIsSubmitting(true);

    try {
      const events = parseCSV(csvText);

      if (events.length === 0) {
        setErrors([{ row: 0, address: '', error: 'No events found in CSV' }]);
        return;
      }

      const result = await eventService.bulkAddEvents(events);

      if (result.success) {
        setSuccessCount(result.events?.length || 0);
        setCsvText('');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else if (result.errors) {
        setErrors(result.errors);
      }
    } catch (err: any) {
      const message = err.response?.data?.errors?.[0]?.error || err.message || 'Failed to upload events';
      setErrors([{ row: 0, address: '', error: message }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Upload multiple events at once using a CSV file.
        </p>
        <button
          type="button"
          onClick={downloadSample}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Sample CSV
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">CSV Format</h4>
        <p className="text-xs text-blue-700 mb-2">
          Required columns: <code className="bg-blue-100 px-1 rounded">start_date</code>, <code className="bg-blue-100 px-1 rounded">event_type</code>, <code className="bg-blue-100 px-1 rounded">address</code>, <code className="bg-blue-100 px-1 rounded">city</code>, <code className="bg-blue-100 px-1 rounded">state</code>, <code className="bg-blue-100 px-1 rounded">zip</code>
        </p>
        <p className="text-xs text-blue-700 mb-2">
          Optional columns: <code className="bg-blue-100 px-1 rounded">end_date</code>, <code className="bg-blue-100 px-1 rounded">start_time</code>, <code className="bg-blue-100 px-1 rounded">end_time</code>, <code className="bg-blue-100 px-1 rounded">address2</code>
        </p>
        <p className="text-xs text-blue-700">
          <strong>Time formats accepted:</strong> 3pm, 3:30pm, 3:30 PM, 15:00, 12am (leave empty for "All Day")
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload CSV File
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">OR paste CSV below</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CSV Content
        </label>
        <textarea
          value={csvText}
          onChange={handleTextChange}
          rows={10}
          placeholder={`Paste CSV content here...\n\nExample:\nstart_date,end_date,start_time,end_time,event_type,address,address2,city,state,zip\n2025-03-15,,10:00,,SSI,123 Main St,,Los Angeles,CA,90001`}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
        />
      </div>

      {successCount !== null && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Successfully created {successCount} event{successCount !== 1 ? 's' : ''}! Redirecting...
              </p>
            </div>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {errors.some(e => e.row === 0)
                  ? 'Error'
                  : 'The following rows failed to geocode. Please fix and re-upload:'}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((e, idx) => (
                    <li key={idx}>
                      {e.row === 0 ? (
                        e.error
                      ) : (
                        <>
                          <span className="font-medium">Row {e.row}:</span> "{e.address}" - {e.error}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !csvText.trim()}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            'Upload Events'
          )}
        </button>
      </div>
    </div>
  );
};

export default BulkEventForm;
