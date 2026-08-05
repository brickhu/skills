# Deliverables

## Two phases

1. **Before replicating (confirmation gate)** — validation result + behavior
   contract summary. The user replies 【确认】 before any code is generated.
2. **After confirmation (delivery)** — present in user-priority order, lean:

   1. Opening line + **source code** (top priority)
   2. **Usage** — minimal working example + API summary
   3. **Interface standard** — props/events/slots/types + style interface contract
   4. (optional, last) acceptance script

Open every delivery with:

> ✅ 组件已复刻成功，复制以下组件代码到你的项目目录即可使用。

Do not repeat the behavior contract summary in the delivery.

## Confirmation gate (phase 1)

Behavior contract summary template:

- **Component**: name, source URL, fetch date
- **Interface**: props / events / slots; controlled/uncontrolled pattern in the
  target framework (see idiom mapping below)
- **Behavior**: states, keyboard interaction, focus management, ARIA, edge cases
- **Decisions**: A / B / C table (below)
- **Dependencies**: name + version + known conflicts in the user's project

End the summary with the confirmation prompt echoing the detected stack:

> 回复【确认】复刻成 <framework> + <css approach> 技术栈的组件源码和使用示范

## Decision classification

| Class | Source | Handling |
|---|---|---|
| A | explicit in docs | implement as documented (cite) |
| B | missing in docs; WAI-ARIA APG has a standard pattern | implement per APG; annotate "filled from APG <pattern>" |
| B2 | missing in docs; an ecosystem headless library (Kobalte / Reka UI / Bits UI) implements the same component | learn from it as a reference; annotate "referenced from <library> <component>" — still deliver the code |
| C | not in docs, not in APG, no ecosystem reference | **do not guess** — tell the user; offer: user defines behavior / find a reference implementation / skip |

An ecosystem headless library is a *reference source*, never a replacement:
even when one exists, deliver the replicated code and usage guide for the user
to copy into their own component directory.

Never guess ARIA roles, focus management, or keyboard semantics — those are
B or C, never invented.

## Framework idiom mapping (interface layer)

Translating from React docs is a refactor of the *controlled pattern*, not a rename:

| React | Vue | Svelte 5 | Solid |
|---|---|---|---|
| `open` + `onOpenChange` | `v-model:open` | `bind:open` (+ `onOpenChange` event) | signal prop + `onOpenChange` callback |

Show this mapping explicitly in the confirmation gate summary so the user
reviews semantics, not prop names.

## Source code (delivery, #1)

- One code block per file with a filename header (`src/Dialog.tsx`, `src/index.ts`, …)
- Always output **complete files**, never patches or diffs (unless the user
  explicitly asks for a diff)
- List npm dependencies with versions; check against the user's existing deps
  for conflicts (e.g. floating-ui, date-fns, TanStack Virtual)

## Usage (delivery, #2)

- A minimal working example that compiles and demonstrates the main use case
- API summary: the props/events/slots a user will actually touch

## Interface standard (delivery, #3)

- Full props / events / slots / types
- Style interface contract: DOM structure / class slot inventory; state hooks
  (data-attribute set + animation phases); CSS custom properties marked with
  which global tokens they should reference; token-driven neutral reference
  styles (defaults only, user owns final values)
- Written for the probed CSS approach (className passthrough vs style props)

## Acceptance script (optional, last)

Playwright spec covering: keyboard sequence, focus order / trap, ARIA snapshot
(getByRole / axe checks). The user copies it into their project and runs it;
passing = the assertion list passes. State clearly which behaviors it covers
and which require a manual screen-reader pass (complex components).
