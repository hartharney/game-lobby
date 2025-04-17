# 🎮 Game Lobby API — NextJs 🐺

A simple, real-time game lobby system where users can join game sessions, pick a number, and compete to win.  
Built with **NextJS** and **Tanstack**,

---

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

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Pages

| Page        | Endpoint     | Description                       | Auth |
| :---------- | :----------- | :-------------------------------- | :--- |
| Home        | /            | Landing Page                      | ❌   |
| Leaderboard | /leaderboard | View player standings             | ❌   |
| Lobby       | /lobby       | Join active session & pick number | ✅   |
| Register    | (modal)      | Register account                  | ❌   |
| Login       | (modal)      | Login account                     | ❌   |

## Game Rules

- A session lasts for 20 seconds.

- Players join while it’s active.

- Each player picks a random number (1-10) on joining.

#### At the end:

- A winning number is randomly chosen.

- Players who picked the correct number gain a win.

- Top players ranked via /game/leaderboard.

## Tech Stack

## 🖥️ Frontend Tech Stack

| Logo                                                                      | Tool               | Description                             |
| :------------------------------------------------------------------------ | :----------------- | :-------------------------------------- |
| ![Next.js](https://nextjs.org/static/favicon/favicon-32x32.png)           | **Next.js**        | React-based framework for SSR & SPA     |
| ![TanStack Query](https://tanstack.com/query/v4/images/emblem-dark.svg)   | **TanStack Query** | Powerful data fetching & caching        |
| ![Zustand](https://avatars.githubusercontent.com/u/72518640?s=200&v=4)    | **Zustand**        | Minimalistic state management library   |
| ![Socket.IO](https://socket.io/images/logo.svg)                           | **Socket.IO**      | Real-time, bi-directional communication |
| ![TypeScript](https://cdn.worldvectorlogo.com/logos/typescript.svg)       | **TypeScript**     | Type-safe JavaScript                    |
| ![Tailwind CSS](https://tailwindcss.com/favicons/favicon-32x32.png?v=3)   | **Tailwind CSS**   | Utility-first CSS framework             |
| ![Framer Motion](https://cdn.worldvectorlogo.com/logos/framer-motion.svg) | **Framer Motion**  | React animations library                |

## Deployment

> - The frontend will be deployable on Vercel / AWS EC2.

## Stay in touch

- Author - [Hart Harney](https://github.com/hartharney)
- Instagram - [@hartharney](https://instagram.com/hart_harney)
