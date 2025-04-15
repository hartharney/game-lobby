# 🎮 Game Lobby API — NestJS 🐺

A simple, real-time game lobby system where users can join game sessions, pick a number, and compete to win.  
Built with **NestJS**, **MongoDB** , and **Docker** — following **SOLID principles** and clean architecture.

---

### Overview of NestJs

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">

> To learn more about them read the [documentation](http://nodejs.org)

## Features

- **User Authentication** (JWT-based)
- **Game session management** (start, join, end)
- **Random number pick (1-10)**
- **Automatic winner calculation**
- **Persistent session history** (MongoDB)
- **Leaderboard (Top 10 users by wins)**
- **Dockerized for local development**

> Directory tree (depth: 1)

```bash
.
├── Dockerfile
├── README.md
├── dist
├── eslint.config.mjs
├── nest-cli.json
├── node_modules
├── package-lock.json
├── package.json
├── src
├── test
├── tsconfig.build.json
└── tsconfig.json
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod

```

The API will be available at:
http://localhost:5000

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Create an env file

```bash
MONGO_URI=yourmongouri
JWT_SECRET=yoursecretkey
```

## API Endpoints

| Method | Endpoint             | Description                             | Auth |
| :----- | :------------------- | :-------------------------------------- | :--- |
| POST   | /auth/register       | Register a user with username           | ❌   |
| POST   | /auth/login          | Login and receive JWT token             | ❌   |
| POST   | /game/start-session  | Start a new game session (20 sec)       | ❌   |
| GET    | /game/active-session | Get current active session info         | ❌   |
| POST   | /game/join           | Join active session & pick number       | ✅   |
| POST   | /game/end-session    | End current session & calculate winners | ❌   |
| GET    | /game/leaderboard    | Fetch top 10 users by wins              | ❌   |

## Game Rules

- A session lasts for 20 seconds.

- Players join while it’s active.

- Each player picks a random number (1-10) on joining.

#### At the end:

- A winning number is randomly chosen.

- Players who picked the correct number gain a win.

- Top players ranked via /game/leaderboard.

## Tech Stack

| Logo                                                                                      | Tool           | Description                 |
| :---------------------------------------------------------------------------------------- | :------------- | :-------------------------- |
| ![NestJS](https://nestjs.com/img/logo-small.svg)                                          | **NestJS**     | Backend framework (Node.js) |
| ![MongoDB](https://webassets.mongodb.com/_com_assets/cms/mongodb-logo-rgb-j6w271g1xn.jpg) | **MongoDB**    | NoSQL database              |
| ![Docker](https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png)                | **Docker**     | Containerization            |
| ![Mongoose](https://avatars.githubusercontent.com/u/7552965?s=200&v=4)                    | **Mongoose**   | MongoDB ORM for Node.js     |
| ![JWT](https://cdn.auth0.com/blog/logos/jwt-logo.svg)                                     | **JWT**        | Authentication tokens       |
| ![TypeScript](https://cdn.worldvectorlogo.com/logos/typescript.svg)                       | **TypeScript** | Type-safe JavaScript        |

## Deployment

> This backend is containerized and deployable to:

> - AWS ECS / Fargate

> - Render

> - DigitalOcean

> - Any Docker-compatible platform

> - The frontend will be deployable on Vercel.

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Stay in touch

- Author - [Hart Harney](https://github.com/hartharney)
- Instagram - [@hartharney](https://instagram.com/hart_harney)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
