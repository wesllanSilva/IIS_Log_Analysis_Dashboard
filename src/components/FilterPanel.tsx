import { Search, Filter } from 'lucide-react';

interface FilterPanelProps {
  onFilterChange: (filters: {
    route: string;
    status: string;
  }) => void;
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const handleRouteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      route: e.target.value,
      status: (document.getElementById('status-filter') as HTMLSelectElement).value
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      route: (document.getElementById('route-filter') as HTMLInputElement).value,
      status: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="route-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Search Route
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="route-filter"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Filter by route..."
              onChange={handleRouteChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status-filter"
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            onChange={handleStatusChange}
          >
            <option value="all">All Statuses</option>
            <option value="success">Success Only (200)</option>
            <option value="error">Errors Only (≠200)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
