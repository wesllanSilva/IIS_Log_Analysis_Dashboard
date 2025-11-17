import { supabase } from './supabaseClient';
import { LogEntry, EndpointStat, EndpointRequest } from '../types';

export async function saveLogAnalysis(
  filename: string,
  totalLines: number,
  entries: LogEntry[],
  stats: EndpointStat[]
) {
  const user = await supabase.auth.getUser();
  if (!user.data.user?.id) throw new Error('User not authenticated');

  const uploadResult = await supabase
    .from('log_uploads')
    .insert({
      user_id: user.data.user.id,
      filename,
      total_lines: totalLines,
      processed_entries: entries.length,
    })
    .select()
    .single();

  if (uploadResult.error) throw uploadResult.error;
  const uploadId = uploadResult.data.id;

  const statsData = stats.map(stat => ({
    upload_id: uploadId,
    endpoint: stat.endpoint,
    request_count: stat.request_count,
    avg_time_ms: stat.avg_time_ms,
    min_time_ms: stat.min_time_ms,
    max_time_ms: stat.max_time_ms,
    error_count: stat.error_count,
    success_rate: stat.success_rate,
  }));

  const statsResult = await supabase
    .from('endpoint_stats')
    .insert(statsData);

  if (statsResult.error) throw statsResult.error;

  const requestsData = entries.slice(0, 1000).map(entry => ({
    upload_id: uploadId,
    endpoint: entry.cs_uri_stem,
    date: entry.date,
    time: entry.time,
    time_taken: entry.time_taken,
    sc_status: entry.sc_status,
    cs_user_agent: entry.cs_user_agent,
    cs_host: entry.s_ip,
  }));

  const requestsResult = await supabase
    .from('endpoint_requests')
    .insert(requestsData);

  if (requestsResult.error) throw requestsResult.error;

  return uploadId;
}

export async function getUploads() {
  const { data, error } = await supabase
    .from('log_uploads')
    .select('*')
    .order('upload_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getEndpointStats(uploadId: string) {
  const { data, error } = await supabase
    .from('endpoint_stats')
    .select('*')
    .eq('upload_id', uploadId)
    .order('request_count', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getEndpointRequests(uploadId: string, endpoint: string) {
  const { data, error } = await supabase
    .from('endpoint_requests')
    .select('*')
    .eq('upload_id', uploadId)
    .eq('endpoint', endpoint)
    .order('time_taken', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data;
}
