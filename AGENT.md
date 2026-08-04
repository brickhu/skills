# Skills Production Factory

## Project Purpose

This repository is a **skill production factory** for the Zed AI agent system. Every directory at the project root is a standalone agent skill — a reusable set of instructions and reference files that the AI agent can load on demand.

Each skill follows the standard Zed skill format:
- `SKILL.md` with YAML frontmatter (name, description)
- Supporting files in `src/`, `references/`, `scripts/`, `examples/` directories
- Optional: `MANIFEST.yaml`, `ARCHITECTURE.md`, `IMPLEMENTATION.md`

## Development Workflow

1. **Create / modify a skill** → Work inside `<skill-name>/` at the project root
2. **Test locally** → Run the sync command below to copy to `~/.agents/skills/`
3. **Commit** → `git commit` triggers the sync hook, making the skill available globally
4. **Verify** → In a new Zed conversation, the agent will auto-discover the skill

## Sync Command

After making changes, sync the skill to the global agent skills directory:

```sh
# Sync a single skill
rsync -av --delete <skill-name>/ ~/.agents/skills/<skill-name>/

# Sync all skills
for skill in */; do
  # Skip hidden directories and non-skill directories
  name=$(basename "$skill")
  [[ "$name" == .* || "$name" == "node_modules" || "$name" == "scripts" ]] && continue
  rsync -av --delete "$skill" ~/.agents/skills/"$name"/
done
```

This copies everything (`SKILL.md`, `src/`, `examples/`, etc.) to where the Zed agent can discover and load them.

## Git Commit Automation

After each `git commit`, the skills should be synced to `~/.agents/skills/` so they're immediately available for testing. Use a post-commit hook:

```sh
# .git/hooks/post-commit
#!/bin/sh
for skill in */; do
  name=$(basename "$skill")
  [[ "$name" == .* || "$name" == "node_modules" || "$name" == "scripts" ]] && continue
  [ -f "${skill}SKILL.md" ] || continue
  rsync -av --delete "$skill" ~/.agents/skills/"$name"/
done
```

Make the hook executable:
```sh
chmod +x .git/hooks/post-commit
```

## Current Skills

The public repo currently publishes **one** skill: `db-ops`. The other skills
(`addressinsight`, `snapurl`, `chacha`, `spec2code`, `ui-maker`) are developed
locally as part of this factory but are gitignored and not published.

| Skill | Description |
|-------|-------------|
| `db-ops` | Safe, whitelist-based database operations for AI agents |

## Adding a New Skill

1. Create `<skill-name>/SKILL.md` with proper frontmatter at the project root
2. Add supporting files as needed
3. Sync to `~/.agents/skills/` for testing
4. Commit to save
