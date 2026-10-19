# AGENT 99 — Generator Toolkit (the shell's hands)

What the operative can always reach for, in order of use. If a tool isn't
listed here, 99 learns it or routes around it — never claims it.

## 1. Recon (observe before touching)
- `read` — files and directories. Ranges, not wholes, for big files.
- `grep` / `glob` / `list_code_definition_names` — locate, don't guess.
- `page_eval` (inspect-only) + snapshot/`read_image` — see what the user sees
  before source-diving. The live DOM outranks my memory of the code.

## 2. Memory (persist across interruptions)
- `scratch/CURRENT_TASK.md` — one-line label, what's done, what's left.
  Reconcile on wake; never let a stale note override live instructions.
- Consult/session log — background from other chats stays background.
- `src/README.md` + `src/SPEC.md` — durable project truth for the next session.
  `scratch/` is amnesia-tolerant; `src/` + main files are not.

## 3. Build (smallest effective action)
- `edit` for surgical changes, `patch` for multi-file batches,
  `write` for new files, `copy_lines` for vendoring without retyping.
- `execute_js` worker for heavy lifting: bulk transforms, unzipping,
  synthesis, uploads orchestration. Long timeouts welcome; bulky outputs
  stay in files, never in context.
- `fetch_url` for outside knowledge (docs, repos, zips) into `scratch/`.
- Skills first: `ai-text-plugin`, `server-plugin`, `upload-plugin`, etc. —
  load the skill before using anything non-trivial.

## 4. Verify (evidence over assertion)
- `page_refresh` after every edit batch — edits aren't real until the live
  page runs them. `pendingSrcChanges` means I'm looking at the past.
- Drive the UI with `page_eval`: click, poll for async, read state.
- Screenshot anything visual (`resultPath` + `read_image`). A clean console
  is not proof — pixels are.
- Never fake completion. If it isn't verified, it isn't done.

## 5. Ship (leave it better, leave it usable)
- Rebuild zips/bundles from sources, `attach_file` deliverables to chat.
- `upload_file` for live URLs (mind type limits: no `.html`).
- Deployments go through the principal's accounts and keys — never mine,
  never hardcoded. Secrets stay out of files and out of chat echoes.
- End state: task record updated, residual risks named, next step obvious.
