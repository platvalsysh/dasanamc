/*
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: modules; Type: TABLE; Schema: core; Owner: -
--

CREATE TABLE core.modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    module character varying(255) NOT NULL,
    mid character varying(255) NOT NULL,
    extra_vars jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: modules_mid_key; Type: INDEX; Schema: core; Owner: -
--

CREATE UNIQUE INDEX modules_mid_key ON core.modules USING btree (mid);


--
-- PostgreSQL database dump complete
--


*/