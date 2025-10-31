import { useState } from 'react';
import { FileText, Database } from 'lucide-react';
import FileUploader from './FileUploader';
import FilterPanel from './FilterPanel';
import SummaryCards from './SummaryCards';
import StatsTable from './StatsTable';
import ChartView from './ChartView';
import { parseIISLog, calculateRouteStats, filterEntries } from '../utils/logHelpers';
import { LogEntry } from '../types';

export default function Dashboard() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LogEntry[]>([]);
  const [filename, setFilename] = useState<string>('');
  const [filters, setFilters] = useState({ route: '', status: 'all' });

  const handleFileLoad = (content: string, name: string) => {
    const parsed = parseIISLog(content);
    setEntries(parsed);
    setFilteredEntries(parsed);
    setFilename(name);
  };

  const handleFilterChange = (newFilters: { route: string; status: string }) => {
    setFilters(newFilters);
    const filtered = filterEntries(entries, newFilters);
    setFilteredEntries(filtered);
  };

  const stats = calculateRouteStats(filteredEntries);

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
              <Database className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">IIS Log Analyzer</h1>
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
            <FileUploader onFileLoad={handleFileLoad} />
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                Upload an IIS log file to start analyzing your server performance
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Analyzing file:</p>
                <p className="font-semibold text-gray-900">{filename}</p>
              </div>
              <button
                onClick={() => {
                  setEntries([]);
                  setFilteredEntries([]);
                  setFilename('');
                  setFilters({ route: '', status: 'all' });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Upload New File
              </button>
            </div>

            <SummaryCards entries={filteredEntries} />

            <FilterPanel onFilterChange={handleFilterChange} />

            <ChartView stats={stats} />

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Detailed Statistics
              </h2>
              <StatsTable stats={stats} />
            </div>

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
