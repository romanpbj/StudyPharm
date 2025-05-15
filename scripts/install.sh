#!/bin/bash
cd /home/ec2-user/app/backend
pip install -r requirements.txt
cd ../frontend
npm install
npm run build