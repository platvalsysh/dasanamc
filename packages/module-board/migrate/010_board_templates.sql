-- Create board_templates table
CREATE TABLE IF NOT EXISTS modules.board_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  list_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT board_templates_module_id_fkey FOREIGN KEY (module_id) REFERENCES core.modules(id) ON DELETE CASCADE
);

-- Index for module_id
CREATE INDEX IF NOT EXISTS board_templates_module_id_idx ON modules.board_templates(module_id);
