#!/usr/bin/env bash

# Gets the Bun server PID using lsof
BUN_PID=$(sudo lsof -ti :3000)

# Checks if the PID is not empty (process is running)
if [ -n "$BUN_PID" ]; then
    sudo kill -9 $BUN_PID
else
    echo "No process found using port 3000"
fi

cd ./app
docker-compose down
