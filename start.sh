#!/usr/bin/env bash

cd ./GeoText
docker build -t geotextapi:1.0.0 .
cd ..

cd ./app
docker-compose up -d
bun install
bun start &

URL="http://localhost:3000/"; xdg-open $URL || sensible-browser $URL || x-www-browser $URL || gnome-open $URL

sleep 5s

echo ""
echo "---=== Done! ===---"
echo ""
