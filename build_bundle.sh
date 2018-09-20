#! /bin/bash
meteor npm install
set +e
meteor add rocketchat:lib
set -e
mkdir build
meteor build --allow-superuser --server-only build/build.tar.gz