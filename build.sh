#!/bin/bash

source ./cp_shrd.sh

echo "Building docker image for minitwit"
docker build -t minitwit ./app

echo "Building docker image for minitwit-api"
docker build -t minitwit-api ./API

# Check if the user wants to push to Docker Hub
if [[ "$1" == "--push" ]]; then
    if [[ -z "$2" ]]; then
        echo "Please provide a Docker Hub username."
        exit 1
    fi
    username="$2"

    echo "Pushing minitwit image to Docker Hub"
    docker tag minitwit "$username/minitwit"
    docker push "$username/minitwit"

    echo "Pushing minitwit-api image to Docker Hub"
    docker tag minitwit-api "$username/minitwit-api"
    docker push "$username/minitwit-api"
fi
