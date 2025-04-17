# APPLICATION : GAME LOBBY

> This is a simple game lobby system where users can join a game
> session, pick a number, and compete to win. The backend will manage authentication and
> lobby. While the frontend will provide a basic UI for interaction.

## TREE STRUCTURE

```bash
/mblng-assessment
├── README.md
├── docker-compose.yml
├── game-lobby-api
│ ├── Dockerfile
│ ├── README.md
│ ├── eslint.config.mjs
│ ├── nest-cli.json
│ ├── node_modules
│ ├── package-lock.json
│ ├── package.json
│ ├── src
│ ├── test
│ ├── tsconfig.build.json
│ └── tsconfig.json
└── game-lobby-client
├── Dockerfile
├── README.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── node_modules
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
├── src
└── tsconfig.json
```

## DIRECTORIES

- Backend

```javascript
cd game-lobby-api
```

stack : NestJs

- Frontend

```javascript
cd game-lobby-client
```

stack : NextJs

### DOCUMENTATION

🔗 [Backend README](./game-lobby-api/README.md)

🔗 [Frontend README](./game-lobby-client/README.md)

## Start App

> You can start both apps individually by naviagting into their directories

> Use the following commands

- Client

```bash
npm run dev
```

-API

```bash
npm run start:dev
```

both commands start in development mode.

## Start with Docker Compose

You can also spin up both services together using Docker Compose:

```bash
docker-compose up --build
```

## Stop Containers

```bash
docker-compose down
```

> This will build and run both the backend and frontend containers, exposing them on:

- Frontend: http://localhost:3000

- API: http://localhost:5000

## Requirements

- Node.js

- Docker

- Docker Compose

## Notes

- Make sure MongoDB is available locally or through a Docker container.

- Environment variables should be configured in .env files (see individual project READMEs).
