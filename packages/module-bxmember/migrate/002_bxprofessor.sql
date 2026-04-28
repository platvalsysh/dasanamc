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
-- Name: bxprofessor; Type: TABLE; Schema: modules; Owner: -
--

CREATE TABLE modules.bxprofessor (
    seq bigint NOT NULL,
    name_kor character varying(300),
    email character varying(300),
    cellphone_number character varying(100)
);


--
-- Name: bxprofessor bxprofessor_pkey; Type: CONSTRAINT; Schema: modules; Owner: -
--

ALTER TABLE ONLY modules.bxprofessor
    ADD CONSTRAINT bxprofessor_pkey PRIMARY KEY (seq);


--
-- PostgreSQL database dump complete
--


*/