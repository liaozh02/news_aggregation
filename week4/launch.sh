#!/bin/bash
fuser -k 3000/tcp
fuser -k 5000/tcp

service redis_6379 start
cd ./oj-server
npm install
nodemon server.js &

cd ../oj-client
npm install
ng build &

cd ../executor
pip install -r requirement.txt
python executor_server.py

echo "======================================"
read -p "PRESS [ENTER] TO TEMINATE PROCESS" PRESSKEY

fuser -k 3000/tcp
fuser -k 5000/tcp
service redis_6379 stop
