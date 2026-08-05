---
name: recomp
description: >
  Replicate a UI component from a component library documentation page into a
  headless (behavior-only, unstyled) component for the user's framework
  (SolidJS / Vue / Svelte). Use when the user provides a component library docs
  URL (shadcn/ui, Radix, MUI, Ant Design, ...) and wants that component ported
  to their stack as paste-ready source code — e.g. "按照文档复刻组件",
  "照着文档生成 headless 组件", "把这个组件移植到我的框架",
  "replicate/port/convert this component from <url>". Everything is delivered
  in the conversation (source files, usage notes, style contract); nothing is
  written to the user's project.
---

# recomp — component docs → headless replicator

Replicates a component from a library documentation URL into a **headless**
(behavior-only, zero styles) component in the user's framework, delivered in
conversation for the user to copy into their own component directory. The user
owns styling, design tokens, and integration.

## Input

| Input | Required | Notes |
|---|---|---|
| Docs URL | yes | single-component docs page of a component library |
| Project root | no | enables read-only probing of framework/CSS/tokens; falls back to cwd; if nothing detectable, ask one line |

## Workflow

1. **Fetch & validate the URL** — must be a single-component docs page
   (component name + props/API table + usage examples). Not a component library
   → refuse with a reason. Unreachable page → propose npm / GitHub source.
   → `references/verification.md`
2. **Probe project context (read-only)** — framework+version, CSS approach,
   design tokens (DESIGN.md, `:root` vars, `@theme`, stylex tokens), existing
   conventions, and whether an ecosystem headless library is present
   (Kobalte / Reka UI / Bits UI — used as reference material). Ask the user
   only on ambiguity or blind spots, with detected results pre-filled.
   → `references/probing.md`
3. **Build the behavior contract** — extract interface (props/events/slots,
   controlled/uncontrolled) and behavior from docs; fill gaps from WAI-ARIA
   APG and, when available, the ecosystem headless library as a reference;
   classify every decision A (docs) / B (APG or ecosystem reference) /
   C (cannot infer → ask).
4. **Generate deliverables** — in conversation only; complete files, never
   patches; framework-native idioms (Vue `v-model`, Svelte 5 `bind:`/runes,
   Solid signals). → `references/deliverables.md`
5. **Iterate** — user copies (accept) or requests changes; always re-emit full files.

## Deliverables (per component)

1. Validation result — one line
2. Behavior contract summary — interface, behavior, A/B/C decision table,
   dependency list, framework idiom mapping
3. Source files — one code block per file, filenames included, deps with versions
4. Usage instructions — examples + API summary
5. Style interface contract — data-attributes, class slots, CSS variables,
   customized to the probed CSS approach
6. Optional — Playwright acceptance script (keyboard, focus, ARIA snapshot)

## Hard rules

- **Read-only**: never create directories or modify files in the user's
  project; probe results are session-only judgment input, not persisted
- **Never guess accessibility semantics** (ARIA roles, focus management,
  keyboard behavior): fill from WAI-ARIA APG or mark "not implemented"
- **Refuse** non-component-library pages (with a reason). If the user's
  ecosystem already has an equivalent headless implementation
  (Kobalte / Reka UI / Bits UI), **learn from it as a reference** (behavior +
  API), but still deliver the replicated code — never redirect the user to
  install a third-party library
- **License**: replicate interface + behavior only, never copy proprietary
  source or style values; record source URL + fetch date in the decision log
- Complex components (DataGrid, virtualized tables, date pickers): state
  quality expectations up front or recommend a mature library

## References

- `references/verification.md` — URL validation checklist & refusal cases
- `references/probing.md` — project probing signals, confidence, fallback questions
- `references/deliverables.md` — deliverable templates, decision classification, framework idiom mapping
