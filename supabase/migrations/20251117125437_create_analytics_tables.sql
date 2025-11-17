/*
  # Create Analytics Tables for Log Analysis

  1. New Tables
    - `log_uploads` - Registra cada upload de arquivo de log
    - `endpoint_stats` - Armazena estatísticas agregadas por endpoint
    - `endpoint_requests` - Detalhes de cada requisição (sample dos 50k registros)
  
  2. Security
    - Enable RLS on all tables
    - Policies allow authenticated users to read their own data
    - Service role can write analytics data

  3. Indexes
    - Speed up queries for endpoint analysis
    - Enable efficient filtering and sorting
*/

CREATE TABLE IF NOT EXISTS log_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  total_lines bigint NOT NULL,
  processed_entries bigint NOT NULL,
  upload_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS endpoint_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id uuid NOT NULL REFERENCES log_uploads(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  request_count bigint NOT NULL,
  avg_time_ms numeric NOT NULL,
  min_time_ms bigint NOT NULL,
  max_time_ms bigint NOT NULL,
  error_count bigint DEFAULT 0,
  success_rate numeric DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS endpoint_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id uuid NOT NULL REFERENCES log_uploads(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  date text,
  time text,
  time_taken bigint,
  sc_status integer,
  cs_user_agent text,
  cs_host text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE log_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE endpoint_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE endpoint_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own uploads"
  ON log_uploads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads"
  ON log_uploads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own endpoint stats"
  ON endpoint_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM log_uploads
      WHERE log_uploads.id = endpoint_stats.upload_id
      AND log_uploads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own endpoint requests"
  ON endpoint_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM log_uploads
      WHERE log_uploads.id = endpoint_requests.upload_id
      AND log_uploads.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert stats"
  ON endpoint_stats FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can insert requests"
  ON endpoint_requests FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE INDEX idx_endpoint_stats_upload ON endpoint_stats(upload_id);
CREATE INDEX idx_endpoint_stats_endpoint ON endpoint_stats(endpoint);
CREATE INDEX idx_endpoint_requests_upload ON endpoint_requests(upload_id);
CREATE INDEX idx_endpoint_requests_endpoint ON endpoint_requests(endpoint);
CREATE INDEX idx_log_uploads_user ON log_uploads(user_id);
