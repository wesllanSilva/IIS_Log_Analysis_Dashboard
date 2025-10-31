import { RouteStats } from '../types';
import { BarChart3 } from 'lucide-react';

interface ChartViewProps {
  stats: RouteStats[];
}

export default function ChartView({ stats }: ChartViewProps) {
  const topRoutes = stats.slice(0, 10);
  const maxAvgTime = Math.max(...topRoutes.map(s => s.avgTime));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BarChart3 className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          Average Response Time by Route
        </h2>
      </div>

      <div className="space-y-4">
        {topRoutes.map((stat, index) => {
          const percentage = (stat.avgTime / maxAvgTime) * 100;
          const isError = stat.errorCount > stat.count * 0.1;

          return (
            <div key={stat.route} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center text-xs font-semibold text-blue-600">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {stat.route}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-500">
                    {stat.count.toLocaleString()} req
                  </span>
                  <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                    {stat.avgTime >= 1000
                      ? `${(stat.avgTime / 1000).toFixed(2)}s`
                      : `${stat.avgTime.toFixed(0)}ms`}
                  </span>
                </div>
              </div>
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ease-out rounded-lg ${
                    isError
                      ? 'bg-gradient-to-r from-red-400 to-red-500'
                      : stat.avgTime > maxAvgTime * 0.7
                      ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                      : stat.avgTime > maxAvgTime * 0.4
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                      : 'bg-gradient-to-r from-green-400 to-green-500'
                  } group-hover:shadow-lg`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 15 && (
                    <div className="h-full flex items-center justify-end pr-3">
                      <span className="text-xs font-semibold text-white">
                        {stat.successRate.toFixed(0)}% success
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {stats.length > 10 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Showing top 10 routes of {stats.length} total
          </p>
        </div>
      )}
    </div>
  );
}
