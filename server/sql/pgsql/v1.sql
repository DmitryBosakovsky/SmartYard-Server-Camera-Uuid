CREATE TABLE vars (var_id serial not null primary key, var_name character varying not null, var_value character varying);
CREATE INDEX vars_id on vars(var_id);
CREATE INDEX vars_var_name on vars(var_name);
INSERT INTO vars (var_name, var_value) values ('dbVersion', '0');
CREATE TABLE users (uid serial not null primary key, login character varying not null, password character varying not null, enabled integer, real_name character varying, e_mail character varying, phone character varying, avatar character varying);
CREATE UNIQUE INDEX users_login on users(login);
CREATE INDEX users_real_name on users(real_name);
CREATE UNIQUE INDEX users_e_mail on users(e_mail);
CREATE INDEX users_phone on users(phone);
CREATE TABLE groups (gid serial not null primary key, acronym character varying not null, name character varying not null);
CREATE UNIQUE INDEX groups_acronym on groups(acronym);
CREATE UNIQUE INDEX groups_name on groups(name);
CREATE TABLE users_groups (uid integer, gid integer);
CREATE INDEX users_groups_uid on users_groups(uid);
CREATE INDEX users_groups_gid on users_groups(gid);
CREATE UNIQUE INDEX users_groups_uid_gid on users_groups(uid, gid);
CREATE TABLE api_methods(api_method_id character varying not null primary key, api character varying not null, method character varying not null, request_method character varying not null);
CREATE UNIQUE INDEX api_methods_uniq on api_methods(api, method, request_method);
