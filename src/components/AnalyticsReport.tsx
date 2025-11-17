import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { EndpointStat } from '../types';

interface AnalyticsReportProps {
  stats: EndpointStat[];
  onEndpointClick?: (endpoint: string) => void;
}

export default function AnalyticsReport({ stats, onEndpointClick }: AnalyticsReportProps) {
  const [topEndpoints, setTopEndpoints] = useState<EndpointStat[]>([]);
  const [slowestEndpoints, setSlowestEndpoints] = useState<EndpointStat[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const sorted = [...stats].sort((a, b) => b.request_count - a.request_count);
    setTopEndpoints(sorted.slice(0, 6));

    const bySlowest = [...stats].sort((a, b) => b.avg_time_ms - a.avg_time_ms);
    setSlowestEndpoints(bySlowest.slice(0, 6));

    const chartReady = sorted.slice(0, 6).map(s => ({
      endpoint: s.endpoint.slice(0, 25),
      fullEndpoint: s.endpoint,
      avgTime: Math.round(s.avg_time_ms),
      maxTime: s.max_time_ms,
      requests: s.request_count,
    }));
    setChartData(chartReady);
  }, [stats]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Total Endpoints</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.length}</p>
          <p className="text-sm text-gray-600 mt-1">Unique endpoints analyzed</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Avg Response Time</h3>
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {Math.round(stats.reduce((a, b) => a + b.avg_time_ms, 0) / stats.length)}ms
          </p>
          <p className="text-sm text-gray-600 mt-1">Across all endpoints</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Error Rate</h3>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {Math.round(stats.reduce((a, b) => a + b.error_count, 0) / stats.reduce((a, b) => a + b.request_count, 0) * 100 * 100) / 100}%
          </p>
          <p className="text-sm text-gray-600 mt-1">Total error count</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tempo Médio por Endpoint</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="endpoint"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis label={{ value: 'Tempo (ms)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              formatter={(value) => `${value}ms`}
              labelFormatter={(label) => `Endpoint: ${label}`}
            />
            <Legend />
            <Bar dataKey="avgTime" fill="#3b82f6" name="Tempo Médio" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tempo Máximo por Endpoint</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="endpoint"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis label={{ value: 'Tempo (ms)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
              formatter={(value) => `${value}ms`}
            />
            <Legend />
            <Bar dataKey="maxTime" fill="#f97316" name="Tempo Máximo" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Endpoints Mais Lentos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Endpoint</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Média</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Máximo</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Chamadas</th>
                </tr>
              </thead>
              <tbody>
                {slowestEndpoints.map((stat, idx) => (
                  <tr
                    key={stat.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onEndpointClick?.(stat.endpoint)}
                  >
                    <td className="py-3 px-4 font-medium text-gray-900 truncate max-w-xs">
                      {stat.endpoint}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-600 font-semibold">
                      {Math.round(stat.avg_time_ms)}ms
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-semibold">
                      {stat.max_time_ms}ms
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {stat.request_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Endpoints Mais Requisitados</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Endpoint</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Média</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Máximo</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Chamadas</th>
                </tr>
              </thead>
              <tbody>
                {topEndpoints.map((stat) => (
                  <tr
                    key={stat.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onEndpointClick?.(stat.endpoint)}
                  >
                    <td className="py-3 px-4 font-medium text-gray-900 truncate max-w-xs">
                      {stat.endpoint}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-600 font-semibold">
                      {Math.round(stat.avg_time_ms)}ms
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-semibold">
                      {stat.max_time_ms}ms
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-blue-600">
                      {stat.request_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
