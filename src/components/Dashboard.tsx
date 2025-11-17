import { useState } from 'react';
import { FileText, Database, Save, Loader } from 'lucide-react';
import FileUploader from './FileUploader';
import FilterPanel from './FilterPanel';
import SummaryCards from './SummaryCards';
import StatsTable from './StatsTable';
import ChartView from './ChartView';
import AnalyticsReport from './AnalyticsReport';
import ProcessingStatus from './ProcessingStatus';
import { parseIISLog, calculateRouteStats, filterEntries, validateFile } from '../utils/logHelpers';
import { saveLogAnalysis } from '../services/analyticsService';
import { LogEntry, EndpointStat } from '../types';

export default function Dashboard() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LogEntry[]>([]);
  const [filename, setFilename] = useState<string>('');
  const [filters, setFilters] = useState({ route: '', status: 'all' });
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [totalLines, setTotalLines] = useState(0);
  const [viewMode, setViewMode] = useState<'simple' | 'advanced'>('simple');

  const handleStatusChange = (
    status: 'idle' | 'loading' | 'success' | 'error',
    progressValue?: number,
    error?: string
  ) => {
    setProcessingStatus(status);
    if (progressValue !== undefined) {
      setProgress(progressValue);
    }
    if (error) {
      setErrorMessage(error);
    }
  };

  const handleFileLoad = async (content: string, name: string) => {
    try {
      const validation = validateFile(content.length, content);
      if (!validation.valid) {
        handleStatusChange('error', 0, validation.error);
        return;
      }

      setTotalLines(content.split('\n').length);

      const parsed = await parseIISLog(content, (progressValue) => {
        setProgress(progressValue);
      });

      setEntries(parsed);
      setFilteredEntries(parsed);
      setFilename(name);
      setViewMode('advanced');
      handleStatusChange('success');
      setTimeout(() => handleStatusChange('idle'), 1500);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      handleStatusChange('error', 0, errorMsg);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!entries.length) return;
    setIsSaving(true);
    try {
      const stats: EndpointStat[] = calculateRouteStats(entries).map(stat => ({
        id: '',
        endpoint: stat.route,
        request_count: stat.count,
        avg_time_ms: stat.avgTime,
        min_time_ms: stat.minTime,
        max_time_ms: stat.maxTime,
        error_count: stat.errorCount,
        success_rate: stat.successRate,
      }));

      await saveLogAnalysis(filename, totalLines, entries, stats);
      handleStatusChange('success', undefined, undefined);
      setTimeout(() => handleStatusChange('idle'), 2000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save analysis';
      handleStatusChange('error', undefined, errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFilterChange = (newFilters: { route: string; status: string }) => {
    setFilters(newFilters);
    const filtered = filterEntries(entries, newFilters);
    setFilteredEntries(filtered);
  };

  const stats = calculateRouteStats(filteredEntries);

  return (
    <div className="min-h-screen">
      <ProcessingStatus
        status={processingStatus}
        progress={progress}
        errorMessage={errorMessage}
        successMessage="File processed successfully!"
      />

      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
              <Database className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">WSTACK - IIS Log Analyzer</h1>
              <p className="text-blue-100 mt-1">
                Analyze and visualize your IIS server logs
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {entries.length === 0 ? (
          <div className="py-12">
            <FileUploader onFileLoad={handleFileLoad} onStatusChange={handleStatusChange} />
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                Upload an IIS log file to start analyzing your server performance
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Analyzing file:</p>
                  <p className="font-semibold text-gray-900">{filename}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveAnalysis}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Analysis
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setEntries([]);
                    setFilteredEntries([]);
                    setFilename('');
                    setFilters({ route: '', status: 'all' });
                    setViewMode('simple');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Upload New File
                </button>
              </div>
            </div>

            {viewMode === 'advanced' && entries.length > 0 ? (
              <>
                <AnalyticsReport stats={stats} />
              </>
            ) : (
              <>
                <SummaryCards entries={filteredEntries} />
                <FilterPanel onFilterChange={handleFilterChange} />
                <ChartView stats={stats} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Detailed Statistics
                  </h2>
                  <StatsTable stats={stats} />
                </div>
              </>
            )}

            {filteredEntries.length === 0 && entries.length > 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No results match your filters</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
