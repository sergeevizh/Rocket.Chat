#!/bin/sh
cat /nginx/nginx.conf
nginx -c /nginx/nginx.conf
node main.js
