import { RouteStats } from '../types';
import { TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';

interface StatsTableProps {
  stats: RouteStats[];
}

export default function StatsTable({ stats }: StatsTableProps) {
  const formatTime = (ms: number) => {
    return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms.toFixed(0)}ms`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Route
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Requests
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Avg Time
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Min Time
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Max Time
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Errors
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Success Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats.map((stat, index) => (
              <tr
                key={stat.route}
                className="hover:bg-blue-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 max-w-md truncate">
                      {stat.route}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {stat.count.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-900 font-medium">
                    <Clock className="w-4 h-4 text-blue-500" />
                    {formatTime(stat.avgTime)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-green-700 font-medium">
                    <TrendingDown className="w-4 h-4" />
                    {formatTime(stat.minTime)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-orange-700 font-medium">
                    <TrendingUp className="w-4 h-4" />
                    {formatTime(stat.maxTime)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {stat.errorCount > 0 ? (
                    <span className="px-3 py-1 inline-flex items-center gap-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                      <AlertCircle className="w-4 h-4" />
                      {stat.errorCount}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">0</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-24">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              stat.successRate >= 95
                                ? 'bg-green-500'
                                : stat.successRate >= 80
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${stat.successRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-12">
                          {stat.successRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
