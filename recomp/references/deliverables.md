# Deliverables

Per-component deliverables, presented in conversation in this order:

1. Validation result — one line
2. Behavior contract summary
3. Source files
4. Usage instructions
5. Style interface contract
6. (optional) Acceptance script

## Behavior contract summary template

- **Component**: name, source URL, fetch date
- **Interface**: props / events / slots; controlled/uncontrolled pattern in the
  target framework (see idiom mapping below)
- **Behavior**: states, keyboard interaction, focus management, ARIA, edge cases
- **Decisions**: A / B / C table (below)
- **Dependencies**: name + version + known conflicts in the user's project

## Decision classification

| Class | Source | Handling |
|---|---|---|
| A | explicit in docs | implement as documented (cite) |
| B | missing in docs; WAI-ARIA APG has a standard pattern | implement per APG; annotate "filled from APG <pattern>" |
| C | not in docs, not in APG, not inferable | **do not guess** — tell the user; offer: user defines behavior / find a reference implementation / skip |

Never guess ARIA roles, focus management, or keyboard semantics — those are
B or C, never invented.

## Framework idiom mapping (interface layer)

Translating from React docs is a refactor of the *controlled pattern*, not a rename:

| React | Vue | Svelte 5 | Solid |
|---|---|---|---|
| `open` + `onOpenChange` | `v-model:open` | `bind:open` (+ `onOpenChange` event) | signal prop + `onOpenChange` callback |

Show this mapping explicitly in the summary so the user reviews semantics,
not prop names.

## Source files

- One code block per file with a filename header (`src/Dialog.tsx`, `src/index.ts`, …)
- Always output **complete files**, never patches or diffs (unless the user
  explicitly asks for a diff)
- List npm dependencies with versions; check against the user's existing deps
  for conflicts (e.g. floating-ui, date-fns, TanStack Virtual)

## Style interface contract

- DOM structure / class slot inventory
- State hooks: full data-attribute set + animation phases
  (mounting / transitioning / closed)
- CSS custom properties: component-level vars, marked with which global tokens
  they should reference
- Optional: token-driven neutral reference styles (defaults only; user owns
  final values)
- Written for the probed CSS approach (className passthrough vs style props)

## Acceptance script (optional)

Playwright spec covering: keyboard sequence, focus order / trap, ARIA snapshot
(getByRole / axe checks). The user copies it into their project and runs it;
passing = the assertion list passes. State clearly which behaviors it covers
and which require a manual screen-reader pass (complex components).
