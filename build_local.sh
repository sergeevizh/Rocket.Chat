#! /bin/bash

verify_target () {
  target=$1
  if [ "$target" != "latest" ] && [ "$target" != "stage" ]; then
    echo "The target needs to be either 'latest' or 'stage'"; exit 1
  fi
}

this=$0
cmd=$1
scmd=$2
target=$3

if [ "$cmd" == "build" ]; then
  meteor build --allow-superuser --server-only --architecture os.linux.x86_64 ..
  mv ../rocket.tar.gz build.tar.gz
elif [ "$cmd" == "docker" ]; then
  if [ "$scmd" == "build" ]; then
    verify_target $target
    docker build . -f nginx/Dockerfile -t devgeniem/rocket.chat:$target
  elif [ "$scmd" == "push" ]; then
    verify_target $target
    docker push devgeniem/rocket.chat:$target
  else
    echo "'$scmd' is not a valid subcommand for '$this docker'"
  fi
elif [ "$cmd" == "deploy" ]; then
  verify_target $2 # the target is now the second var
  ./$this build
  ./$this docker build $2
  ./$this docker push $2
else
  echo "'$cmd' is not a valid command!"
fi
