- To generate a module;- nest g mo <module_name>
- To generate a controller;- nest g co <controller_name>
- To generate a service;- nest g s <service_name>

- To create typeorm migrations;- MIGRATION_NAME=<migration-name> npm run migration:create

docker-compose up
sudo lsof -i :5432

<!-- prod docker cmds -->

docker build --target prod -t recipe-api:latest .
docker-compose up postgres
docker network ls
docker run --network=nestjs-rest-api_app -p 8000:8000 -it recipe-api
