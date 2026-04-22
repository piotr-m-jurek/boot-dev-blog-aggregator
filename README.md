# Blog Aggregator CLI

A backend CLI microservice built in TypeScript that aggregates RSS feeds into a local PostgreSQL database. Built as part of the [Boot.dev backend engineering track](https://www.boot.dev/courses/build-blog-aggregator-typescript).

## Why This Project

As a frontend developer expanding into backend engineering, this project is a hands-on exercise in building a real backend service from scratch - not just an API consumer, but a data pipeline that fetches, parses, stores, and serves content.

## What's Covered

- **CLI application architecture** — structured command handling, user configuration, and argument parsing in TypeScript
- **PostgreSQL + Drizzle ORM** — schema design, migrations, and type-safe database queries
- **RSS feed parsing** — fetching and processing XML data from remote sources over HTTP
- **Multi-user system** — user registration, authentication, and per-user feed subscriptions (follow/unfollow)
- **Long-running service worker** — a background aggregation loop that continuously polls and stores new posts from followed feeds

## Tech Stack

- TypeScript
- PostgreSQL
- Drizzle ORM
- Node.js

## Getting Started

```sh
npm install
npm start
```

Requires a running PostgreSQL instance. Configure your database connection via the CLI config commands.
