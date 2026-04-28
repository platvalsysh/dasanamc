-- Create document_categories table
CREATE TABLE modules.document_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    seq integer NOT NULL,
    module_id uuid NOT NULL,
    parent_id uuid,
    name character varying(255) NOT NULL,
    path character varying(1000),
    depth integer DEFAULT 0 NOT NULL,
    description character varying(255),
    list_order integer DEFAULT 0 NOT NULL,
    document_count integer DEFAULT 0 NOT NULL,
    extra_vars jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Add Primary Key
ALTER TABLE ONLY modules.document_categories
    ADD CONSTRAINT document_categories_pkey PRIMARY KEY (id);

-- Add Indexes
CREATE INDEX document_categories_module_id_idx ON modules.document_categories USING btree (module_id);
CREATE INDEX document_categories_parent_id_idx ON modules.document_categories USING btree (parent_id);
CREATE INDEX document_categories_path_idx ON modules.document_categories USING btree (path);
CREATE INDEX document_categories_list_order_idx ON modules.document_categories USING btree (list_order);

-- Add Foreign Keys
ALTER TABLE ONLY modules.document_categories
    ADD CONSTRAINT document_categories_module_id_fkey FOREIGN KEY (module_id) REFERENCES core.modules(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY modules.document_categories
    ADD CONSTRAINT document_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES modules.document_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


-- Add category_id to documents table
ALTER TABLE modules.documents ADD COLUMN category_id uuid;

-- Add Index for category_id
CREATE INDEX documents_category_id_idx ON modules.documents USING btree (category_id);

-- Add Foreign Key for documents.category_id
ALTER TABLE ONLY modules.documents
    ADD CONSTRAINT documents_category_id_fkey FOREIGN KEY (category_id) REFERENCES modules.document_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;
