---
name: db-ops
description: General-purpose database management skill. Use when the user needs to operate on a database directly — query/modify/delete data, inspect table structures, run arbitrary SQL, or mentions like "check the database", "look at the records in X", "delete a record", "run some SQL", "is there X in the database". Also triggers on Chinese requests such as "查一下数据库", "看看 xx 的记录", "删掉某条数据", "跑个 SQL", "数据库里有没有". Connections are loaded from a whitelist config (project dir first, global dir as fallback); no automatic environment sniffing. SELECT/INSERT execute directly; write operations (UPDATE/DELETE/DROP, etc.) show a plan first and wait for confirmation. Communicate in the same language the user is chatting in.
---

# db-ops: General-purpose database CRUD (whitelist config + quick recipes)

No auto-discovery, no scanning of environment variables or ports — **only connects to connections explicitly registered in the config**, and wraps common multi-step project operations into quick recipes.

## Language adaptation

The skill follows the language of the conversation: if the user writes in Chinese, everything — questions, plan blocks, confirmation prompts, receipts, error messages — is communicated in Chinese; if the user writes in English, in English; any other language works the same way. Recipes (`prompt` fields) are treated as user instructions in whatever language they are written in.

The typed confirmation string is **always the fixed format** `confirm-<operation>-<connection>-<rows>` (English words), regardless of the conversation language.

## 1. Config structure (.dbops directory)

**Location & precedence (whole-override, no merging)**:
- Global: `~/.dbops/` (fallback)
- Project: `<project root>/.dbops/` (priority)
- **Override rule: when a project `.dbops/` exists, the global `~/.dbops/` is fully disabled for that project** — both connections and recipes come only from the project config, never merged

```
.dbops/
├── .env           # connection strings (gitignored + chmod 600)
├── recipes.json   # quick recipes (no secrets, safe to commit)
└── logs/          # operation audit logs (gitignored)
```

**Connection strings (.env)**: one per line, `<name>=<full connection string>` — a connection's "identity" is the connection string itself (address + account + password):
```bash
LOCAL=postgres://user:devpass@localhost:5432/dbname
REMOTE=postgres://user:pass@altaria.proxy.rlwy.net:50930/railway
```
Inference rules (no extra fields needed): `TYPE` from the scheme (`postgres://`→pg, `mysql://`→mysql, `sqlite:`→sqlite); `ENV` from the host (`localhost`→local, hosted domain→remote, dev/prod decided by context); description = connection name.

**Quick recipes (recipes.json)**: trigger phrase → a natural-language workflow (the model breaks it down and executes it). Template variables `<param>` are extracted from the user's instruction; ask if missing:
```json
{
  "recipes": [
    {
      "name": "Add invite code",
      "triggers": ["add invite code", "generate invite code"],
      "connection": "LOCAL",
      "prompt": "Run pnpm invites:create <code> to generate an invite code (workdir services/api), with optional [--expires <days>]; after generating, verify it was inserted with a SQL query",
      "danger": false
    }
  ]
}
```
- `prompt`: a full natural-language instruction — treat it as extra user speech to understand and execute (the model decides shell / SQL / a combination); template variables are substituted directly; **still bound by all the rules of this skill**: only run on the whitelisted `connection`, and confirm first if the translated result is a dangerous operation
- `danger: true`: force the dangerous-operation confirmation before execution (even if the prompt translates to a plain SELECT)
- Recipes are edited and maintained by the user; the skill does not write them (it may suggest how to add one)

**Connection selection (every operation confirms by default)**:
- User explicitly names a connection (e.g. "check the xx in the REMOTE database") → use it directly, no further prompt
- Connection not specified → **must ask before executing**: list all whitelisted connections (name + host + inferred env) and wait for the user to pick — even if there is only one connection, confirm once, to prevent "thought I was on local, actually operated remote" mistakes
- Connections outside the whitelist are always rejected, with a hint on how to add them to the config (the user edits manually; the skill does not write it)

## 2. Execution rules

- Inspect structure before querying data: PG `\dt` / MySQL `SHOW TABLES` / SQLite `.tables`; columns via PG `\d <table>` / MySQL `DESCRIBE <table>`. Table names with PascalCase (e.g. `"user"`) must be double-quoted.
- **SELECT**: run directly, report results as tables/lists.
- **INSERT**: run directly (low risk), report the inserted rows.
- **UPDATE / DELETE / DROP / TRUNCATE / ALTER / migrations**: dangerous operations — first show a plan block (operation + table + WHERE + estimated row count, **run `SELECT count(*)` first to verify the scope**), then **require the user to type a dynamic confirmation string** (typed confirmation):
  - Format: `confirm-<operation>-<connection>-<estimated rows>`, generated per operation (e.g. `confirm-DELETE-LOCAL-4`)
  - The user must **type the exact string** to execute; "yes / Y / confirm" are all rejected with a re-prompt
  - The string contains the connection name and row count — the user must have read the plan block to answer correctly; prevents accidental triggers and model self-confirmation
  - After confirmation, the executed SQL must match the plan block **exactly** (no mid-flight changes); report the affected row count
  - Writes to remote databases (host not localhost) default to dangerous — same confirmation flow
- Multi-line SQL via heredoc.

**Audit log (.dbops/logs/, every operation must be logged)**: append to `logs/<date>.log` (project-level; `~/.dbops/logs/` when there is no project config), one line per entry:
```
[time] [conn: name host env] [type: SELECT|INSERT|UPDATE|DELETE|shell|recipe] [source: user instruction|recipe name] SQL/command summary → result (rows affected / key info)
```
- **Never log connection strings/passwords** (host may be logged); SQL text may be logged (acceptable for ops auditing) but statement values involving secrets use `***` placeholders
- Dangerous operations (DELETE/UPDATE/DROP etc.) and recipe runs must be logged, including the confirmation outcome (`confirmed with confirm-...` / `declined`)

**Toolchain**: use local psql when available; otherwise a temporary docker container (used once and discarded, connection string never written to disk):
```bash
# Note: inside the container, localhost is the container itself — to reach a host database, replace localhost with host.docker.internal
docker run --rm -i postgres:16 psql "$(echo "$CONN" | sed 's/localhost/host.docker.internal/')" -c '<SQL>'
```

## 3. Security

- Connection strings, passwords, keys are **never printed** (shown as `postgres://user:***@host`); never echo a connection string in a command (reference it via a variable).
- `.env.dbops` permissions set to `chmod 600` (owner-readable only), and covered by the project `.gitignore` (`.env.*` pattern).
- Output redaction: password/token/secret columns shown as `***`.
- **Environment identification**: annotate the connection env (local/dev/prod) in receipts and confirmations. Writes to `prod` and remote `dev` default to dangerous — call it out explicitly and wait for explicit confirmation.
- Always count before deleting to verify scope; DELETE/UPDATE without a WHERE clause is treated as an accidental operation and requires explicit user confirmation.

## 4. Receipt format

```
✓ operation + result (rows/key fields) [conn: <name> <host> <env>]
✗ failure + reason (redact secrets from error messages) [conn: <name> <host> <env>]
```
