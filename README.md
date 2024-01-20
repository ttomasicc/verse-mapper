# Verse Mapper :musical_note:

Welcome to Verse Mapper, your go-to platform for exploring music and lyrics. Search for your favorite tracks and get detailed insights into their lyrics. Our unique Natural Language Processing (NLP) analysis extracts geo-locations mentioned in the lyrics and displays them on an interactive map.

Ready to embark on a musical journey? Use the search feature to find tracks, view their lyrics, and discover the places mentioned in the songs. Explore the interconnected world of music and geography like never before with Verse Mapper.

P.S. Don't forget to save your favorite songs for quick access!

## Required tools and technologies

If you're using Linux OS, you can run the `install.sh` script and automatically download all the required tools. Alternatively, you can manually install the following tools:
- [Docker compose](https://docs.docker.com/compose/) - tested with `v2.23.0`
- [Bun](https://bun.sh/) - tested with `v1.0.21`

## Running the app

Before running the app, add all the needed API keys into the [env file](./app/.env)!

If you're using Linux OS, you can run the `start.sh` script and the app should, after some time, if everything passed successfully, automatically open the default Web browser with the Verse Mapper home screen. Alternatively you should follow these steps manually and debug the error:

1. Dockerize the GeoText API
```bash
cd ./GeoText
docker build -t geotextapi:1.0.0 .
cd ..
```

2. Run the MongoDB database and GeoText API
```bash
cd ./app
docker-compose up -d
```

3. Install project dependencies and run the app
```bash
bun install
bun start
```

Finally, the app should be successfully running at http://localhost:3000/.

## Closing the app

If you're using Linux OS, you can run the `stop.sh` script to close and free-up all the previously started resources. Alternatively you should follow these steps manually close the resources:

1. Stop the Web app

Press CTRL-C if the started process is in the foreground or debug the following script:
```bash
# Gets the Bun server PID using lsof
BUN_PID=$(sudo lsof -ti :3000)

# Checks if the PID is not empty (process is running)
if [ -n "$BUN_PID" ]; then
    sudo kill -9 $BUN_PID
else
    echo "No process found using port 3000"
fi
```

2. Stop the dockerized MongoDB database and GeoText API
```bash
cd ./app
docker-compose down
```

# Documentation and Web UI

Documentation, along with Web UI examples is available [here](./docs).

# Licence

The Verse Mapper project is licensed under the GNU General Public License v2.0. You are free to use, modify, and distribute this code as per the terms of the license.