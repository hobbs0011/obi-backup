# src/curriculum — the pacing guides (data)

**What this is.** The school's own pacing guides, as the sovereign handed them over — the primary years
(Ecogreen, grades 1-5) and the secondary guide (grades 6-9) — plus the parsed copies the station reads at
runtime. Together they answer the two questions the station could not answer before: *what was required in
this week?* and *does our own record show it happened?*

| file | what it is |
|---|---|
| `pa.g1.json` … `pa.g9.json` | The parsed guides. Each holds every week and every section of its grade, with language contents, pages, SB/WB, learning outcomes, differentiated activities, assessments, guided self-learning, references, and the period (ORDER / Period column). Sizes: 30-37 KB each for primary, 301-362 KB for secondary. |
| `index.json` | Metadata only (~7 KB: level, title, weeks, sections, books, per-book counts, per-period counts, source) so `/state` and the status card can report all nine grades without pulling 1.4 MB of sections. |
| `materials.json` | What the school hands out with the guide: the templates, the links, and the books behind them (Cambridge Primary Science Learner's Books grade 4-5, the Look and Close-up courses on the e-learning platform). **No login here** — see `/keys ngl`. |

**How it is read.** `src/curriculum.js` (`window.ObiCurriculum`) fetches `pa.g<grade>.json` on demand and caches
it in memory. `/curriculum import` re-parses a newer workbook **in the browser** (zip.js → `xl/worksheets/sheetN.xml`
→ the sheet grid), validates it (a sheet must yield weeks), and stores the result in this browser's kv (folder
`curriculum`, key `pa.g<grade>`), which then overrides the shipped copy everywhere. Nothing is ever uploaded.

**The teaching scope is a separate layer** (same file, kv key `scope.g<grade>`): the guide is the *school's*
plan and the sovereign teaches a part of it. For Secondary that part is **Close-up + Science only** (Global
Success is the Vietnamese "VT" programme), and on grade 6 the Vietnamese-teacher periods are **8 and 9** of the
ORDER column. `/curriculum scope [grade]` shows it, corrects it, and resets it. Everything else in this module
reads it: `/curriculum <grade>` shows only his books (`all` shows every book), `/curriculum week` marks each
section VT / NOT YOURS, `/coverage` counts only his sections. The scope is data over the guide, never an edit to it.

**The source workbooks are HOSTED, not shipped.** Both are multi-hundred-KB binary spreadsheets, and a
generator's file tree is for the code it runs — the platform's own guidance ("large stable assets are better
served by the upload tool"), and a lesson learned the hard way: a save verifies every file in the tree against
the storage, so dead weight in `src/` is a save that can fail. `WORKBOOKS` in `src/curriculum.js` holds the two
URLs, and `/curriculum materials` prints them:

| workbook | what it is | where |
|---|---|---|
| **Ecogreen · grades 1-5** | The sovereign's workbook «00. Expat's Content_SY 2026-2027» (the five pacing guides + the template/materials tab) — **as a redacted copy**: every byte is there except the one cell that carried the platform login, which now points at `/keys ngl primary`. | `https://user.uploads.dev/file/0df037034ab1e6836d5420880c8e3821.xlsx` |
| **secondary · grades 6-9** | The secondary workbook (sheets `PA.G6` … `PA.G9`). Contains no credential. | `https://user.uploads.dev/file/1039f2155746afa226383537d16fc710.xlsx` |

**Rebuild recipe** (if the JSONs are ever lost): open the station, run `/curriculum import` and pick one of the
two workbooks above (download it first) — the station's own parser regenerates every grade in about half a
second. There is no offline build step to reproduce. If the hosted URLs ever rot, the school can re-send the
sheets: a Drive *file* can be fetched, a Drive *folder* cannot.

**Parser notes worth keeping** (each one cost a debugging round):
1. In xlsx, `t="s"` is an attribute **of the cell**, not of its contents: a shared string is stored as an index
   and only the cell says so. Miss it and every cell reads as a bare number, the header scan finds no header, and
   the workbook parses to *nothing* — silently.
2. The header row is **scanned, not assumed**. Secondary sheets put it on row 2 with data from row 4; the primary
   sheets put it on row 6 with data from row 8, and add a `Period` column where secondary says `Order`. A sheet's
   name says which grade it is (`PA.G6` for secondary, `PA_Grade 4` for primary).
3. **Merged cells are the normal case, not an exception.** Week/Date forward-fill; a section's long text (contents,
   outcomes, assessment) often sits on the rows *below* the row that names it — those rows carry no week, no period
   and no book/unit, so they are *merged up* into the section above instead of becoming nameless sections. A merged
   **Book** cell is inherited down a block, but only where the unit is the same — so a mid-term test or a holiday
   never borrows a book it is not part of.
4. A week's date cell can appear more than once with different ranges (holiday weeks, and the "1A" block that sits
   between weeks 1 and 2). All distinct ranges are kept and printed; the extra label rides along, so week 1 shows
   as `WK 1 · 1A`.

**Honest limits.** Weeks and dates are forward-filled from the sheet's merged cells, so they are the spreadsheet's
own weeks, not a calendar. The primary guides are filled **up to the current week** (5 weeks at the time of
writing, 0-4 — the school year started in August 2026), and their Book column is only partly filled, so many rows
name no book; those are counted as the sovereign's (a section the school does not attribute to another book is not
another teacher's). Science appears on very few rows in the guide as it stands. Grade 7's title cell literally
reads `Un` (a truncation in the original workbook); the station prints "SECONDARY GRADE 7" instead of that.

**Privacy.** Both hosted workbooks are public URLs — which is exactly why the primary one is **redacted**,
and why the two textbook-platform logins (`learn.eltngl.com`: the secondary Close-up course and
the primary Look course) are deliberately **not** here. They live in the sovereign's browser only
(`localStorage obi_keys`, `/keys ngl` and `/keys ngl primary`), are shown masked, are never captured as soul and
never logged.
