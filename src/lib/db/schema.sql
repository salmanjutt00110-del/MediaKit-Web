-- ==============================================================================
-- MediaKit Minimal Database Foundation
-- Compatible with PostgreSQL, SQLite, or Cloud SQL
-- ==============================================================================

-- 1. Rate Limiting Table (IP-based or Session-based throttling)
CREATE TABLE IF NOT EXISTS rate_limits (
    id VARCHAR(64) PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    endpoint VARCHAR(64) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits (ip_address, endpoint, window_start_time);

-- 2. Platform Configuration (Enabled status, rate limits, API health)
CREATE TABLE IF NOT EXISTS platform_config (
    platform_id VARCHAR(32) PRIMARY KEY, -- 'youtube', 'tiktok', 'facebook', 'instagram'
    display_name VARCHAR(64) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    daily_request_limit INTEGER DEFAULT 10000,
    current_day_requests INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Anonymous Download History (Metadata only - media content is never stored permanently)
CREATE TABLE IF NOT EXISTS download_history (
    id VARCHAR(64) PRIMARY KEY,
    platform VARCHAR(32) NOT NULL,
    media_identifier VARCHAR(128) NOT NULL,
    selected_format VARCHAR(16) NOT NULL, -- e.g. 'mp4', 'mp3'
    selected_quality VARCHAR(32) NOT NULL, -- e.g. '1080p', 'audio'
    duration_seconds INTEGER,
    status VARCHAR(32) NOT NULL, -- 'requested', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_download_platform_created ON download_history (platform, created_at);

-- 4. System Settings (Key-value store for runtime switches)
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(64) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial seed settings
INSERT INTO platform_config (platform_id, display_name, is_active) VALUES
    ('youtube', 'YouTube', TRUE),
    ('tiktok', 'TikTok', TRUE),
    ('facebook', 'Facebook', TRUE),
    ('instagram', 'Instagram', TRUE)
ON CONFLICT (platform_id) DO NOTHING;

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('maintenance_mode', 'false', 'Global switch to temporarily pause processing'),
    ('max_daily_downloads_per_ip', '100', 'Maximum allowed processing sessions per user per day')
ON CONFLICT (setting_key) DO NOTHING;
