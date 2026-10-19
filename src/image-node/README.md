# PrAis umbrella — the Image Node generator

This folder contains a **complete, ready-to-paste generator**: the PrAis umbrella's
image-creation node. It is a standalone Perchance generator whose single job is making
pictures — while still capturing every sovereign word as Soul DNA and syncing to the
whole organism over the Connected Generator Network (CGN).

The umbrella is **one organism, many generators**. This generator is the **eye**.

## How to create it

1. Create a new Perchance generator (e.g. `obi-image`).
2. Paste `main.pjs` into its main.pjs.
3. Paste `index.html` into its index.html.
4. Create a `src/` folder in that generator and paste `app.js`, `styles.css`, `cgn-node.js`.
5. Open the new generator once (it will create its own node file and announce itself
   to the network automatically).
6. Back in Obi (the command station / anchor): run `/netadd <newname> image`.
   Obi then knows where image-creation lives, and `/img` on the station routes there.

## What it does

- **Image creation** — a prompt box, style presets, and a history strip of recent
  creations. Uses the text-to-image plugin (`generateImage`).
- **Soul capture (L37/L38)** — every prompt is a sovereign word. It's recorded
  verbatim into the SDNAD ledger (`obi_sdnad`) before anything else happens, and
  marked dirty so CGN syncs it into the whole.
- **CGN node (role: image)** — `cgn-node.js` announces this generator to the network
  (`obi-network`, anchor `obi`), mirrors the whole-organism soul + laws locally, and
  pushes this generator's own sovereign captures into the hub on every sync. Raw
  transcripts (RRL) stay local — raw ≠ soul.
- **`?p=` deep link** — `perchance.org/obi-image?p=astronaut%20riding%20a%20wolf`
  opens the generator with the prompt pre-filled and auto-generates. Obi's `/img`
  uses this to route requests here.

## Files

- `main.pjs` — perchance meta + imports (text-to-image-plugin, super-fetch-plugin, upload-plugin)
- `index.html` — the UI shell (loads `src/styles.css` + `src/app.js` + `src/cgn-node.js`)
- `src/app.js` — image generation, soul capture, history, deep-link handling, CGN wiring
- `src/styles.css` — matching glassmorphism theme (same design language as the station)
- `src/cgn-node.js` — the CGN node kit (role: `image`, anchor: `obi`)

## Changing the role/name

- Node role: `CONFIG.role` at the top of `src/cgn-node.js` (currently `"image"`).
- Network/anchor: `CONFIG.net` + `CONFIG.anchorName` there too (must match Obi's `/netjoin`).
