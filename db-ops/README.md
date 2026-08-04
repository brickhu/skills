# db-ops — General-purpose Database Operations Skill

[![skills.sh](https://skills.sh/b/brickhu/skills)](https://www.skills.sh/brickhu/skills)

> Let your AI agent query and manage databases directly — safely.

[Chinese Guide](./README_cn.md)

`db-ops` is an agent skill (a `SKILL.md` package) that gives AI coding agents
(Claude Code, Cursor, Zed, and any agent that supports the SKILL.md format) the
ability to directly operate on your databases: browse schemas, run queries,
insert records, and perform dangerous writes — with a strict safety model built
in.

## What it does

- **Query anything**: `SELECT` queries and table/view inspection (`\dt`, `SHOW TABLES`, `\d <table>`, `DESCRIBE <table>`)
- **Insert data**: `INSERT` is executed directly (low risk)
- **Dangerous writes with guardrails**: `UPDATE / DELETE / DROP / TRUNCATE / ALTER / migrations` first show a plan block (operation + table + WHERE + estimated row count via `SELECT count(*)`), then require a **typed confirmation string** (e.g. `confirm-DELETE-LOCAL-4`) before executing — "yes / Y / confirm" are rejected
- **Shortcut recipes**: turn frequent multi-step operations (e.g. "generate an invite code") into one trigger phrase via `recipes.json`
- **Audit logging**: every operation is appended to `.dbops/logs/<date>.log`; connection strings and passwords are never logged
- **Manage recipes in chat**: add, tweak, or remove shortcuts by just asking — the skill drafts the recipe, you approve, it's saved and verified
- **Query audit logs in chat**: ask "what happened today?" and filter by connection, type, or source, right in the conversation
- **Multi-database support**: PostgreSQL, MySQL, SQLite (type is inferred from the connection string scheme)
- **Language-aware**: communicates in the same language you use in chat — English, Chinese, or any other language
- **Community recipes**: browse and submit shared recipes in the [Recipe Gallery](../recipes/README.md)

## Local or remote — any database you can reach

db-ops is **not limited to your local machine**. It connects to any database that is reachable from your machine — if you can write a connection string for it, the skill can operate on it:

- **Local**: databases on `localhost` (PostgreSQL / MySQL / SQLite)
- **Remote**: databases on your LAN or a VPS (any IP or domain), and **cloud-hosted databases** — AWS RDS, Railway, Neon, Supabase, PlanetScale, Tencent/Aliyun Cloud RDS, anything that exposes a connection string

The skill infers the environment from the host: `localhost` → `local`, hosted domains → `remote` (dev/prod). Writes to remote databases are treated as **dangerous by default** and always go through the plan + typed-confirmation flow.

The only inherently local type is SQLite — it's a file on disk.

## How it stays safe

- **No auto-discovery**: the skill never scans environment variables or ports — it only connects to connections explicitly registered in the whitelist
- **Connection confirmation**: every operation confirms which whitelisted connection is the target (even when there's only one), so you never accidentally run a query against the wrong database
- **Typed confirmations**: dangerous operations require you to type a dynamic confirmation string that includes the connection name and row count — you must have actually read the plan block to answer correctly
- **Secrets never leak**: connection strings print as `postgres://user:***@host`, outputs are redacted, `.env` files are `chmod 600` and gitignored
- **Env labeling**: every result is tagged with the connection environment (local / dev / prod); writes to remote or prod databases are treated as dangerous by default

## Audit logging

Every operation — a `SELECT`, an `INSERT`, a dangerous write, a shell command, or a recipe run — is appended to a **daily log file** at `.dbops/logs/<date>.log` (project-level; falls back to `~/.dbops/logs/` when there is no project config). Each entry looks like:

```
[2026-08-04 16:30:12] [conn: LOCAL localhost local] [type: DELETE] [source: user] DELETE FROM orders WHERE id = 5 → 1 row affected (confirmed with confirm-DELETE-LOCAL-1)
```

- **Who**: connection (name / host / env), operation type, source (user instruction or recipe)
- **What**: a summary of the SQL or command, plus the result (rows affected / key info)
- **Dangerous operations are always logged**, including the confirmation outcome (`confirmed with confirm-...` / `declined`)
- **Never logged**: connection strings, passwords, or secret values — anything key-like is masked as `***`

It's the operation history your admin backend never had: if something unexpected happened to your data, you can trace exactly when, on which database, and by which operation.

## Requirements

- A `psql` / `mysql` client on your machine — or **Docker** (the skill falls back to a disposable `postgres:16` container, used once and discarded; connection strings are never written to disk)

## Installation

```sh
# Option A: via the skills.sh CLI (-s selects the db-ops skill specifically)
npx skills add brickhu/skills -s db-ops

# Option B: manual install (works with any SKILL.md-capable agent)
mkdir -p ~/.claude/skills
cp -r db-ops ~/.claude/skills/db-ops
```

After installation, restart your agent session — it will auto-discover the skill.

## Quick start

1. **Register a connection** — create a `.dbops/` directory in your project (or `~/.dbops/` globally), add one connection per line to `.env`:

   ```bash
   # .dbops/.env  (chmod 600, gitignored)
   # localhost, a VPS, or any cloud database — any host works
   LOCAL=postgres://user:devpass@localhost:5432/dbname
   REMOTE=postgres://user:pass@altaria.proxy.rlwy.net:50930/railway
   ```

2. **(Optional) define recipes** — copy `recipes.example.json` to `recipes.json` and add your shortcuts:

   ```json
   {
     "recipes": [
       {
         "name": "add invite code",
         "triggers": ["add invite code", "generate invite code"],
         "connection": "LOCAL",
         "prompt": "Run pnpm invites:create <code> to generate an invite code (workdir services/api), then verify with SQL that it was inserted",
         "danger": false
       }
     ]
   }
   ```

3. **Talk to your agent** — for example:

   - "Show me the structure of the users table in the REMOTE database" (inspect schema)
   - "Show me the 10 most recent orders in the LOCAL database" (query rows)
   - "Change order id=5 to shipped — show me the plan first" (dangerous write — you'll be asked to type a confirmation)
   - "Add invite code abc123" (recipe trigger)

## Project layout

```
db-ops/
├── SKILL.md            # the skill definition (name, description, rules)
├── env.example         # example connection-string file
├── recipes.example.json# example recipe shortcuts
├── README.md           # this file (English)
└── README_cn.md        # Chinese guide
```

## License

MIT — use it, fork it, share it.
