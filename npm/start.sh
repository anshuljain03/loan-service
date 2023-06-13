#!/bin/bash

# Check if Node.js is installed and the required version is met
if ! command -v node &>/dev/null; then
    echo "Node.js is not installed. Please install Node.js version >= 20."
    exit 1
fi

NODE_VERSION=$(node -v | awk -Fv '{print $2}')
REQUIRED_NODE_VERSION=20

if [[ "$(printf '%s\n' "$NODE_VERSION" "$REQUIRED_NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE_VERSION" ]]; then
    echo "Node.js version $NODE_VERSION is not supported. Please install Node.js version >= $REQUIRED_NODE_VERSION."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &>/dev/null; then
    echo "npm is not installed. Please install npm."
    exit 1
fi

# Check if Docker is running
if ! docker info &>/dev/null; then
    echo "Docker is not running. Please start Docker."
    exit 1
fi

set -e

# Function to clean up Docker containers
cleanup() {
  echo "Cleaning up Docker containers..."
  docker stop $DB_CONTAINER_NAME &> /dev/null || true
  docker rm $DB_CONTAINER_NAME &> /dev/null || true
}

trap cleanup EXIT

# Check if the node_modules exist if not install them
if [[ ! -d "node_modules" ]]; then
    echo "Installing node modules"
    npm install
fi

# Variables
MYSQL_USER=dbuser
MYSQL_PASSWORD=dbpassword
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DB_NAME=loan-db
DB_CONTAINER_NAME=mysql-server

# Spin up the MySQL 8 Docker container
docker run -d \
  --name $DB_CONTAINER_NAME \
  -e MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD" \
  -e MYSQL_DATABASE="$MYSQL_DB_NAME" \
  -p 3306:3306 \
  mysql:latest

# Wait for a while until the MySQL server is up
sleep 45

# Start the server
node app.js
