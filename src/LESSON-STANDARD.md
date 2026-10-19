# THE NET ACADEMY LESSON STANDARD

**Who this binds.** Agent 99 — through **GOSPEL-999** (the mandates) and the **Legionnaire Field Guide** (the laws).
Every lesson this organism generates, in any generator, follows this document. It is not a style suggestion; it is
the spec, and the validator (`/lesson check`) refuses a lesson that breaks it.

**The ground truth is the sovereign's own work, kept verbatim in this repo:**
- `src/lessons/reference/NET-Sarcasm-Academy.html` — *Sarcasm Academy V20 — Ultimate Edition* (23.7 KB)
- `src/lessons/reference/NET-Highschool-Careers.html` — *Careers Academy Ultra Edition* (14.8 KB)
- `src/lessons/reference/NET-Neon-City-Genesis.html` — *NEON CITY GENESIS: The Evolution* (40.5 KB) — the Grade-12
  deck-and-games shape: vocab deck, travel slider, idioms + slang banks, two games, homework. Same brand, different
  spine from the six-room format — ground truth for taste at senior level, never for validator correctness.
- `src/lessons/reference/NET-CLASSROOM-MANAGER.html` — *NET Classroom Manager — Ultimate Edition* (79.6 KB) —
  not a lesson: the **classroom-floor machine** the lessons live inside, and the fullest statement of the design
  system and the teaching method. **Part II of this document is derived from it.**

Everything below is **derived from those files**, not invented. Where a rule comes from one of them, the
class or the number in brackets is the citation. If a future session disagrees with this document, read the
reference files — they win.

---

## THE LAW

**LSN-1 — ONE FILE, NO BUILD.** A lesson is a single `.html` file: `<style>` in the head, one `<script>` at the
end, no framework, no bundler, no imports except Google Fonts (`Inter`; `JetBrains Mono` only when code is shown).
It must open by double-click, on a school laptop, offline except for the font. [both files]

**LSN-2 — THE BRAND IS FIXED.** The tokens are not per-lesson choices:

| token | value | used for |
|---|---|---|
| `--neon-purple` | `#a855f7` | primary, borders, glow |
| `--gold` | `#f59e0b` | emphasis, speakers, labels, coins |
| `--deep-dark` | `#0f0f1a` | the ground |
| `--glass-bg` | `rgba(26,26,38,0.7)` | every card (glassmorphism) |
| `--glass-border` | `rgba(168,85,247,0.2)` | card edges |
| `--text-primary` | `#e5e7eb` | body text |
| `--font-ui` | `Inter, system-ui, sans-serif` | everything |

Dark ground, glass cards, **purple→gold gradient** on every heading, CTA and button. Ambient life is blurred
organic blobs behind everything (`body::before/::after` radial gradients pulsing 10–12 s, or three `.blob` divs
floating); `filter: blur(48–80px)`, `opacity 0.2–0.5`, never over the text.

**LSN-3 — TWO SCREENS, NO MORE.** *Landing* → *Lesson*. There is no menu, no settings, no login.
- **Landing**: floating logo (emoji in an SVG/gradient tile), gradient title, one-line promise with a wink
  (`"…Because words don't always mean what they say... 😏"`), **one** CTA pill (`🚀 Begin Your Journey` /
  `🚀 Start Lesson`), then 3–4 **feature cards** that tell the learner the shape of the lesson (rooms · practice ·
  mastery). Clicking the CTA hides the landing and shows the engine. [both]
- **Lesson**: one card, centred, max-width 650–700 px, with a **4 px gradient progress bar** pinned to its top
  (V20) or a coin bar (Careers), and one room visible at a time.

**LSN-4 — SIX ROOMS, THE SAME SPINE.** Every lesson walks the identical arc. The labels are part of the contract
(the pill under the room title):

| # | graphic | title (example) | label | what is in it |
|---|---|---|---|---|
| 1 | 🏠 | The Entrance | `Warm-Up` | Welcome + what you will leave with, as bullets |
| 2 | 🖥️ | (scene) | `Group Work` / `Scene` | verbatim dialogue between named people |
| 3 | 📱 | Messaging Chamber | `Text Scene` | the same skill in chat/emoji form |
| 4 | 📚 | Vocab Vault | `Learn` | 5 numbered terms, one line each |
| 5 | 🎯 / 🧪 | Practice Room | `Test` / `Quiz!` | clickable scenarios that score |
| 6 | 🔑 | The Exit | `Mastery` / `Finish` | the summary card + what to do next |

Rooms may be added or swapped in the middle — but **1, 4, 5 and 6 never move**: entrance, learn, test,
exit. Rooms navigate `⬅️ Back` (disabled on room 1) and `Next ➡️`, and the last room's forward button becomes
`🔄 Restart` (which also resets coins). Progress = `(currentRoom + 1) / rooms.length`. [both]

**LSN-5 — THE ROOM CONTRACT.** A room is exactly four fields:

```js
{ graphic: '🏠',            // ONE emoji — the scene icon in the gradient tile
  title:   'The Entrance',  // the room's name
  label:   'Warm-Up',       // the pill (uppercase, short)
  content: `…html…` }       // template literal using ONLY the approved components below
```

Content may use **only** these components (no inline `style=` except for one-off margins in lists, no classes
invented outside this list): `.dialogue-block` + `.speaker`, `.chatty-clue`, `.chatty-hint`, `.vocab-list` +
`.vocab-item`, `.chatty-choices` + `button[data-answer]`, `.chatty-feedback`, `.summary-card`. That constraint is
what makes every lesson look like a lesson and not like a webpage.

**LSN-6 — CHATTY TEACHES; CHATTY NEVER JUDGES.** Chatty is the coach, and it has exactly three voices:
- `.chatty-clue` (green, prefixed 🤔 / 🎮 / 💬) — **"Reality check:"** what is actually happening, set against
  what the words said. This is where subtext is made explicit.
