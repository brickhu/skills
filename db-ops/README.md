# db-ops — General-purpose Database Operations Skill

> Let your AI agent query and manage databases directly — safely.

[中文指南 / Chinese Guide](./README_cn.md)

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
- **Multi-database support**: PostgreSQL, MySQL, SQLite (type is inferred from the connection string scheme)

## How it stays safe

- **No auto-discovery**: the skill never scans environment variables or ports — it only connects to connections explicitly registered in the whitelist
- **Connection confirmation**: every operation confirms which whitelisted connection is the target (even when there's only one), so you never accidentally run a query against the wrong database
- **Typed confirmations**: dangerous operations require you to type a dynamic confirmation string that includes the connection name and row count — you must have actually read the plan block to answer correctly
- **Secrets never leak**: connection strings print as `postgres://user:***@host`, outputs are redacted, `.env` files are `chmod 600` and gitignored
- **Env labeling**: every result is tagged with the connection environment (local / dev / prod); writes to remote or prod databases are treated as dangerous by default

## Requirements

- A `psql` / `mysql` client on your machine — or **Docker** (the skill falls back to a disposable `postgres:16` container, used once and discarded; connection strings are never written to disk)

## Installation

```sh
# Option A: via the skills.sh CLI
npx skills add brickhu/skills

# Option B: manual install (works with any SKILL.md-capable agent)
mkdir -p ~/.claude/skills
cp -r db-ops ~/.claude/skills/db-ops
```

After installation, restart your agent session — it will auto-discover the skill.

## Quick start

1. **Register a connection** — create a `.dbops/` directory in your project (or `~/.dbops/` globally), add one connection per line to `.env`:

   ```bash
   # .dbops/.env  (chmod 600, gitignored)
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

   - "帮我查一下 REMOTE 库的 users 表结构" (inspect schema)
   - "看看 LOCAL 库最近 10 条订单记录" (query rows)
   - "把 id=5 的订单状态改成 shipped，先给我看计划" (dangerous write — you'll be asked to type a confirmation)
   - "添加邀请码 abc123" (recipe trigger)

## Project layout

```
db-ops/
├── SKILL.md            # the skill definition (name, description, rules)
├── env.example         # example connection-string file
├── recipes.example.json# example recipe shortcuts
├── README.md           # this file (English)
└── README_cn.md        # 中文指南
```

## License

MIT — use it, fork it, share it.
