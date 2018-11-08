#!/bin/bash

declare -a stmts=(
	"CREATE TABLE stats (id integer NOT NULL, data jsonb)"
       	"CREATE TABLE document (id uuid, uri varchar(1024), revision bigint, content jsonb)"
	"CREATE TABLE history (document_id uuid, revision bigint, delta jsonb, primary key (document_id, revision))"
	"CREATE TABLE checkpoint (document_id uuid, revision bigint, content jsonb, primary key(document_id, revision))"
)

for stmt in "${stmts[@]}"
do
sudo docker run -it --rm  --network=host postgres psql -h 127.0.0.1 -U postgres  -c "$stmt"
done
