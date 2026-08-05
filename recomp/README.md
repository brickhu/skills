# recomp

Replicate UI components from component library documentation into **headless
components for your framework** — behavior only, zero styles, delivered in the
conversation and ready to paste.

> 中文版见 [README_cn.md](./README_cn.md)

## What it does

Give it a component library docs URL (shadcn/ui, Radix, MUI, Ant Design, …),
and recomp will:

1. **Validate** the page is actually a component library docs page (refuses
   blogs, utility libs, design files — with a reason)
2. **Probe your project read-only** — framework + version, CSS approach,
   design tokens (DESIGN.md, `:root` CSS vars, `@theme`, stylex tokens) — no
   files created, nothing modified
3. **Produce**:
   - a **behavior contract summary** — what was taken from the docs, what was
     filled from WAI-ARIA APG patterns, and what is left open for you to decide
   - **headless component source** in your framework
     (SolidJS / Vue / Svelte), complete files, with a dependency list
   - **usage instructions** (examples + API summary)
   - a **style interface contract** — data-attributes, class slots, CSS
     variables — matched to your CSS setup (className passthrough for
     Tailwind, style props for StyleX, …)

You keep styling and design tokens entirely in your hands: paste the source
into your component directory, wire up the styles, done. Don't like a
decision? Say so — the component is re-emitted in full.

## Install

One-liner via the [skills CLI](https://skills.sh):

```sh
npx skills add brickhu/skills/recomp
```

No dependencies, no build step. (Manual alternative: copy the `recomp/` folder
into your agent's skills directory, e.g. `~/.agents/skills/`.)

## Usage

1. Send the docs URL: `recomp <url>`
2. (Optional) Point it at your project so it can probe your stack:
   `recomp <url> --project ~/my-app` — otherwise it falls back to the current
   working directory
3. Review the behavior contract summary, then copy the source files
4. Iterate in conversation: *"the escape handling is wrong"*, *"use `bind:`
   instead of `v-model`"* — every revision is delivered as complete files

## What it refuses

- **Non-library pages** (blogs, utility libraries, design files) — refused
  with a reason
- **Guessing accessibility semantics** (ARIA / focus / keyboard) — filled from
  WAI-ARIA APG patterns or explicitly marked "not implemented"
- **Writing into your project** — probing is read-only; everything is
  delivered in chat
- **Pushing third-party libraries on you** — if your ecosystem already has an
  equivalent headless library (Kobalte for Solid, Reka UI for Vue, Bits UI for
  Svelte), it learns from it as a reference but still delivers your own
  copy-paste code — the component library stays in your hands

## Files

```
recomp/
├── SKILL.md                     # skill definition (entry point)
├── README.md                    # this guide
├── README_cn.md                 # 中文版
└── references/
    ├── verification.md          # URL validation checklist & refusal cases
    ├── probing.md               # read-only project probing signals
    └── deliverables.md          # deliverable templates & decision classification
```

## License

MIT
