# shadcn primitives (adds to ../../../CLAUDE.md — does not override it)

These are generated shadcn components (new-york style, lucide icons). They consume
the theme tokens from `src/app/globals.css` and inherit the Roomba brand
automatically.

- **Generated zone — don't hand-restyle.** Don't inject brand colors or hardcode
  hex here. If a primitive needs brand-specific behavior, do it at the call site
  or in `src/components/` (e.g. `instrument/`), not by editing the primitive.
- **Regeneration-safe.** Keep edits minimal so re-running `npx shadcn@latest add`
  doesn't clobber design decisions. Net-new primitives are added via the CLI.
- Composition uses Radix `asChild` (not a `render` prop). Example:
  `<Button asChild><Link href="…">…</Link></Button>`.
