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
