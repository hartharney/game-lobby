# APPLICATION : GAME LOBBY

> This is a simple game lobby system where users can join a game
> session, pick a number, and compete to win. The backend will manage authentication and
> lobby. While the frontend will provide a basic UI for interaction.

## TREE STRUCTURE

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
