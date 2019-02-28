#!/bin/bash

echo "Begin update..."

echo "Stopping Express server..."

sudo pm2 stop server2

echo "Express server stopped."

cd ..

echo "Attempting to pull from master..."

sudo git pull

echo "Pulled changes to master."

cd node

echo "Attempting to restart Express server..."

sudo pm2 restart server2.js

echo "Express server successfully restarted."

echo "Update complete"
