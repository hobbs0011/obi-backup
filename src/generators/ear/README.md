# role: ear — "the listener"

**Mandate.** A disposable device left in the room. The station already transcribes recordings of any
length (`src/transcribe.js` + `src/audio-split.js`: pause-split into parts, part-level retry/resume,
stitched back into one timeline, raw saved). The ear node exists so that the *in-room* device does not
have to be the station — start it on a phone, walk away, and the class is captured.

**What it is not.** Not a meeting recorder, not a live-caption toy. The output is the same artefact
the station produces: one verbatim transcript, in one timeline, with a raw byte-faithful record — and
a pointer to the audio it came from, because a transcript without its source is not evidence.

## Interface

| command | what it does |
|---|---|
| `/listen <url or file>` | begin a long capture (file picker, drop, paste, or a URL) |
| `/stop` | stop early and stitch what exists (partial is saved honestly, never silently) |
| `/state` | what is running: part n of m, bytes heard, failures, elapsed |
| `/transcripts` | the node's local archive (read / export / send to the station) |
| `?rec=<media url>` | deep link: open and start listening immediately |

## What it reports to the station

- the transcript (or a pointer to it) with its `tr-…` id, duration, part count and any failed parts
- the deep-link it came from, so anyone can re-listen to the minute a quote came from
- **nothing else.** No summary, no judgement — the station and the writeup layer do that, from the raw.

## Build steps

1. Create the generator (suggest `obi-ear`).
2. Paste `main.pjs`; add `index.html` (a one-screen shell: a big record button, the live part log,
   the archive list), `styles.css`, and `app.js` = a thin shell over the station's ear
   (`src/transcribe.js` + `src/audio-split.js` copied in verbatim — they are already self-contained).
3. `cgn-node.js` with `CONFIG.role = "ear"`.
4. The Deepgram key: on the perchance host it lives in this browser's `obi_keys`; on the self-hosted
   Cloudflare build it belongs in a Worker secret (`DEEPGRAM_API_KEY`) so it is never in the page.
5. Open it once, then `/netadd <name> ear` on the station.

## Done when

- [ ] a 60-minute recording transcribes end to end, with parts visible and failures named
- [ ] a network drop mid-recording loses one part, not the session (resume works)
- [ ] the raw audio reference travels with the transcript
- [ ] the station can pull the transcript into its archive and write a summary from it
- [ ] the key is nowhere in the page or in localStorage on the self-hosted build