- `.chatty-hint` (gold, `<strong>Pro Tip:</strong>` / `Watch For:` / `Text Clues:` / `Level Up:`) — the
  **transferable rule** the learner can use tomorrow, in any conversation.
- `.chatty-feedback` (`aria-live="polite"`, correct/wrong) — celebrates *or re-teaches the rule that was missed*
  (`"❌ Not quite. Sarcasm is usually dramatic or mismatched with reality."`). **Never** a bare "wrong".

Voice: second person, warm, concrete, ≤ 2 sentences, emoji as punctuation. Never sarcastic *at* the student.
[both files — every clue/hint/feedback line obeys this]

**LSN-7 — PRACTICE IS A CLICK, AND IT SCORES.** The test room holds 1–3 `.chatty-choices` blocks. Each block is a
scenario line plus 2–3 `<button data-answer="correct|wrong">`, and the block itself carries
`data-correct-feedback` / `data-wrong-feedback`. On click: **all buttons in the block disable**, the chosen one
gets `.correct` or `.wrong` (green pulse / red shake), feedback appears, and coins move (`+10` correct; Careers
also does `coins = Math.max(0, coins - 5)`). A visible counter (fixed pill top-right, or the coin bar) animates on
change. Room change and restart **reset** the feedback and re-enable the buttons. [both]

**LSN-8 — THE EXIT HANDS OVER A KEY.** The last room is a `.summary-card`: a title that names the reward
(`🎉 You Unlocked the Sarcasm Key!`) and 4–6 bullets, each **bolded rule + one-line reason**
(`<strong>Context is King:</strong> Late? Failed? Forgot? These set the stage for sarcasm.`). Then ONE of:
- a **Level Up** hint sending the skill into the real world ("spot it in movies, TikToks, group chats"), or
- a **writing task** — a real textarea (`id="career-write"`, placeholder = the actual instruction).

**LSN-9 — MOTION IS SOFT, FINITE AND CHEAP.** Animate `transform` and `opacity` only (`will-change` where the
newer file uses it) — never `width`/`top`/`margin`. Timings: entrances `0.5–0.9 s` on
`cubic-bezier(.68,-.55,.265,1.55)`, ambient loops `2–13 s infinite alternate`. Every animation must survive
`@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important } }`.

**LSN-10 — IT MUST WORK ON A PHONE.** `@media (max-width:720px)`: features stack to one column, room padding
drops to ~`1.2rem`, the graphic tile shrinks (≈70 px), the coin pill tucks to `top:10px; right:10px`. Careers
goes further and flattens the container (`max-width:99vw; border-radius:0; box-shadow:none`) — that flattened
form is the mobile target. [both]

**LSN-11 — A LESSON THAT FAILS THE CHECK IS NOT SHIPPED.** `/lesson check` runs the validator (below) and reports
every failure. No lesson leaves the station with a failing check — the same fail-closed rule as everything else in
the canon.

---

**LSN-12 — TWO DELIBERATE DEVIATIONS FROM THE REFERENCE FILES** (both are defects in the sources; the rest of the
format is copied faithfully, and these two are the only place the station improves on it):
1. **Earlier answers keep their marks.** In both reference files, answering a later scenario calls `resetFeedback()`,
   which wipes the `.correct` / `.wrong` colour off **every** block — the learner loses the record of what they
   already got right. The station clears only the feedback banner and the block being answered; a full reset
   happens on room change and restart.
2. **The nav row is sticky.** `.nav-btns` is `position:sticky; bottom:0` with a soft glass strip, because on a
   short screen the reference layout pushes `Back` / `Next` below the fold *inside* the card's scroll area, and a
   learner who cannot find `Next` stops walking the lesson.

## CONTENT VOICE (the classroom, from the reference files)

- **Second person, present tense.** "You'll explore jobs…", "Get ready for real-world jobs & future skills."
- **Names are real and consistent** — the reference lessons use Vietnamese students (`Minh`, `Alex`, `Linh`); keep
  the sovereign's actual roster/client names when the lesson comes from a real class.
- **Scenes are ordinary school life**: late to class, a group project nobody did, the group chat afterwards.
- **Emoji are punctuation, not decoration** — one per line where meaning needs it (🙃 🙄 😏 🤔 🎮 💬).
- **No walls of text.** Longest block in either reference file is two sentences. Lists carry the volume.
- **English-teaching framing**: the lesson teaches the *language* of the thing (sarcasm detection, careers,
  skills) with mini-quizzes and one writing task — not the topic in the abstract.
- **The promise is honest and a little funny** — the wink in the subtitle is allowed; the pedagogy behind it is not.

---

## THE DELIVERABLE CONTRACT (what `/lesson` produces)

1. **A JSON spec** (what Agent 99 returns) — `{ topic, title, logo, subtitle, cta, features[], coins{start,
   correct, wrong}, rooms[6+] }` with the room contract of LSN-5.
2. **A standalone HTML lesson** built from it by `src/lessons.js` (`window.ObiLessons.build(spec)`) — his format,
   his classes, his theme, self-contained, one file, ready to hand to a class or upload.
3. **The check** — `/lesson check` (validator) must pass before it is called done.

## THE VALIDATOR (fail closed)

`ok` requires **all** of:
- `title`, `logo`, `subtitle`, `cta` present; `features` length 3–4 with icon + title + desc.
- `rooms` length ≥ 6; room 1 label contains *warm*, the **last** room label is *mastery*/*finish*, and somewhere
  in between there is a room labelled exactly *learn* and a room labelled *test*/**quiz** — the learn room must
  come **before** the test room. A lesson may now carry **more than six rooms** (a reading room, game rooms, extra
  practice) without breaking the check: the anchors are found **by label, not by position** (LSN-4 amendment,
  2026-09-22).
