#!/bin/bash
pm2 start system.json -l
sleep 5
python ./apscheduler/newspipeline_start.py
