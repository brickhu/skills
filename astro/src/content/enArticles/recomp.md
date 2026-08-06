---
title: "Great component libraries are \"recipes\" — don't let React's kitchen lock them down: recomp, translate component docs into your framework"
description: 'Paste a component library docs URL — get a headless component adapted to your framework. Behavior replicated, styles stay yours, copy and use.'
pubDate: 2026-08-05
lang: en
slug: recomp
author: Fei
skill_name: recomp
install: 'npx skills add brickhu/skills/recomp'
original: true
tags: ['recomp', 'component replication', 'headless']
source: docs/wechat-recomp.md
---

## Why can't you use any of today's component libraries?

It's not that they're bad — shadcn/ui, Radix, MUI, Ant Design, each more polished than the last. The problem is the word "usable."

It's 23:47. You're building a date picker for your app. You find shadcn/ui's DatePicker — it's stunning, and its interaction patterns mostly fit your requirements. You spend hours studying the install guide and read the docs cover to cover. But one fundamental problem never goes away: **wrong framework**. It only supports React, and your project is SolidJS.

In truth, when we adopt third-party component libraries, we almost always run into the same few problems:

- **Framework mismatch**: JSX, hooks, controlled components — copy-paste straight into your project and it explodes. The most polished libraries are almost all written in React, while you're on SolidJS / Vue / Svelte
- **Style mismatch**: the library is written in Tailwind, your project uses StyleX / CSS-in-JS — class names everywhere, nothing fits
- **Design mismatch**: the library ships its own design tokens that fight your design system; rewriting them is more work than writing the component

This is the common plight of the frontend developer: we reach for other people's wheels to free up our productivity, but not every wheel (component) fits your chassis (framework) — so you comfort yourself with "I'll write it myself later."

## Component libraries are "finished dishes" — what you need is the "recipe"

A component library is a finished dish — React implementation, styles, design tokens, all served neatly to you, seemingly ready to eat by copy-paste.

But only if **your kitchen (framework) and taste (style system) happen to match the restaurant's**. Your kitchen is Vue / Solid / Svelte, your taste is StyleX / your own design tokens — so no matter how good the dish is, you can't eat it.

What you actually need is not the dish — it's the **recipe**:

- Dropdowns: how arrow keys select, Enter confirms, Escape closes
- Dialogs: how focus is locked, scroll is locked, and how close events let you inject callbacks?
- Accessibility: what screen readers announce, which node the ARIA role goes on

**These interaction logic and patterns have nothing to do with framework or styles.** What you want to save is the time spent on component patterns.

| Recipe (behavior contract) | Your kitchen (your framework) | Plating (your styles) |
|---|---|---|
| State, keyboard, focus, ARIA | Svelte 5 runes / Vue v-model / Solid signals | Design tokens, StyleX, Tailwind |

Recipes shouldn't be locked to the kitchen they were written in. All you need is to **translate** the recipe for your own kitchen.

## recomp — reverse-engineer the recipe from the finished dish

`recomp` is an open-source AI skill. Once installed, your AI coding assistant becomes your **component-replication contractor**: send a component library docs URL, and it delivers four things:

1. **Behavior contract summary** — the interface, the behavior, plus open questions the docs don't answer that you need to decide on — review before it starts
2. **Headless component source** — behavior only, zero styles, written in your framework's idioms: `v-model` for Vue, `bind:`/runes for Svelte 5, signals for Solid — not JSX with the names changed
3. **Usage notes + dependency list** — copy and use
4. **Style interface contract** — the full data-attribute set, class slots, CSS variables, ready to wire into your design tokens

**Styles and design tokens stay entirely yours.** It delivers the behavior layer; how it's "plated" is your design system's call.

One more advantage no component library gives you: **no installation.** Libraries go into node_modules via `npm install`, dragging along a dependency tree and upgrade duties; recomp delivers plain source code — copy it into your component directory and it's YOUR code. No dependencies, no node_modules, no chasing upstream versions. You get a recipe, not someone else's whole kitchen moved into your house.

## Install and usage: a complete walkthrough

**Install (either way):**