- every room has one emoji graphic, a title, a label, non-empty content.
- every `content` uses **only** approved classes; no `<script`, no `<style`, no `onclick=`, no `style=` beyond
  `margin*` one-offs.
- the **learn** room contains `.vocab-list` with ≥ 3 `.vocab-item`, each with a `<strong>`.
- the **test** room contains ≥ 1 `.chatty-choices` with 2–3 buttons all carrying `data-answer`, and the block carrying both
  `data-correct-feedback` and `data-wrong-feedback`.
- the last room contains `.summary-card` with ≥ 3 `<li>` and either a `Level Up` hint or a `<textarea`.
- at least one `.chatty-clue` and one `.chatty-hint` somewhere before the learn room.
`warnings` (allowed but reported): fewer than 3 scene rooms, no dialogue in room 2, coin values outside
`correct>0`, `wrong<=correct`.

## THE GAMES (a lesson the learner can PLAY)

The runtime that every lesson ships with plays three games. They need **no scripts in the content** — the lesson
declares the game and its data, the runtime builds and scores it, and every correct answer pays the lesson's own
coin reward (`coins.correct`):

| game | element | the learner does |
|---|---|---|
| 🔤 **Scramble** | `<div class="game" data-game="scramble" data-items="cooker=the machine you cook on;pot=a deep pan"></div>` | clicks letter tiles in order to rebuild each word |
| 🔗 **Match** | `<div class="game" data-game="match" data-items="shelf=a flat board on the wall;fridge=the cold cupboard"></div>` | clicks a word, then its meaning — a wrong pair shakes and releases |
| 📦 **Sort** | `<div class="game" data-game="sort" data-groups="Identity: clothes, food, language \| Home: shelf, pot, fire"></div>` | clicks a chip, then the group it belongs to |

`data-title` (optional) names the game on its header. `data-items` is `word=meaning` pairs separated by `;`;
`data-groups` is `group: item, item | group: item, item`. A game room sits anywhere after the learn room and is
usually the **practice** between the test and the exit. Written 2026-09-22 at the sovereign's instruction — the
second grade-5 lesson ("more extensive, with games").

**Scramble items are SINGLE WORDS.** The runtime strips every non-letter from the item and shuffles what is left,
so a phrase like `Would you like to...?` silently becomes the fourteen-tile string `wouldyouliketo` — the learner
ends up spelling a phrase with no spaces. Put only one word per row in `data-game="scramble"` (`Monday`, `practice`,
`guitar`); phrases belong in **Match** (where both sides are whole lines) or **Sort** (where the chip is the whole
phrase). Found 2026-09-22 in the first grade-6 lesson, which had to be rebuilt.

**A sort with three groups puts the meaning in the hint, not in the label.** The buckets share the card width
(`repeat(auto-fit,minmax(140px,1fr))` — roughly 160 px each in a 650 px lesson), so a label like
`REFUSING POLITELY — no, with a reason` wraps to three lines and looks like a defect. Bucket labels are **one word**
(`INVITING`, `ACCEPTING`, `REFUSING`) and the gloss goes in a `.chatty-hint` above the game.

## FEEDBACK IS TEXT, AND A ROOM OWNS ONE FEEDBACK LINE

**Amendment, 2026-09-22** (learned by rebuilding a lesson that got it wrong). The runtime prints
`data-correct-feedback` and `data-wrong-feedback` with `textContent` — so a tag in that string
(`"🎉 Yes — <em>loudly</em> tells you how."`) appears **on the screen as the literal characters `<em>`**. The
feedback attributes take **plain text with emoji only**; all markup stays in the room's `.chatty-clue` /
`.chatty-hint` / `.vocab-item` blocks, which are rendered as HTML.

The runtime also keeps only the **first** `.chatty-feedback` element in a room (`host.querySelector`). Two feedback
elements in one room means the second never shows; so **one `.chatty-feedback` per room, at the end**, and a room
carries **two, at most three** choice blocks — which is exactly what both reference lessons do. If a topic needs
more than three questions, it needs a second room, not a longer one (see the song/video rooms below).

## A ROOM FOR A SONG, AND A ROOM FOR A VIDEO (the textbook-page lesson)

When the guide row is a *song* page or a *video* page (both occur in the same Look unit), the lesson carries:

- a **Song room** — a `.reading` block holding the lyrics, followed by one or two `chatty-choices` "lyric hunt"
  blocks (which word tells you **how** it is done?), a `.chatty-clue` doing the reality check, and a
  `.chatty-hint` **"Act it out"** task: the learner mimes one adverb and the partner returns it in a full sentence;
- a **Video room** — a `.reading` block holding the **transcript**, followed by "circle the correct answer"
  comprehension blocks, then a separate **Definitions room** (2 blocks) where the same vocabulary is recalled
  **from memory, with the transcript behind them** — the recall step is the point of the room.

**Copyright.** The school's song lyrics are not copied into a lesson. The room carries a **class chant written from
the unit's own target words** (the adverbs and the music vocabulary the guide row names), and the sovereign can
paste the school's own lyrics over it verbatim whenever he wants them. Written from the grade-4 Look Unit 2 row
(*Lesson 5 Song & Lesson 7 Video*, SB 22/24, WB 19, periods 8–9), 2026-09-22.

*Written 2026-09-21 from the reference files above, at the sovereign's instruction — to program Agent 99
(through GOSPEL-999 and the Legionnaire Field Guide) on how his lessons must look and function.*

---
---

# PART II — THE METHOD AND THE MACHINE

**Added 2026-09-21** after auditing `src/lessons/reference/NET-CLASSROOM-MANAGER.html` (*NET Classroom Manager —
Ultimate Edition*, header comment: `Soul DNA: Gospel 444 + Feature Spec + Michael Method`). Part I says what a
**lesson** is. Part II says what a **NET session** is, what the **machine around it** looks like, and what the
sovereign's **voice** sounds like — because a lesson that is formally correct but pedagogically empty is a fail.

