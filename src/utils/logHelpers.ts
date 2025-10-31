import { LogEntry, RouteStats } from '../types';

export function parseIISLog(fileContent: string): LogEntry[] {
  const lines = fileContent.split('\n');
  let fields: string[] = [];
  const entries: LogEntry[] = [];

  for (const line of lines) {
    if (line.startsWith('#Fields:')) {
      fields = line
        .substring(9)
        .trim()
        .split(' ')
        .map(f => f.replace(/-/g, '_'));
      continue;
    }

    if (line.startsWith('#') || line.trim() === '') {
      continue;
    }

    const values = line.trim().split(' ');
    if (values.length === fields.length) {
      const entry: any = {};
      fields.forEach((field, index) => {
        const value = values[index];
        if (field === 'sc_status' || field === 'sc_substatus' || field === 'sc_win32_status' || field === 'time_taken') {
          entry[field] = parseInt(value) || 0;
        } else {
          entry[field] = value;
        }
      });
      entries.push(entry as LogEntry);
    }
  }

  return entries;
}

export function calculateRouteStats(entries: LogEntry[]): RouteStats[] {
  const routeMap = new Map<string, LogEntry[]>();

  entries.forEach(entry => {
    const route = entry.cs_uri_stem;
    if (!routeMap.has(route)) {
      routeMap.set(route, []);
    }
    routeMap.get(route)!.push(entry);
  });

  const stats: RouteStats[] = [];

  routeMap.forEach((routeEntries, route) => {
    const times = routeEntries.map(e => e.time_taken);
    const errorCount = routeEntries.filter(e => e.sc_status !== 200).length;

    stats.push({
      route,
      count: routeEntries.length,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      errorCount,
      successRate: ((routeEntries.length - errorCount) / routeEntries.length) * 100
    });
  });

  return stats.sort((a, b) => b.count - a.count);
}

export function filterEntries(entries: LogEntry[], filters: Partial<{
  route: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}>): LogEntry[] {
  return entries.filter(entry => {
    if (filters.route && !entry.cs_uri_stem.toLowerCase().includes(filters.route.toLowerCase())) {
      return false;
    }

    if (filters.status && filters.status !== 'all') {
      const status = entry.sc_status;
      if (filters.status === 'success' && status !== 200) return false;
      if (filters.status === 'error' && status === 200) return false;
    }

    if (filters.dateFrom && entry.date < filters.dateFrom) {
      return false;
    }

    if (filters.dateTo && entry.date > filters.dateTo) {
      return false;
    }

    return true;
  });
}