```sh
# Option 1: one-liner (recommended) — /recomp in the path is the skill name
npx skills add brickhu/skills/recomp
```

Or copy manually into your AI assistant's skills directory (Claude Code, Cursor, Zed all work):

```sh
git clone https://github.com/brickhu/skills.git
cp -r skills/recomp ~/.agents/skills/recomp
```

**Example: replicating shadcn/ui's Dialog for a Svelte 5 project, end to end:**

Copy the Dialog docs URL, open your AI coding assistant (Claude Code, Codex, Cursor, Zed), start a new conversation and send:

```text
recomp https://ui.shadcn.com/docs/components/dialog, project at ~/my-app (Svelte 5)

# If your conversation is already inside the project directory, just send:
recomp https://ui.shadcn.com/docs/components/dialog
```

It replies with a behavior contract summary:

```text
✅ Validated: shadcn/ui Dialog component docs
---
API: open (is it open?) / onOpenChange (state change callback) → Svelte 5: bind:open
Documented behavior: Esc closes · clicking the overlay closes · scroll is locked while open
Dependencies: none, plain native implementation
---
2 behaviors are not specified in the docs — your call:

Item 1/2: where does keyboard focus go after the dialog closes?
Suggestion: back to the button that opened it (the accessibility-standard approach)
Reply yes / 确认 to accept, or type your own solution
```

Reply yes — it asks item 2 (whether focus stays trapped inside the dialog), reply yes again — all open questions are settled and it delivers the complete source files (excerpt):

```tsx
// src/Button.tsx (excerpt)
import { splitProps, type JSX } from "solid-js";

type Props = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function Button(props: Props) {
  const [local, rest] = splitProps(props, ["disabled", "loading", "onClick", "children"]);

  return (
    <button
      {...rest}
      disabled={local.disabled || local.loading}
      data-state={local.loading ? "loading" : "idle"}
      aria-busy={local.loading}
      onClick={(e) => {
        if (local.disabled || local.loading) return;
        local.onClick?.(e);
      }}
    >
      {local.loading && <span aria-hidden="true">…</span>}
      {local.children}
    </button>
  );
}
```

Plus a usage example:

```tsx
import { createSignal } from "solid-js";
import { Button } from "./src/Button";

function App() {
  const [loading, setLoading] = createSignal(false);

  return (
    <Button
      loading={loading()}
      class="submit" // class is the style entry — wire your design tokens
      onClick={() => {
        setLoading(true);
        submit();
      }}
    >
      Submit
    </Button>
  );
}
```

Copy the source, wire up your styles, done. Not happy with a behavior? Just say so — "the escape handling is wrong" or "use `bind:` instead of `v-model`" — it re-emits the complete files, no patches.

## Worried: is an AI-replicated component trustworthy?

Every step where replication tends to go wrong is guarded in advance:

- **Not a component library page? Refused.** Blogs, utility libraries, design files — it declines with a reason instead of guessing its way through
- **Accessibility semantics are never guessed.** ARIA roles, focus management, keyboard behavior — either filled from the WAI-ARIA APG pattern (each source annotated) or explicitly marked "not implemented" — honest gaps beat fake compliance
- **Never touches your project.** Probing your framework, CSS approach and design tokens is read-only: no directories created, no files modified, results used only for the current component
- **Clean license boundary.** It replicates interfaces and behavior, not someone else's source or style values; the source is recorded, safe for commercial use

One limitation to be clear about: recomp delivers **unstyled headless component source**, not a finished component package — after you get the code, styling is yours to do. That limitation comes from recomp's underlying philosophy: **patterns can be universal, but design must be personal.**

In one sentence: **the AI does the replication; interface, behavior and boundaries all stay in your hands.**

## Finally: a new way to consume components

From "finished dish" packaging to "recipe replication" — for frontend developers this is a paradigm upgrade. Your kitchen deserves its own recipes!

recomp is open source (MIT) and works with any AI assistant that loads SKILL.md (Claude Code, Codex, Cursor, Zed) — use it, modify it, share it.

📦 Repository: **https://github.com/brickhu/skills**
📖 English & Chinese guides are in the repo (README.md / README_cn.md)

Star it, file issues, and share the components you've replicated.
