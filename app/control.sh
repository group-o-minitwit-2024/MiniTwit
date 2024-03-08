#!/usr/bin/env bash
if [ $1 = "init" ]; then

    if [ -f "/tmp/minitwit.db" ]; then 
        echo "Database already exists."
        exit 1
    fi
    echo "Putting a database to /tmp/minitwit.db..."
    node -e "require('./dbUtils').initDB('/tmp/minitwit.db');"
elif [ $1 = "start" ]; then
    echo "Starting minitwit..."
    DEBUG=minitwit-2:* npm start
elif [ $1 = "stop" ]; then
    echo "Stopping minitwit..."
    pkill -f minitwit
elif [ $1 = "inspectdb" ]; then
    ./flag_tool -i | less
elif [ $1 = "flag" ]; then
    ./flag_tool "$@"
else
  echo "I do not know this command..."
fi


