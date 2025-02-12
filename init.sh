#!/bin/bash
set -e # Exit script immediately on first error.
git pull origin
docker-compose down
docker-compose build --no-cache
docker-compose up -d
