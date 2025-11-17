export interface LogEntry {
  date: string;
  time: string;
  s_ip: string;
  cs_method: string;
  cs_uri_stem: string;
  cs_uri_query: string;
  s_port: string;
  cs_username: string;
  c_ip: string;
  cs_user_agent: string;
  cs_referer: string;
  sc_status: number;
  sc_substatus: number;
  sc_win32_status: number;
  time_taken: number;
}

export interface RouteStats {
  route: string;
  count: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  errorCount: number;
  successRate: number;
}

export interface FilterOptions {
  route: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export interface LogUpload {
  id: string;
  filename: string;
  total_lines: number;
  processed_entries: number;
  upload_date: string;
}

export interface EndpointStat {
  id: string;
  endpoint: string;
  request_count: number;
  avg_time_ms: number;
  min_time_ms: number;
  max_time_ms: number;
  error_count: number;
  success_rate: number;
}

export interface EndpointRequest {
  id: string;
  endpoint: string;
  date: string;
  time: string;
  time_taken: number;
  sc_status: number;
  cs_user_agent: string;
  cs_host: string;
}
