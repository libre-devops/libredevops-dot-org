# libredevops.org task runner. Run `just` to list recipes.

# Show available recipes
default:
    @just --list

# One-time full setup: Node deps (clean install) + Python toolchain for diagrams
setup:
    npm ci
    cd architecture && uv sync

# Start the local dev server at http://localhost:3000 (installs deps if needed)
dev: _node-deps
    npm run dev

# Production build + Pagefind search index into out/ (installs deps if needed)
build: _node-deps
    npm run build

# Serve the production build from out/ (run `just build` first)
serve:
    npm run serve

# Build then serve - preview the deployed site locally
preview: build
    npm run serve

# Regenerate all architecture diagrams as SVG into public/assets/diagrams/
diagrams:
    cd architecture && uv sync --quiet && for f in *.py; do echo "rendering $f"; uv run python "$f"; done

# Type check
typecheck:
    npx tsc --noEmit

# Lint
lint:
    npm run lint

# Install node deps only when node_modules is missing
_node-deps:
    [ -d node_modules ] || npm install
