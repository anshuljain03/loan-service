#!/bin/bash

DB_CONTAINER_NAME=mysql-server

# Stop and remove Docker container
docker stop $DB_CONTAINER_NAME >/dev/null 2>&1 || true
docker rm $DB_CONTAINER_NAME >/dev/null 2>&1 || true

# Remove the node_modules
rm -rf node_modules
