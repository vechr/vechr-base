<p align="center">
  <a href="" target="blank"><img src="./public/logo.svg" width="320" alt="Vechr Logo" /></a>
</p>

# Edit your `.env` file
There's PORT for this app, Your NATS URL, and Database things
```
APP_PORT=3000
NATS_URL=nats://localhost:4222
DB_URL="postgresql://Vechr:123@localhost:5432/things_db?schema=public"
```

# Running Thing Service
```bash
yarn install
yarn prisma:sync
yarn db:migrate
yarn db:studio
yarn watch
```

# Build Image for Production
```bash
chmod +x ./docker/build.sh
./docker/build.sh
```