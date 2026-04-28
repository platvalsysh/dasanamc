
CREATE TABLE modules.sponsors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    logo character varying(1000),
    url character varying(1000),
    description text,
    list_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY modules.sponsors
    ADD CONSTRAINT sponsors_pkey PRIMARY KEY (id);
