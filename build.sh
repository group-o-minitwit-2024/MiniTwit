#!/bin/bash
source ./cp_shrd.sh

echo "Building docker image for minitwit"
docker build -t minitwit ./app

echo "Building docker image for minitwit-api"
docker build -t minitwit-api ./API