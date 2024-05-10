#!/bin/bash

echo "Copying shared files to app and API"
cp -r ./utils ./app/src
cp -r ./utils ./API/src