Part II amends exactly one thing in Part I: **LSN-1's font budget** (two display/body families instead of one —
see LSN-17). Everything else in Part I stands unchanged.

## THE AUDIT — what the specimen establishes

The classroom manager is one self-contained 79 KB HTML file: 8 tabs (`HQ · Grid · Enforce · Spin · Work · Games ·
Score · Report`), a 60-minute session clock with a clickable phase timeline, a 1–60 student grid with per-student
flags/points/stars, an enforcement escalation ladder, a canvas spinner, a 10-word vocab/definition tracker with a
live writing exercise, 15 classroom games, a leaderboard with mastery tiers, a session report with copy/CSV/print
export, four modals, one fullscreen overlay, WebAudio sound cues, confetti, keyboard shortcuts, a print stylesheet,
and date-scoped `localStorage` persistence. Five things it proves:

| # | Finding | Evidence in the file | Consequence for lessons |
|---|---|---|---|
| 1 | **The method is fixed arithmetic, not a mood** | `10-5-5-3 SACRED STRUCTURE` card (10 vocab · 5 idioms · 5 slang · 3 games); `PHASES` (Hook 5′ · Vocab 10′ · Game 10′ · Idioms 10′ · Game 10′ · Slang 5′ · Game 5′ · Review 5′); `+10 vocab · +25 idiom · +5 participation · +50 game win · +100 perfect session`; tiers `🐭 <200 · 🐻 200 · 🐅 500 · 👑 5000` | A lesson is one slice of a session, and its numbers must be a slice of *these* numbers (LSN-13, LSN-15) |
| 2 | **Every game carries its mechanism out loud** | the `GAMES` array: each entry is `{icon, name, type, desc}` — the `desc` is a *pedagogical* one-liner ("Double encoding through production + reception", "Narrative memory embedding", "Metacognitive processing at its peak", "Register awareness training"), and `type` ∈ competition/collaboration/creation/all (`🔴 Adrenaline · 🟢 Social Proof · 🟣 Ownership`) | interactive rooms must state what the interaction *does to the learner* (LSN-14) |
| 3 | **The design system is bigger than the lessons use** | 4-font stack `--font-head:Orbitron · --font-body:Rajdhani · --font-ui:Inter · --font-mono:JetBrains Mono`; full token set incl. semantic `--green/--red/--orange/--yellow` + `-dim` pairs; `.card` = glass + `blur(16px)` + glass-border + radius; `.card-title` = emoji + Orbitron uppercase; `.stat-pill` = icon + mono gold value; tab bar = icon-above-label with a red badge; glass `--radius:1rem` | lessons adopt the palette, the type hierarchy and the card/pill grammar (LSN-17…LSN-19) |
| 4 | **The juice is part of the teaching** | `playSound()` — one `AudioContext`, oscillator cues only (flag = sawtooth 300 Hz, star = sine 800→1200, spin = square 400→1200, win = 523 + 659/784/1047 arpeggio, tick 600, point 900), **no audio files**; `fireConfetti()`; `@keyframes timer-pulse / word-pop / confetti-fall` | feedback lands as sound + motion, generated not downloaded (LSN-20) |
| 5 | **The voice is the sovereign's own** | `TIGER_QUOTES` (23 lines, rotated every 30 s into a gold italic card): *"Say it LOUD. Say it WRONG. But SAY IT."* · *"Loud and wrong beats silent and correct. Every single time."* · *"Silence is the true enemy. Not mistakes. Not grammar. Silence."* · *"Volume plus velocity is greater than grammar. Always."* · *"You are not teaching English. You are building Tigers."* · *"The word a student learns while winning a game will still be in their mouth ten years from now."* · *"A lesson that fails perfectly is worth more than a lesson that succeeds by accident."*; the export signs off with *"I don't make the rules. The system just flagged you."* | this is the register every lesson is written in (LSN-16) |

## THE METHOD (the teaching constants)

**The 10-5-5-3 sacred structure.** A NET session is **10 vocabulary words · 5 idioms · 5 slang items · 3 games**.
It is displayed as a card with four `report-stat`s and it is not negotiable. A lesson is the *clickable core* of one
session: its Vocab Vault carries the five terms the two scenes actually used (Part I, LSN-4), drawn from the
session's ten-word vault, and its practice blocks drill the idioms/slang from those same scenes. The vocabulary
vault is where the ten live; the scenes are where five of them get used out loud.

**The clock.** A session is 60 minutes (period-1 break at 35 minutes); phases run Hook → Vocab → Game → Idioms →
Game → Slang → Game → Review. A lesson is built to be *walked in one sitting* — the six rooms map onto those
phases: room 1 = Hook, rooms 2–3 = the language in use, room 4 = Vocab, room 5 = the games/retrieval, room 6 = Review.

**The games (15, and their mechanisms).** Hot Seat (production + reception), Word Builder Relay (speed + accuracy
under social pressure), Story Chain (narrative memory embedding), Pronunciation Duel (public performance pressure),
Alibi Challenge (real-world functional language), The Market (metacognitive processing), Speed Idiom (retrieval
speed), Emotional Translator (register awareness), Word Heist (contextual acquisition), Debate Spark (spontaneous
production), Vocabulary Tennis (recall speed), Accent Inspector (phonetic ear training), Consequence Chain (causal
vocabulary), Level Up (register across tiers), The Final Boss (everything at once). **Type is not decoration:**
competition = adrenaline, collaboration = social proof, creation = ownership.

**The tiers.** A learner climbs `🐭 Mouse → 🐻 Cub (200) → 🐅 Tiger (500) → 👑 Legend (5000)`. Points map to
demonstrated language: `+10` vocab card, `+25` idiom, `+5` participation, `+50` game win, `+100` perfect session.
Lesson coins (`+10` correct, `−5` wrong) are the *same currency, smaller denomination* — never invent a second one.

