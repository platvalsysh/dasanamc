CREATE TABLE core.deleted_modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    module_id uuid NOT NULL,
    module character varying(255) NOT NULL,
    mid character varying(255) NOT NULL,
    deleted_at timestamp with time zone DEFAULT now(),
    payload jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT deleted_modules_pkey PRIMARY KEY (id)
);
