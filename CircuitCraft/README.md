# CircuitCraft

AI-assisted electronics project planning. This starter includes a React + Vite frontend,
an Express API, and the first external component-search integration with Nexar / Octopart.

## Prerequisites
- Node.js 20+ and npm
- A Nexar application with the **Supply** scope
- Cursor or another code editor

## 1. Install dependencies

Open this folder in Cursor. In Cursor, open **Terminal → New Terminal**, then run:

```bash
npm install
npm run install:all
```

## 2. Configure Nexar credentials

Copy the backend environment template:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and enter your Nexar Client ID and Client Secret.
Keep these credentials private. Never paste them into frontend code or commit `.env`.

## 3. Start CircuitCraft

From the project root:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend health check: http://localhost:4000/api/health

Search for a part number such as `LM358` in the app. The browser calls our backend;
the backend obtains/caches a Nexar OAuth token and sends the GraphQL request.

## Project layout

```text
CircuitCraft/
  frontend/                 React + Vite UI
  backend/
    src/
      config/               Environment configuration
      integrations/         Nexar API client + normalizer
      routes/               HTTP routes
      server.js
    .env.example
  database/schema.sql       Initial MySQL schema (not wired into the MVP yet)
```

## First feature and current limitations

The first working feature is **MPN search via Nexar**. Search results are normalized
into a CircuitCraft-friendly shape. This starter does not yet persist catalog results
or projects in MySQL; that is the next implementation step.

Nexar access, quotas, and plan terms depend on your account. Check your current plan
and permitted caching/retention before storing provider data. API responses should be
treated as time-sensitive; the UI labels the source and retrieval time.

## Useful links
- Nexar portal: https://portal.nexar.com/
- Octopart API quick start: https://www.altium.com/documentation/altium-developer-center/quick-starts/octopart-api
- GraphQL endpoint: https://api.nexar.com/graphql
