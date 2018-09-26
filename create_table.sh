#!/bin/bash


for stmt in $stmts
do
sudo docker run -it --rm  --network=host postgres psql -h 127.0.0.1 -U postgres  -c $stmt
done
