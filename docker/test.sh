function delete_container {
  docker rm -f test-postgres || true
}

trap delete_container EXIT
CONTAINER_NAME='test-postgres'
CID=$(docker ps -q -f status=running -f name=^/${CONTAINER_NAME}$) 
if [ "${CID}" ]; then
  docker rm -f test-postgres
fi
unset CID
docker run -d -p 5431:5432 --name test-postgres -e POSTGRES_USER=testuser -e POSTGRES_PASSWORD=testpassword postgres:9.6.3
npm run buildClean
NODE_ENV=test nyc --check-coverage -a ava "$@"
