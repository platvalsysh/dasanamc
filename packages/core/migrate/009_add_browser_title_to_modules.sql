-- Add browser_title column to core.modules table
-- This column stores the browser page title for each module

ALTER TABLE core.modules
  ADD COLUMN browser_title VARCHAR(250);
