#!/usr/bin/env bash
set -eu
# Script to perform docker build, run, and publish functions.
VERSION=$(npm pkg get version | tr -d '"')
REGISTRY=docker-registry.pdmz.lasp.colorado.edu/web # Default registry
IMAGE=h3lioviz
PORT=8080

function print_usage() {
  printf "Usage: $0 [option]\n"
  printf "Options:\n"
  printf "  b|build,    Build the Docker image\n"
  printf "  r|run,      Run the container locally\n"
  printf "  p|publish,  Publish the container to remote Docker repository\n"
  printf "  s|stop,     Stop the container locally\n"
  printf "  -h|-help,   Print detailed help screen\n"
}

# Parse parameters
while [ $# -gt 0 ]; do
  case "$1" in
    -h | –help)
      print_usage
      exit 0
      ;;

    b | build)
      npm i && npx ng build --configuration production --aot=false --build-optimizer=false --base-href '${NGINX_CONTEXT_ROOT}'
      docker build --force-rm --tag ${REGISTRY}/${IMAGE}:${VERSION} .
      exit 0
      ;;

    r | run)
      # Run a container locally for dev
      # Stop and delete first if already present
      if docker ps --all --filter "name=${NAME:-$IMAGE}" --format '{{.Names}}' |  grep ${NAME:-$IMAGE} 2>&1 >/dev/null; then
        printf "Found existing container ${NAME:-$IMAGE}\n"
        printf "Stopping "
        docker stop ${NAME:-$IMAGE} || true
        printf "Removing "
        docker rm ${NAME:-$IMAGE}
      fi
      printf "Starting $IMAGE:$VERSION\n"
      docker run --publish $PORT:80 -e NGINX_CONTEXT_ROOT='/'$IMAGE --detach --name ${NAME:-$IMAGE} ${REGISTRY}/$IMAGE:$VERSION
      printf "$IMAGE:$VERSION can be accessed at http://localhost:$PORT , check the webserver config for any specific context path\n"
      exit 0
      ;;

    p | publish)
      # Set image tag from VERSION variable
      docker push ${REGISTRY}/${IMAGE}:${VERSION}
      docker rmi --force ${REGISTRY}/${IMAGE}:${VERSION}
      exit 0
      ;;

    s | stop)
      printf "Stopping "
      docker stop ${NAME:-$IMAGE}
      exit 0
      ;;

    *)
      printf "Unknown argument: $1\n"
      print_usage
      exit 1
      ;;
  esac
  shift
done

if [[ $# -eq 0 ]] ; then
    printf "Missing argument\n"
    print_usage
    exit 1
fi
