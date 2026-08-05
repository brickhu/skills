# Project Context Probing (read-only)

Goal: determine framework + version, CSS approach, and design tokens so the
deliverables (especially the style interface contract) are tailored to the
user's stack. Probing never writes to the user's project.

## Sources

- Project root: user-provided path, else the current working directory.
- Read files only. No directories are created, no files are modified.

## Signals & confidence

| Target | Signals | Confidence |
|---|---|---|
| Framework + version | package.json deps; vite/nuxt/svelte.config; file extensions (.vue / .svelte / .tsx) | High |
| CSS approach | deps (stylex / tailwind / unocss / vanilla-extract / …); build plugins; source scan (`@theme`, `@apply`, `stylex.create`) | Medium-high |
| Design tokens | DESIGN.md; `:root {}` CSS vars; Tailwind v4 `@theme`; stylex tokens; tokens.js / tokens.json | Medium-high |
| Existing conventions | read 1–2 representative existing components: className vs style prop passthrough, naming | Reference |

## Ask the user only in two cases

1. **Ambiguity** — multiple candidates (e.g. Tailwind + CSS Modules coexisting;
   monorepo with several frameworks). Ask a *confirm-style* question with the
   detected results pre-filled: "Detected X and Y — new components use which?"
2. **Blind spot** — wrong path, empty project, project not local, nothing
   detectable. Ask one line: framework + CSS approach + token location.

## Usage rules

- Probe results are judgment input for this session only — not stored, not remembered.
- Framework **version precision matters**: Svelte 4 vs 5 (runes), Solid 1 vs 2,
  Vue 3.x — the wrong version can produce uncompilable code.
- The style interface contract must match the CSS approach:
  Tailwind → className passthrough; StyleX → style props.
