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
-- Name: comments; Type: TABLE; Schema: modules; Owner: -
--

CREATE TABLE modules.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_id uuid NOT NULL,
    content text NOT NULL,
    author_id uuid,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: modules; Owner: -
--

ALTER TABLE ONLY modules.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: comments_author_id_idx; Type: INDEX; Schema: modules; Owner: -
--

CREATE INDEX comments_author_id_idx ON modules.comments USING btree (author_id);


--
-- Name: comments_document_id_idx; Type: INDEX; Schema: modules; Owner: -
--

CREATE INDEX comments_document_id_idx ON modules.comments USING btree (document_id);


--
-- Name: comments comments_author_id_fkey; Type: FK CONSTRAINT; Schema: modules; Owner: -
--

ALTER TABLE ONLY modules.comments
    ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: comments comments_document_id_fkey; Type: FK CONSTRAINT; Schema: modules; Owner: -
--

ALTER TABLE ONLY modules.comments
    ADD CONSTRAINT comments_document_id_fkey FOREIGN KEY (document_id) REFERENCES modules.documents(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


*/