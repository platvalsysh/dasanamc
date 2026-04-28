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
-- Name: bxmember; Type: TABLE; Schema: modules; Owner: -
--

CREATE TABLE modules.bxmember (
    seq integer NOT NULL,
    name_kor character varying(300),
    name_ch character varying(300),
    sex character varying(50),
    major character varying(300),
    graduate_number character varying(100),
    graduate_year character varying(50),
    graduate_month character varying(50),
    master_major character varying(300),
    master_graduate_number character varying(100),
    master_graduate_year character varying(100),
    master_graduate_month character varying(50),
    doctor_major character varying(300),
    doctor_graduate_number character varying(100),
    doctor_graduate_year character varying(50),
    doctor_graduate_month character varying(50),
    course character varying(300),
    finish_flag character varying(100),
    finish_year character varying(100),
    decease character varying(100),
    remark character varying(300),
    job_class character varying(100),
    office_zipcode character varying(100),
    office_address character varying(300),
    office_name character varying(300),
    office_position character varying(300),
    office_phone_number character varying(100),
    office_fax_number character varying(100),
    office_area character varying(100),
    email character varying(300),
    zipcode character varying(100),
    address character varying(300),
    phone_number character varying(100),
    fax_number character varying(100),
    cellphone_number character varying(100),
    member_srl bigint,
    enter_year character varying(50) NOT NULL,
    search_agree character varying(50),
    is_major character varying(50)
);


--
-- Name: bxmember bxmember_pkey; Type: CONSTRAINT; Schema: modules; Owner: -
--

ALTER TABLE ONLY modules.bxmember
    ADD CONSTRAINT bxmember_pkey PRIMARY KEY (seq);


--
-- PostgreSQL database dump complete
--


*/