# Kartik Manral — portfolio

A static site with no build step. Three.js, GSAP + ScrollTrigger and Lenis are vendored in `vendor/`, so it runs offline and deploys to any static host (GitHub Pages, Netlify, Vercel).

## Run it

```bash
python3 -m http.server 5178
```

Open http://127.0.0.1:5178. It has to be served over HTTP, because ES modules don't load from `file://`.

## Where things live

| File | What it does |
| --- | --- |
| `js/data.js` | All copy: projects, stats, stack, hackathon record, contact links. Edit content here only. |
| `js/views.js` | HTML templates for the home page, the case-study pages and the 404 page |
| `js/main.js` | Hash router, curtain page transitions, loader, Lenis smooth scroll, every ScrollTrigger animation |
| `js/shelf.js` | The hero bookshelf. Six books stand on the line above the intro. What I build, Calisthenics and Unwritten open when clicked: each one flies off the shelf and swings open into a two-page spread. Self-improvement, Business and Philosophy are decoration only (`closed: true` in `js/data.js`). The page content comes from `shelf`, `training` and `goals` in `js/data.js`. |
| `js/pages.js` | Hero background: loose book pages drift slowly down behind the portrait at different depths, swaying and turning over. The cursor acts as a breeze. Plain 2D canvas, paused when the hero is out of view. |
| `js/visuals.js` | Live canvas visual for each project (control chart, three-chain loop, agent graph, lecture timeline) |
| `js/cursor.js` | Custom cursor, its hover labels and magnetic buttons |
| `css/style.css` | Design tokens at the top, then one block per section, then breakpoints |
| `js/portrait.js` | Draws the hero portrait on its own canvas, layered in front of the field and the name. A shader keeps its natural colour and adds a sage rim light that follows the cursor. |
| `assets/portrait.webp` | The hero portrait with a transparent background (1400×1260) |

To swap the photo, export a new transparent image at the same 1400×1260 size and save it as `assets/portrait.webp`. If you change the size, update `uTexel` and `PORTRAIT_ASPECT` in `js/portrait.js`.

Routes: `#/` for home and `#/work/<slug>` for a case study (`lien`, `flux`, `planner`, `tollgate`).

## Before you publish

- The bookshelf has placeholders (shown in grey italics) in `training` and `goals` in `js/data.js`. Replace them with your real calisthenics skills and goals, and delete `todo: true` from each one you fill in.
- Add `site.linkedin` and `site.resume` URLs. Their buttons only appear once these are set (the same goes for `site.twitter` and `site.discord`, which are already filled in).
- Check every number and status against your repos. They came from your project READMEs and notes as of 22 Nov 2026:
  - Flux AUC 0.95 vs 0.43, 7/8 alerts, 242 checks
  - Lien 75 tests, 97% coverage, 2–3 s loop, 0/30 races
  - Planner 45 + 10 tests
  - Tollgate "400+" tests (a static count of test cases; run `pnpm test` for the exact number) and npm v0.3
- Update the hackathon record when results come out. Nothing on the site claims a win.
- Planner is described as a re-architecture of an open-source project. Keep that wording.