**Escalation, when a lesson reports on a class.** `0 flags ✅ Clean · 1 ⚠️ Warning · 2 🟠 Notice · 3+ 🔴 Report`.
The thresholds are settings, not constants; the ladder is the constant.

## THE MACHINE (the chrome a lesson inherits)

- **Ground:** `#0f0f1a`, with three fixed blurred blobs (`blur(100px)`, `opacity .12`, purple/gold/purple) behind
  everything. The lesson theme's two `body::before/::after` gradients are the same idea, cheaper (LSN-2).
- **Cards:** every surface is glass — `backdrop-filter: blur(16px)`, `1px solid rgba(168,85,247,.2)`, `1rem` radius.
- **Card titles:** `<span class="ct-icon">emoji</span> LABEL` — emoji first, label uppercase in the display font,
  purple, letter-spaced. Every panel in the manager obeys it; every lesson card does too.
- **Pills & stats:** a state is always `icon + value` — `<div class="stat-pill"><span class="icon">👥</span><span class="val">22</span></div>`,
  with the number in mono and gold. Labels are pills (rounded, uppercase-ish, tiny).
- **State = colour + dim background**, never colour alone: green ✅ present, yellow ⚠️ warning, orange 🟠 notice,
  red 🔴 report, gold ⭐ star — each with its `-dim` fill (the lesson's correct/wrong pills are the same grammar).
- **Progressive disclosure:** a launcher grid → one active view; modals for settings/names/points; a fullscreen
  overlay for the spinner. Nothing is shown that is not being used.
- **Feedback chrome:** a timestamped activity log (`HH:MM | ⊙ text`, newest first, capped at 100), a badge count on
  the tab that needs attention, and a rotating voice card.
- **Touch/keyboard:** `aspect-ratio:1` grid cells, big pill buttons, `1–8` switch tabs, `Space` starts the clock,
  `F` opens the spinner, `Esc` closes everything.
- **Survives the classroom:** `@media print` (chrome hidden, panels shown, white ground), `640px`/`380px`
  breakpoints (the very small screen drops the header stats entirely), date-scoped `localStorage` that resets daily
  and never restores a *running* clock.

## THE DEFECTS WE DO NOT INHERIT

The specimen is ground truth for *design and method*; it is not ground truth for *correctness*. These are real bugs
in the file — a lesson that copies them is wrong:

| # | Defect in the specimen | The rule for lessons |
|---|---|---|
| D1 | Four Google Font families loaded for every screen | At most **two** families per lesson (display + body); the tool chrome's Inter/JetBrains Mono stay in the tools |
| D2 | `const audioCtx = new AudioContext()` at load — created before any user gesture, so it starts `suspended` and every `playSound()` is silently a no-op until a click happens to resume it | Create **and** `resume()` the context on the first user interaction; guard every cue in `try/catch` |
| D3 | `PHASES` bands overlap and collide (`Idioms 25-35`, `Game 2 35-45`, `Slang 35-45`) | Phase/step timelines must **sum** to the session length and never overlap; the title row and the arithmetic row must agree |
| D4 | Student names interpolated straight into `innerHTML` (`state.names[i]`, `getStudentName(i)`) | Every interpolated string is escaped (the lesson build does this — `sanitize()` + `esc()`); never `innerHTML` a name |
| D5 | No `prefers-reduced-motion` rule (the lessons have one) | LSN-9 applies: the reduced-motion block is mandatory |
| D6 | The wheel result and timer carry no `aria-live` | Anything that changes under the learner's eyes announces itself (`aria-live="polite"`) — `.chatty-feedback` already does in the reference lessons |
| D7 | Class size editable in two places (`#class-size`, `#set-class-size`) | One source of truth per setting |
| D8 | `grid.innerHTML +=` inside a loop (O(n²) reparse) | Build the string, assign once |
| D9 | `confirm()` in `resetSession()` | No native dialogs in a learner-facing surface |
| D10 | Emoji-only labels carry meaning (`🗣️/📱/😴/⏰/📝` flag types in a legend only) | Every emoji that carries meaning is also **named** in text |

## THE LAWS OF PART II

**LSN-13 — THE METHOD IS THE ARITHMETIC.** A lesson is one session's slice: `10 vocab · 5 idioms · 5 slang · 3
games`, the phase arc Hook → Vocab → Game → Idioms → Game → Slang → Game → Review, a 60-minute session. The
lesson's Vocab Vault holds the 5 terms the scenes used, from the session's 10. Do not invent a different shape.

**LSN-14 — AN INTERACTIVE ROOM OWNS UP TO ITS MECHANISM.** Every game/practice block names, in one line, what it
does to the learner ("retrieval speed", "register awareness", "narrative memory embedding") and declares its type:
competition (adrenaline) / collaboration (social proof) / creation (ownership). Minimum: three games in a full
session's lesson set, and never three of the same type.

**LSN-15 — TIERS AND COINS ARE ONE ECONOMY.** `🐭 Mouse · 🐻 Cub 200 · 🐅 Tiger 500 · 👑 Legend 5000`;
`+10 vocab · +25 idiom · +5 participation · +50 game win · +100 perfect session`; lesson coins are the smaller
denomination of the same currency. Never a second currency, never a punishment that outruns the reward (Part I
already refuses `wrong > correct`).

**LSN-16 — THE VOICE IS THE SOVEREIGN'S.** Second person, present tense, imperative, short. Caps and repetition are
*weight*, not shouting. The doctrine the lessons teach in passing: *loud and wrong beats silent and correct* ·
*silence is the enemy, not mistakes* · *volume plus velocity is greater than grammar* · *interest is competence* ·
*a lesson that fails perfectly beats one that succeeds by accident*. Banned: hedging, apology, corporate register,
sarcasm aimed *at* the learner, "and you're wrong" without the rule. One **voice card** (the sovereign's own lines,
rotating) is allowed on the landing; the exit card is the natural second home for one line of it.

**LSN-17 — TWO FAMILIES, DISPLAYED WITH INTENT** *(amends LSN-1).* At most **two** Google Font families per lesson:
a **display** face for headings/labels (Orbitron, uppercase, letter-spaced) and a **body** face for text (Rajdhani
or Inter). Numbers, timers and coins may use a mono face if and only if it is one of the two loaded families (or the
system mono stack). Never four; never a font for a font's sake.

**LSN-18 — THE FULL PALETTE.** Beyond LSN-2's brand tokens, a lesson may (and should, where a state exists) use the
semantic set: `--green #22c55e`, `--red #ef4444`, `--orange #f97316`, `--yellow #eab308`, each with its `-dim`
partner at ~12–20% alpha, plus `--glass-light rgba(255,255,255,.05)`, `--text-dim #94a3b8`, `--text-bright #f8fafc`,
`--radius 1rem`, `--radius-sm .5rem`. Purple is the system, gold is the reward, and the semantic four are only ever
**state**.

**LSN-19 — THE CARD AND THE PILL.** Every panel is a glass card; every card title is `emoji + uppercase display
label`; every statistic is `icon + value` with the value in gold mono; every category/tag/status is a pill. A lesson
that looks like a webpage is a lesson that failed the vocabulary (LSN-5's class list is where this is enforced).

**LSN-20 — JUICE, GENERATED NOT DOWNLOADED.** Feedback may carry a sound cue (WebAudio oscillators only — no audio
files, no external assets) and motion (confetti on success, a pulse on a value change, a shake on a miss).
Constraints: the audio context is created/resumed on the first user gesture (D2); every animation still obeys
LSN-9 and dies under `prefers-reduced-motion`; a miss never gets confetti, and a win never gets the miss cue.

**LSN-21 — THE LESSON SURVIVES THE CLASSROOM.** Touch targets ≥ 44 px; the whole flow is keyboard-reachable; live
regions announce feedback; no native dialogs; print-friendly; works offline except the font; resets cleanly on
restart; no setting has two homes. (This is LSN-10 made ruthless.)

**LSN-22 — DEFECTS ARE NOT INHERITED.** The reference files are ground truth for **design and method**, never for
**correctness**. The ten defects in the table above (four fonts, an eager `AudioContext`, overlapping phase
arithmetic, unescaped names, no reduced-motion block, no live regions, duplicate settings, `innerHTML +=` loops,
`confirm()`, unnamed emoji) are documented so that a future agent copies the *taste* and not the *bug*. When a
reference file and this rule disagree about a *defect*, this rule wins; when they disagree about *taste*, the file wins.

**LSN-23 — THE SPEC DECLARES ITS METHOD.** Where a lesson spec carries a `method` object
(`{structure:"10-5-5-3", phase, games:[{name,type,why}], tier, voice[]}`), the validator checks it: three games
minimum, no three of a type, a `why` on every game, a phase named. Absent, the lesson is still legal — but a full
session's lesson set carries it.

**LSN-24 — THE BRAND LAYER IS CHROME, NEVER A RESTYLE** *(added 2026-09-21, from AMENDMENT III / `BRAND.002`).*
The dossier gave the family a second register and it is now part of the lesson's look: the **plum court**
(`--hud-court:#3b1d5c`, `--hud-court-deep:#2a1040`), the **antique gold** hairline and corner bracket
(`--hud-ancient:#e8c565`), the framed panels that carry a 15 px bracket at their top-left and bottom-right, and the
hairline border on every dialogue block. What it may **not** do is move the frozen tokens: `--neon-purple:#a855f7`
is still the system, `--gold:#f59e0b` is still the reward, `--deep-dark:#0f0f1a` is still the ground (LSN-2,
LESSON.008). The extension dresses the chrome; it never repaints a lesson for a topic's mood.
GATE: the `:root` block in a built file carries all three frozen tokens unchanged, and the brand layer only adds
new custom properties. ALARM: a lesson whose ground is plum, whose headings are bone, or whose system colour has
become `#8a2be2` = the same breach LSN-2 names = breach.

**LSN-25 — THE LESSON WEARS THE SIGN, AND THE BAR STATES** *(added 2026-09-21, from `BRAND.004` / `BRAND.005`).*
Three things are now compulsory in a built lesson, and all three are **real**:

1. **The sigil.** The gold line-art tiger head (`src/brand/assets/head.webp`) sits beside the landing logo and
   inside the HUD pod. It is **inlined** as a data URL in the file's own `<style>`
   (`.hud-sigil{background-image:url("data:image/webp;base64,…")}`), referenced from CSS so it is stored **once**
   however many places wear it — never linked, never hotlinked, never a broken image (LSN-1, LSN-10).
   `ObiLessons.build()` attaches it from `src/brand.js`; if the brand module is absent the lesson simply carries no
   sigil, and that is legal.
2. **The status bar.** One monospace uppercase line (`.hud-bar`), built from **this lesson's own numbers** —
   `NET ACADEMY // <topic> // <n> ROOMS // +<n> PER CORRECT // STANDARD <file>` — centred under the title and
   repeated at the foot of the landing. It states; it does not decorate. A line that drifts from the lesson's real
   room count or coin rate is a defect, not a flourish.
3. **The pod.** The learner's HUD (`.coins-display`) carries the sigil, `NET ACADEMY`, the **live tier crest**
   (MOUSE / CUB 200 / TIGER 500 / LEGEND 5000 — LSN-15's one economy, read from the coins on screen), the coin
   count, and the **real room position** (`7/12`), all updated by the runtime as the learner moves and earns.
   Never a decorative counter, never a second source of truth (LSN-15).
GATE: the built file contains `.hud-sigil`, `.hud-bar` and `#tierCrest`, and the tier text changes when coins cross
200 / 500 / 5000. ALARM: a hobby counter, a hard-coded tier, or a status line that claims rooms the lesson does not
have = breach.

*The lesson's own authored graphics — the room emoji, the feature-card icons — are the **author's**, chosen per
lesson and required by LSN-19; `BRAND.003`'s ban on emoji standing in for a concept binds the brand's chrome, not
the lesson's authored art. Two different jobs, deliberately not the same rule.*

**LSN-26 — 10-5-5-3 IS DOCTRINE, NOT HOUSE STYLE** *(added 2026-09-21, from GOSPEL 444 / `G444.008`).*
LSN-13 already fixes the arithmetic. This law says **where it came from and what that obliges**: the sacred structure
is `G444.008` of the sovereign's own doctrine, so it is quoted here, not invented here, and it may not be tuned to
taste. The deck's own wording is: 10 core vocabulary words *taught strictly in real-world context and full
sentences, never isolated lists*; 5 idioms, the conversational glue textbooks refuse to teach; 5 slang expressions,
what professionals and native speakers actually use; 3 interactive games *deployed at warm-up, mid-lesson and
finale* to drive deep retention. Base code supported by **UK Jolly Phonics (42 core sounds)** to fix Vietnamese
phonetic interference.
Two consequences that were previously implicit and are now auditable:
1. **Context is not a formatting choice.** A vocabulary room that shows a word beside its translation has failed
   `G444.008` even though it has ten words. The word arrives inside a sentence and a situation.
2. **The three games are placed, not pooled.** Warm-up, middle, finale. Three games stacked at the end is a
   different (and worse) lesson than three games spread across one.
`ObiLessons`' validator already counts the games and refuses three of one type (LSN-13/LSN-23); what it cannot count
is context, and context is the part a human author signs.
GATE: a lesson's vocab rooms show sentences, and its three games sit at three different points in the arc. ALARM: a
word list with a translation column, or three games in the last room = breach.
**Still owed and named:** the Jolly Phonics 42-sound layer has no carrier in any lesson here yet (AMENDMENT IV, open
items). It is quoted from the doctrine; it is not implemented.

**LSN-27 — THE TWO LADDERS ARE TWO INSTRUMENTS** *(added 2026-09-21, from GOSPEL 444 / `G444.003`).*
LSN-15 gives the lesson one economy: Mouse · Cub 200 · Tiger 500 · Legend 5000 **coins**. The doctrine gives the
coach one diagnostic: Mouse 0–40 · Cub 41–79 · Tiger 80–100, read from behaviour (hesitation → momentum →
immediate volume). They share three names and they are **not** the same number. A learner can be a Tiger in the room
and hold 40 coins in the file; both statements are true at once.
- In a **lesson file**, the crest is the coin ladder (LSN-15) and `#tierCrest` reads coins. That does not change.
- On a **coach's surface** — a writeup, a review, `/review`, a parent report — a mode is a diagnostic. Write
  `TIGER MODE 86/100`, never "Tiger tier", and never spend a mode as currency.
- `ObiBrand.modeOf(score)` reads the diagnostic; `ObiBrand.crest(coins)` reads the economy. `ObiBrand.modeBadge(score)`
  is the only badge that may show a mode.
GATE: any sentence using a mode name says which ladder it means. ALARM: raising a learner's coin tier because they
"reached Tiger Mode", or reading a coin count as a diagnosis = breach.

**LSN-28 — A LESSON MAY AWARD AN EMBLEM, NEVER A COMPOSED ONE** *(added 2026-09-21, from AMENDMENT V / BRAND.012–.013).*
The lesson already shows a crest (LSN-15) and may now show an **emblem** — the vector roundel of a coin rank or the
shield of a diagnostic mode (
`ObiBrand.emblem("rank-tiger")`, `ObiBrand.emblemBand("rank-tiger")`). The rule is the same one the certificate obeys:

- An emblem is drawn, never redrawn per lesson (BRAND.012) and never restyled to match a topic's mood.
- A **roundel** may appear only where the lesson's own record holds the coins; a **shield** only where the desk holds
  a diagnostic score. An emblem on a page with no number behind it is decoration, and decoration in a lesson is a
  defect, not a flourish.
- The lesson file inlines the emblem as SVG (it already inlines the sigil); it does not fetch `src/brand.js`.
- When the desk composes a **certificate** for a learner, it obeys BRAND.013: what the desk does not hold prints as a
  blank rule for the pen — never a plausible number, never a name nobody entered.
GATE: every emblem in a lesson answerable to a number in that lesson's own state. ALARM: a badge standing in for
praise, or a rank painted on a learner the record does not support = breach.

**LSN-29 — A PRINTED SHEET STATES ITS OWN PRINTING** *(added 2026-09-21, from AMENDMENT V / BRAND.016).*
Anything of a lesson that leaves this station as paper — a wall set, the one sheet, a badge sheet, a certificate —
is composed through the print room (`ObiBrand.PRINT_ARTIFACTS`, `/brand print`) and obeys BRAND.014–.016: the artwork is the system's
own, the bed is a bed and never a warning, and the sheet carries its size, its page count, its folio and its own
`@page` rule — so a sheet that prints wrong can prove it was printed wrong.
GATE: the exported file opened and printed before anyone is told it exists. ALARM: a classroom poster hand-built
beside the system, or a sheet with no folio, = breach.

**LSN-30 — A LESSON HAS A PARENT PAGE, AND IT SPEAKS THE REGISTER** *(added 2026-09-22, from AMENDMENT VI / BRAND.017–.019).*
A lesson may carry a **parent-facing card** — the method card, or the lesson's own one-page summary spoken outward —
and that page speaks the **marketing register** (`ObiBrand.MARKET`), never a new voice. It may state only what the
lesson's own record shows (its rooms, its coins, the 45/15 ratio, the AI-PET's return days) and only numbers the
doctrine holds (BRAND.019); a lesson with no record carries no card, and anything unproven prints as owed, not as a
claim.
GATE: every line on the card traces to a slide or to the lesson's own numbers. ALARM: a parent page written fresh,
or a claim the lesson cannot show, = breach.

**LSN-31 — A PARENT-FACING PAGE CARRIES THE BILINGUAL HIERARCHY, AND NAMES ITS DIAGNOSIS** *(added 2026-09-22, from
AMENDMENT VII / BRAND.021–.023).*
Any page a lesson puts in front of a parent or a student — the method card, the enrolment page, its own one-page
summary — wears the **bilingual hierarchy**: one English anchor line in Imperial Gold carrying the point, the
Vietnamese rendered as the clean, subordinate subtitle, and never two languages competing at the same weight
(BRAND.021). And it **names the diagnosis it answers** before it makes a promise: the failure the lesson exists to
break — the translate-in-head delay, the apology reflex, the leaky bucket — not the outcome it hopes for
(BRAND.023). Teaching material that opens on the offer, or that lets Vietnamese carry the headline, is a page that
has skipped its own diagnosis.
GATE: an outward lesson page has an anchor language and names the problem it answers. ALARM: a parent page whose
Vietnamese leads, or which sells before it diagnoses, = breach.

**LSN-32 — A LESSON IS NAMED WHAT THE SCHOOL NAMES IT, AND A LONG NAME IS NEVER CLIPPED** *(added 2026-09-23, from
the sovereign: *"dont rename lessons, use names they give"*).*
A lesson's title is the **school's own name for that lesson** — the pacing guide's row: **book · unit · section**
(the guide's words in the bracket if a descriptor is needed), never an invented brand name written over it. A lesson
built to a guide row is traceable back to that row by its own title, and that is the title the class and the
teacher already use. Two consequences, and the second is a defect this law exists to prevent: a school's name is a
whole guide row, not two words, and the hero **must not squash it**. The landing's items never flex-shrink
(`.landing>*{flex:0 0 auto}`) — otherwise the title's box is squeezed shorter than its own glyphs and the status bar
prints **over the last line** — and a title longer than 30 characters takes the smaller clamp
(`clamp(1.6rem,5.6vw,3.6rem)`) so the name still reads as a hero.
Measured 2026-09-23 at 430 px wide: the 55-character title *Look 4 · Unit 1 + Unit 2 — Function 1 (giving
directions)* renders two lines, box 86 px, scrollHeight 87 px (no clipped glyphs), bottom 277 px against a status
bar at 319 px — no overlap. Before the fix the same title was four lines, clipped, with the bar on top of it.
GATE: the title is the guide's row, and every glyph of it is on screen. ALARM: an invented name in the hero, or a
title print the chrome covers, = breach.

## HOW PART II REACHES THE AGENTS

| carrier | what it holds |
|---|---|
| this document (`src/LESSON-STANDARD.md`) | the normative text; `/lesson check` enforces LSN-1…LSN-12 mechanically and LSN-23 when a `method` block is present |
| **GOSPEL-999** → *Amendment II — THE LESSON AUTHORITY* (`LESSON.001`–`LESSON.018`) | the mandates: what is fixed, what is refused, who may change it |
| **GOSPEL-999** → *Amendment III — THE BRAND, THE MARK AND THE ICONOGRAPHY* (`BRAND.001`–`BRAND.010`) | the identity law LSN-24/25 answer to: the palette, the icon set, the shipped marks, the status bar, the chrome |
| **GOSPEL-999** → *Amendment IV — GOSPEL 444 (THE TIGER PROTOCOL)* (`G444.001`–`G444.012`) | the doctrine LSN-26/27 answer to: the 10-5-5-3 anatomy, the mode ladder, the 45/15 ratio, the guarantee, the closing order |
| **GOSPEL-999** → *Amendment V — THE EMBLEM, THE BED AND THE PRINT ROOM* (`BRAND.011`–`BRAND.016`) | the print law LSN-28/29 answer to: the second icon pass, the emblems, the beds, the certificate's record rule, the sheet's own printing |
| **GOSPEL-999** → *Amendment VI — THE MARKETING REGISTER* (`BRAND.017`–`BRAND.020`) | the outward voice LSN-30 answers to: the two registers, transcribed-not-invented, the quoted promise, the hand-picked set |
| **GOSPEL-999** → *Amendment VII — THE BILINGUAL HIERARCHY AND THE CODEX* (`BRAND.021`–`BRAND.028`) | the hierarchy and the codex LSN-31 answers to: the anchor/subtitle rule, the chosen zone, the M2 pipeline, the disagreement carried not averaged, and the run log as a format |
| **Legionnaire Field Guide** → *§12 LESSON AUTHORSHIP*, *§13 THE BRAND*, *§14 THE DOCTRINE*, *§15 THE PRINT ROOM*, *§16 THE MARKETING REGISTER* and *§17 THE MARKETING HIERARCHY AND THE RUN READOUT* | the operational laws, the failure modes, the checklists |
| `src/brand.js` (`/brand`, `window.ObiBrand`) | the system itself — palette, 115 icons, 64 shipped assets (31 marks · 5 variants · 28 stills), 9 vector emblems, 4 beds, the HUD chrome, GOSPEL 444, the MARKET register, the CODEX, the doctrine deck, the codex deck, the print room (9 artifacts / 31 pages), the desk |
| `src/lessons/reference/NET-CLASSROOM-MANAGER.html` | the specimen, verbatim — the same rule as Part I: where this document and that file disagree about *taste*, the file wins |

*Part II written 2026-09-21 from an audit of `NET-CLASSROOM-MANAGER.html`, at the sovereign's instruction — so that
every future agent builds lessons that are his, not merely correct.*
