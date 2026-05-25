# libredevops.org

Source for [libredevops.org](https://libredevops.org) — a platform engineering portfolio and documentation site covering DevOps, Azure, Terraform, and security engineering.

[![Build and Deploy](https://github.com/libre-devops/libredevops-dot-org/actions/workflows/nextjs.yml/badge.svg?branch=main)](https://github.com/libre-devops/libredevops-dot-org/actions/workflows/nextjs.yml)
[![CodeQL](https://github.com/libre-devops/libredevops-dot-org/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/libre-devops/libredevops-dot-org/actions/workflows/codeql.yml)
[![Last deployment](https://img.shields.io/github/deployments/libre-devops/libredevops-dot-org/github-pages?label=last%20deployment&logo=github)](https://github.com/libre-devops/libredevops-dot-org/deployments/github-pages)
[![Live site](https://img.shields.io/website?url=https%3A%2F%2Flibredevops.org&label=libredevops.org)](https://libredevops.org)

## Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, static export) |
| Docs | [Nextra 4](https://nextra.site) with `nextra-theme-docs` |
| Styling | Plain CSS with design tokens, no framework |
| Hosting | GitHub Pages via GitHub Actions |
| Theme | Dark/light via `next-themes` |
| Icons | [Lucide React](https://lucide.dev) |

## Project structure

```
app/                  # Next.js App Router pages
  about/              # About page
  docs/               # Docs layout + catch-all route
  projects/           # Projects page
  globals.css         # All styles (design tokens, components)
  layout.tsx          # Root layout (Navbar, ThemeProvider)
  page.tsx            # Homepage / hero

components/           # Shared React components
  hero-logo.tsx       # Theme-aware logo (swaps light/dark image)
  navbar.tsx          # Site header
  social-links.tsx    # Social icon strip (config-driven)
  theme-toggle.tsx    # Dark/light toggle button

content/docs/         # MDX content rendered by Nextra
  cheatsheets/        # Cheatsheets (Terraform, etc.)

lib/
  site.ts             # Site config + social links definition

public/assets/        # Logos and favicon
patches/              # patch-package patches (nextra-theme-docs Zod fix)
```

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # static export → out/
npm run lint    # ESLint
npx tsc --noEmit  # type check
```

## Adding content

**New doc page** — add an `.mdx` file under `content/docs/`. Update the relevant `_meta.ts` to control sidebar ordering and labels.

**New social link** — add an entry to the `socialLinks` array in `lib/site.ts` and map its icon key in `components/social-links.tsx`.

**New project** — add an entry to the `projects` array in `app/projects/page.tsx`.

## Contributing

Issues and pull requests are welcome. Use the [docs change request template](https://github.com/libre-devops/libredevops-dot-org/issues/new?template=docs_change_request.md&title=%5BDocs%5D%3A+) for documentation corrections.

## License

MIT
