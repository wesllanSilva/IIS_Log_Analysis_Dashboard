import { Activity, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { LogEntry } from '../types';

interface SummaryCardsProps {
  entries: LogEntry[];
}

export default function SummaryCards({ entries }: SummaryCardsProps) {
  const totalRequests = entries.length;
  const errorCount = entries.filter(e => e.sc_status !== 200).length;
  const successCount = totalRequests - errorCount;
  const avgResponseTime = entries.reduce((acc, e) => acc + e.time_taken, 0) / totalRequests;

  const cards = [
    {
      title: 'Total Requests',
      value: totalRequests.toLocaleString(),
      icon: Activity,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Successful',
      value: successCount.toLocaleString(),
      icon: CheckCircle,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Errors',
      value: errorCount.toLocaleString(),
      icon: AlertTriangle,
      color: 'red',
      bgGradient: 'from-red-500 to-red-600'
    },
    {
      title: 'Avg Response',
      value: avgResponseTime >= 1000
        ? `${(avgResponseTime / 1000).toFixed(2)}s`
        : `${avgResponseTime.toFixed(0)}ms`,
      icon: Clock,
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
        >
          <div className={`bg-gradient-to-r ${card.bgGradient} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-opacity-90 text-sm font-medium mb-1">
                  {card.title}
                </p>
                <p className="text-white text-3xl font-bold">
                  {card.value}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-3">
                <card.icon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          <div className="h-2 bg-gray-100">
            <div className={`h-full bg-gradient-to-r ${card.bgGradient} opacity-50`} style={{ width: '100%' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
