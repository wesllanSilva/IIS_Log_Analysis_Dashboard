import { LogEntry, RouteStats } from '../types';

const MAX_FILE_SIZE = 500 * 1024 * 1024;

export function validateFile(fileSize: number, fileContent: string): { valid: boolean; error?: string } {
  if (fileSize > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large (max 500MB)' };
  }

  if (!fileContent.includes('#Fields:')) {
    return { valid: false, error: 'Invalid IIS log file format' };
  }

  return { valid: true };
}

export async function parseIISLog(fileContent: string, onProgress?: (progress: number) => void): Promise<LogEntry[]> {
  let fields: string[] = [];
  const entries: LogEntry[] = [];
  const chunkSize = 20000;
  let currentPos = 0;
  let buffer = '';
  const totalSize = fileContent.length;
  const maxEntriesToStore = 50000;

  while (currentPos < totalSize) {
    const endPos = Math.min(currentPos + chunkSize * 100, totalSize);
    buffer += fileContent.substring(currentPos, endPos);
    currentPos = endPos;

    const lines = buffer.split('\n');
    buffer = lines[lines.length - 1];

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i];

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
      if (values.length === fields.length && entries.length < maxEntriesToStore) {
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

    const progress = Math.min(98, Math.floor((currentPos / totalSize) * 90) + 8);
    if (onProgress) {
      onProgress(progress);
    }

    lines.length = 0;
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  if (entries.length === 0) {
    throw new Error('No data entries found in file');
  }

  if (onProgress) {
    onProgress(99);
  }

  await new Promise(resolve => setTimeout(resolve, 100));

  if (onProgress) {
    onProgress(100);
  }

  return entries;
}

export function calculateRouteStats(entries: LogEntry[]): RouteStats[] {
  const routeMap = new Map<string, {
    times: number[];
    errorCount: number;
    count: number;
  }>();

  entries.forEach(entry => {
    const route = entry.cs_uri_stem;
    if (!routeMap.has(route)) {
      routeMap.set(route, { times: [], errorCount: 0, count: 0 });
    }
    const stats = routeMap.get(route)!;
    stats.times.push(entry.time_taken);
    stats.count++;
    if (entry.sc_status !== 200) {
      stats.errorCount++;
    }
  });

  const stats: RouteStats[] = [];

  routeMap.forEach((data, route) => {
    const avgTime = data.times.reduce((a, b) => a + b, 0) / data.times.length;
    const minTime = Math.min(...data.times);
    const maxTime = Math.max(...data.times);

    stats.push({
      route,
      count: data.count,
      avgTime,
      minTime,
      maxTime,
      errorCount: data.errorCount,
      successRate: ((data.count - data.errorCount) / data.count) * 100
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
