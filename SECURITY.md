# Security Policy

## Supported Versions

Only the currently deployed site, built from `main` and published to
https://libredevops.org, receives security updates.

Tags in this repository are historical markers rather than supported releases.
There is no backport process: fixes land on `main` and reach the live site on
the next deployment.

## Scope

This repository builds libredevops.org — a Next.js site exported as static
files and served by GitHub Pages. There is no backend, no accounts and no
server-side request handling, so anything requiring a server-side flaw does not
apply here.

In scope:

- The application source: `app/`, `components/`, `lib/`, `mdx-components.tsx`
  and `theme.config.tsx`.
- Build configuration that affects what ships: `next.config.mjs`, and the
  `patches/` applied by `patch-package` at install time.
- The workflows in `.github/workflows/`, including their permissions and any
  path that would let an untrusted input publish to the live site.
- Dependency issues that reach the built output and do not already have a
  public advisory.
- The deployed site at https://libredevops.org.

Out of scope:

- Typos, broken links, inaccurate or outdated guidance in the documentation
  content. These are correctness bugs — raise a normal issue.
- Vulnerabilities in third-party dependencies that already carry a public
  advisory. Dependabot tracks those automatically, so a report adds nothing.
- Findings that depend on a server-side behaviour this site does not have, or
  on missing headers that GitHub Pages does not let us set.
- Reports produced by running a scanner against the live site with no
  demonstrated impact.

## Reporting a Vulnerability

Report privately using GitHub's private vulnerability reporting:

**https://github.com/libre-devops/libredevops-dot-org/security/advisories/new**

Do **not** open a public issue for an undisclosed vulnerability.

Please include:

- The affected component and, where relevant, the commit or deployment date.
- Reproduction steps.
- The impact you believe it has.
- Any suggested remediation, if you have one.

## What to Expect

- Acknowledgement of receipt within **3 business days**.
- An initial triage decision within **7 business days**.

If the report is accepted, we will develop a fix and coordinate disclosure
timing with you once a patch or mitigation is deployed. If it is declined, we
will tell you why — for example not reproducible, out of scope as described
above, or already publicly known.

Please hold off on public disclosure until remediation is complete. This is a
volunteer-maintained project, so please be reasonable about timelines.

Published advisories:
**https://github.com/libre-devops/libredevops-dot-org/security/advisories**
