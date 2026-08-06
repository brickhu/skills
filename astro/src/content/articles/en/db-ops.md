---
title: "Why is the admin dashboard harder than the user app? — db-ops, the data-ops assistant for indie developers"
description: 'db-ops, an open-source AI skill: safely connect your database so your AI coding assistant becomes your data-ops assistant — no dev, no release, change requirements in plain words.'
pubDate: 2026-08-04
lang: en
tags: ['db-ops', 'data operations', 'AI']
original: docs/wechat-db-ops.md
---

After years of indie development, I've learned something:

**Product development isn't just the user-facing flow and UI — you also need an admin dashboard for data operations. For some products, the admin dashboard is more complex and time-consuming to build than the user side.**

You might say: isn't an admin dashboard just a few forms and tables? How hard can it be?

Build one and you'll know —

The **user side** looks fancy, but the patterns are fixed: buttons, inputs, lists, modals — pull a component library, copy the design, done. Users also give you feedback; if something's wrong, someone tells you.

The **admin side** is a completely different story:

- Permissions: who can see, who can edit, who can delete
- Guarding against mistakes: who pays when data gets deleted by accident
- Bulk operations: bulk status changes, bulk exports
- State transitions and edge cases everywhere
- Requirements change daily — the admin users are your own team; today's ask becomes tomorrow's change, and there's no "acceptance" milestone
- Worst of all: **nobody praises a finished dashboard, but everyone nags when it's late**

That's why so many indie projects ship the features but stall at the "admin dashboard" stage — dragging on for weeks.

## Rethink: what is an admin dashboard, really?

**An admin dashboard is a pretty shell around your database.** The data already lives in the database; the dashboard just packages "look up users, change orders, issue invite codes" — CRUD — into something nice.

So what if — there's an AI that can safely operate your database directly?

That's what `db-ops` does. It's an open-source AI skill pack. Once installed, your AI coding assistant (Claude Code, Cursor, Zed all work) becomes your **data-ops assistant**:

| What you'd normally build | What you say instead |
|---|---|
| User lookup page | "Show me user 123's last 10 orders" |
| Order status change feature | "Change order 888 to shipped" |
| Invite code tool | "Generate an invite code" (auto-inserted + verified) |
| Campaign config UI | "Change the check-in campaign to 3 times a day" |
| Stats report | "Count this week's new users by channel" |

**No development, no releases, requirements change — just say it differently.** The time saved goes to features that actually create value for users.

## Worried: is it safe to let AI touch the database directly?

Don't worry — this is where db-ops spends the most effort. Everything an admin dashboard must guard against — mistakes, privilege abuse, missing audit trails — it handles for you:

- **Only connects to whitelisted databases**; anything outside the whitelist is refused — that's your permission control
- **Confirms which database every time**, even with a single database — no more "thought it was the test DB, operated the production DB"
- **Deletes and updates need a "secret handshake"**: the AI shows you the plan first (which table, how many rows), then you type a dynamic confirmation phrase (e.g. `confirm-DELETE-LOCAL-4`) to execute — the phrase embeds the DB name and row count, so you can't answer without reading the plan; it stops slip-ups and AI freelancing
- **Full audit log**: every operation is recorded — when, which database, what was done, how many rows affected, fully traceable
- **Secrets never surface**: passwords always display as `postgres://user:***@host` — hard to leak even if you tried
- **Production gets extra care**: remote and production database writes default to the most dangerous handling

Every operation is also recorded in the **audit log** — like an admin dashboard's operation history, line by line:

```
[2026-08-04 16:30:12] [DB: LOCAL localhost] [TYPE: DELETE] [SOURCE: user command] DELETE FROM orders WHERE id = 5 → 1 row affected (confirmed confirm-DELETE-LOCAL-1)
```

**When it happened, which database, what was done, how many rows — all queryable**; confirmation results of dangerous operations are recorded too ("confirmed" or "denied"). Connection strings and passwords never appear in logs — if anything ever goes wrong, you can trace it to the exact operation.

In one sentence: **the AI does the work; all safety gates stay in your hands.**

## Install & configure

**Install (either way):**

```sh
# Option 1: one-liner via skills.sh
npx skills add brickhu/skills -s db-ops

# Option 2: manual copy (any AI assistant that loads SKILL.md)
mkdir -p ~/.claude/skills
cp -r db-ops ~/.claude/skills/db-ops
```

**Configure (one file):**

```bash
# Create a .dbops/ directory in your project with a .env, one DB connection per line
# .dbops/.env
LOCAL=postgres://user:devpass@localhost:5432/dbname #local database
REMOTE=postgres://user:pass@xxx.proxy.rlwy.net:50930/railway #remote database
```

**My database is in the cloud — does it work? Yes.** db-ops doesn't care where the database lives — if you can write a connection string, it can connect: local databases, VPS databases, **cloud databases** (Railway, Neon, Supabase, AWS RDS, Tencent/Aliyun RDS). Indie production databases are almost always cloud-hosted — register the connection string in `.env` and the AI operates it for you. Cloud databases get even stricter treatment: **remote database writes default to dangerous handling** and must go through the "plan + confirmation phrase" flow — the AI can't quietly modify remote data.

Supports PostgreSQL, MySQL, SQLite. Common multi-step operations can be packaged as quick commands (recipes) — "generate invite code" triggers the whole flow in one sentence.

## Finally

An indie developer's time should go into the product, not internal tooling.

**Ship the user side, and stop worrying about the admin side.** When developing your product, hand the admin dashboard work to db-ops — your data-ops assistant.

db-ops is open source (MIT) — use it, modify it, share it.

📦 Repository: **https://github.com/brickhu/skills**
📖 English & Chinese guides are in the repo (README.md / README_cn.md)

Star it, file issues, and share your recipes.

**Your data-ops assistant goes live today.**
