# Blog Aggregator CLI

A backend CLI tool built in TypeScript that aggregates RSS feeds into a local PostgreSQL database. Built as part of the [Boot.dev backend engineering track](https://www.boot.dev/courses/build-blog-aggregator-typescript).

## Purpose

This project is a learning exercise, not production-ready code. The goal was to get hands-on experience applying backend engineering concepts — database design, data pipelines, CLI architecture, ORM usage — by building something that actually works end to end. The focus was on understanding the rules and patterns, not on polishing the implementation. Think of it as a working proof of concept.

Some rough edges are intentional or left in place because the value was in building it, not perfecting it.

## What It Does

- Scrapes RSS feeds on a configurable interval and stores posts in PostgreSQL
- Multi-user system with per-user feed subscriptions (follow/unfollow)
- CLI commands for managing users, feeds, and browsing the latest posts
- Handles RSS and Atom feed formats with lenient XML parsing

## Concepts Practiced

- **CLI architecture** — structured command registration, middleware, argument parsing
- **PostgreSQL + Drizzle ORM** — schema design, migrations, type-safe queries
- **RSS/XML parsing** — fetching and normalising data from remote feeds over HTTP
- **Long-running service worker** — polling loop with configurable interval and graceful shutdown
- **Multi-user data model** — users, feed ownership, follow relationships, per-user post views

## Tech Stack

- TypeScript
- Node.js
- PostgreSQL
- Drizzle ORM

## Getting Started

```sh
npm install
npm start <command>
```

Requires a running PostgreSQL instance.

### Available Commands

| Command | Description |
|---------|-------------|
| `register <name>` | Create a new user |
| `login <name>` | Switch active user |
| `users` | List all users |
| `reset` | Delete all users and data |
| `addfeed <name> <url>` | Add and follow an RSS feed |
| `feeds` | List all feeds |
| `follow <url>` | Follow an existing feed |
| `unfollow <url>` | Unfollow a feed |
| `following` | List feeds you follow |
| `agg <interval>` | Start the aggregator (e.g. `agg 10s`) |
| `browse [limit]` | Show latest posts (default: 2) |
