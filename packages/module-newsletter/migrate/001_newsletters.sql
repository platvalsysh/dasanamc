
CREATE TABLE modules.newsletters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    issue_number integer NOT NULL,
    pdf_id uuid NOT NULL,
    thumbnail_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY modules.newsletters
    ADD CONSTRAINT newsletters_pkey PRIMARY KEY (id);

ALTER TABLE ONLY modules.newsletters
    ADD CONSTRAINT newsletters_pdf_id_fkey FOREIGN KEY (pdf_id) REFERENCES modules.files(id) ON DELETE RESTRICT;

ALTER TABLE ONLY modules.newsletters
    ADD CONSTRAINT newsletters_thumbnail_id_fkey FOREIGN KEY (thumbnail_id) REFERENCES modules.files(id) ON DELETE RESTRICT;
