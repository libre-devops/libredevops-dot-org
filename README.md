# libredevops.org

Source for [libredevops.org](https://libredevops.org) - a platform engineering portfolio and documentation site covering DevOps, Azure, Terraform, and security engineering.

[![Build and Deploy](https://github.com/libre-devops/libredevops-dot-org/actions/workflows/nextjs.yml/badge.svg?branch=main)](https://github.com/libre-devops/libredevops-dot-org/actions/workflows/nextjs.yml)
[![CodeQL](https://github.com/libre-devops/libredevops-dot-org/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/libre-devops/libredevops-dot-org/actions/workflows/codeql.yml)
[![Last deployment](https://img.shields.io/github/deployments/libre-devops/libredevops-dot-org/github-pages?label=last%20deployment&logo=github)](https://github.com/libre-devops/libredevops-dot-org/deployments/github-pages)
[![Live site](https://img.shields.io/website?url=https%3A%2F%2Flibredevops.org&label=libredevops.org)](https://libredevops.org)

## Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, static export) |
| Docs | [Nextra 4.6](https://nextra.site) with `nextra-theme-docs` |
| Styling | Plain CSS with design tokens, no framework |
| Search | [Pagefind](https://pagefind.app) (static full-text, built at deploy time) |
| Hosting | GitHub Pages via GitHub Actions |
| Theme | Dark/light via `next-themes` |
| Icons | [Lucide React](https://lucide.dev), [Devicon](https://devicon.dev) |

## Project structure

```
app/                        # Next.js App Router pages
  about/                    # About page
  docs/
    layout.tsx              # Nextra docs layout (navbar, footer, theme)
    [[...mdxPath]]/         # Catch-all MDX route
  projects/                 # Projects page
  globals.css               # All styles (design tokens, components, Nextra overrides)
  layout.tsx                # Root layout (site header, ThemeProvider, Pagefind init)
  page.tsx                  # Homepage / hero

components/                 # Shared React components
  azure-naming-data.ts      # Azure naming convention data
  azure-naming-table.tsx    # Filterable Azure naming convention table
  cheatsheet-grid.tsx       # Filterable cheatsheet index grid (client component)
  code-block.tsx            # Syntax-highlighted code block with copy button
  docs-change-button.tsx    # "Request a change" button in docs footer
  docs-logo.tsx             # Nextra navbar logo (unused - logo removed from navbar)
  hero-logo.tsx             # Theme-aware hero logo (swaps light/dark SVG)
  navbar-toggle.tsx         # Toggle to hide/show site header in docs reading mode
  navbar.tsx                # Site header with nav links and social icons
  print-button.tsx          # Print/export-to-PDF button for cheatsheets
  scroll-nav.tsx            # Floating scroll-to-top/section helper on long pages
  social-links.tsx          # Social icon strip (config-driven)
  standards-band.tsx        # Homepage band; auto-discovers *-standards docs
  terminal.tsx              # Animated terminal component used on the homepage
  theme-toggle.tsx          # Dark/light toggle button

content/docs/               # MDX content rendered by Nextra
  cheatsheets/              # 20 cheatsheets: AI, Ansible, AWS, Azure, Azure DevOps,
                            # Bash, Containers, .NET, Git, GitHub Actions, Go, KQL,
                            # Linux, Nginx, PowerShell, Python, Security, Terraform,
                            # TypeScript, Windows
  documents/                # Reference docs: Azure naming convention, plus the
                            # Libre DevOps standards (Terraform, PowerShell, Bash,
                            # Python, Azure Logic Apps)

lib/
  site.ts                   # Site config and social links definition

patches/                    # patch-package patches applied after npm install
  nextra-theme-docs+4.6.1.patch
                            # 1. Makes Layout children prop optional (Zod schema fix)
                            # 2. Shows search bar on mobile (removes x:max-md:hidden)

public/assets/              # Logos and favicon
```

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build          # static export to out/
npm run build:search   # build + index with Pagefind (required for search to work)
npm run lint           # ESLint
npx tsc --noEmit       # type check
```

> Search only works after `build:search`. Running `npm run dev` alone will not have a working search index.

## Adding content

**New cheatsheet** - add an `.mdx` file under `content/docs/cheatsheets/`, update `content/docs/cheatsheets/_meta.ts` for sidebar ordering, and add an entry to the `CHEATSHEETS` array in `components/cheatsheet-grid.tsx` so it appears on the index page.

**New doc page** - add an `.mdx` file under `content/docs/`. Update the relevant `_meta.ts` to control sidebar ordering and labels.

**New standard** - add an `.mdx` file named `<topic>-standards.mdx` under `content/docs/documents/` with a `title` frontmatter (e.g. `title: Ansible Standards`). The homepage Standards band (`components/standards-band.tsx`) discovers `*-standards.mdx` files at build time, derives the pill label from the title, and renders them in alphabetical order - no code change needed. Add a matching card to the `projects` array in `app/projects/page.tsx` so it also appears on the Projects page.

**New social link** - add an entry to the `socialLinks` array in `lib/site.ts` and map its icon key in `components/social-links.tsx`.

**New project** - add an entry to the `projects` array in `app/projects/page.tsx`.

## Nextra patches

`patches/nextra-theme-docs+4.6.1.patch` is applied automatically by `patch-package` as a `postinstall` hook. It makes two changes to the compiled Nextra output:

1. `schemas.js` - marks the `children` prop as optional to allow the docs layout to render without a page body (fixes a Zod validation error).
2. `navbar/index.client.js` - changes the search wrapper class from `x:max-md:hidden` to `x:flex-1` so the search bar is visible on mobile as well as desktop.

If you upgrade Nextra, re-apply and regenerate the patch with `npx patch-package nextra-theme-docs`.

## Contributing

Issues and pull requests are welcome. Use the [docs change request template](https://github.com/libre-devops/libredevops-dot-org/issues/new?template=docs_change_request.md&title=%5BDocs%5D%3A+) for documentation corrections.

## License

MIT
