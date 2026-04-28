-- Create schedules table in modules schema
CREATE TABLE IF NOT EXISTS modules.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    content TEXT,
    is_important BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for date range queries
CREATE INDEX IF NOT EXISTS idx_schedules_date_range ON modules.schedules (start_date, end_date);
