# agents.md: Pop

Instructions for any AI agent working in this repo. Read fully before changing code.

## Project
Pop is a todo app. Each task has a balloon checkbox. Pressing it fills the row
with water, then pops it (droplets, latex shards, air bubbles) and removes the task.

## Stack (do not add to it without asking)
- Plain HTML, CSS, vanilla JS. No frameworks, no build step, no dependencies.
- Hosted on Netlify. Source on a public GitHub repo.

## Structure
- `public/index.html`  markup only
- `public/style.css`   all styling, design tokens live in `:root`
- `public/app.js`      state, rendering, storage, burst effect
- `netlify.toml`       publish directory config
- `agents.md`          this file

## Design rules
- Palette tokens: --bg, --surface, --ink, --muted, --water, --water-soft, --pop, --line. Never hardcode new colours.
- Fonts: Bricolage Grotesque (display), Figtree (body).
- Must work from 320px wide to desktop, portrait and landscape.
- Tap targets at least 44px. Visible keyboard focus. Respect prefers-reduced-motion.
- Dark mode follows the system setting.

## Behaviour rules
- Tasks, next id and popped count persist in localStorage under `pop.v1`. Always wrap storage in try/catch.
- Render task text with textContent, never innerHTML.
- The pop sequence: inflate 0.75s, burst on canvas, collapse row, then remove from state.

## Workflow
1. Make the smallest change that does the job.
2. Test locally: `python3 -m http.server 8000 --directory public`
3. Check at 320px, 768px and 1280px widths.
4. Commit with a clear message, then push to `main`.
5. Deploy: `netlify deploy --prod`

## Definition of done
Works on phone and desktop, no console errors, committed, pushed, deployed.
