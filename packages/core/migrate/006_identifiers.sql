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
-- Name: identifiers; Type: TABLE; Schema: core; Owner: -
--

CREATE TABLE core.identifiers (
    user_id uuid NOT NULL,
    identifier character varying(255) NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: identifiers identifiers_pkey; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.identifiers
    ADD CONSTRAINT identifiers_pkey PRIMARY KEY (user_id);


--
-- Name: identifiers identifiers_user_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.identifiers
    ADD CONSTRAINT identifiers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


*/