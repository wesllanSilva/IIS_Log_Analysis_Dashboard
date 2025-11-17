import { useState, useEffect } from 'react';
import { Clock, BarChart3, AlertCircle } from 'lucide-react';
import { getUploads, getEndpointStats } from '../services/analyticsService';
import { LogUpload, EndpointStat } from '../types';
import AnalyticsReport from './AnalyticsReport';

export default function AnalysisHistory() {
  const [uploads, setUploads] = useState<LogUpload[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<LogUpload | null>(null);
  const [stats, setStats] = useState<EndpointStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadUploads();
  }, []);

  const loadUploads = async () => {
    try {
      setLoading(true);
      const data = await getUploads();
      setUploads(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load uploads');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = async (upload: LogUpload) => {
    try {
      setSelectedUpload(upload);
      const statsData = await getEndpointStats(upload.id);
      setStats(statsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading analysis history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (selectedUpload && stats.length > 0) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            setSelectedUpload(null);
            setStats([]);
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          Back to History
        </button>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedUpload.filename}</h2>
              <p className="text-sm text-gray-600">
                {new Date(selectedUpload.upload_date).toLocaleDateString()} - {selectedUpload.processed_entries.toLocaleString()} entries
              </p>
            </div>
          </div>
        </div>
        <AnalyticsReport stats={stats} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Analysis History</h2>
      </div>

      {uploads.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-12 text-center">
          <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4 opacity-50" />
          <p className="text-gray-600">No saved analyses yet</p>
          <p className="text-sm text-gray-500 mt-2">Upload and save an analysis to see it here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploads.map((upload) => (
            <button
              key={upload.id}
              onClick={() => handleUploadClick(upload)}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-3">
                <BarChart3 className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {upload.filename}
              </h3>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">{upload.processed_entries.toLocaleString()}</span> entries
                </p>
                <p className="text-gray-500 text-xs">
                  {new Date(upload.upload_date).toLocaleDateString()} at{' '}
                  {new Date(upload.upload_date).toLocaleTimeString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
