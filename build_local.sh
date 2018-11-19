#! /bin/bash
meteor build --allow-superuser --server-only --architecture os.linux.x86_64 ..
mv ../rocket.tar.gz build.tar.gz
docker build . -f .docker/Dockerfile -t devgeniem/rocket.chat:latest
docker push devgeniem/rocket.chat:latest