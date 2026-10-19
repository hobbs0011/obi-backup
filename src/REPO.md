# Perchance PhoenixRising — push this to your own Git repo
# Run on YOUR machine (not in the perchance sandbox — no git here):
#   git init
#   git add .
#   git commit -m "PhoenixRising — initial"
#   git branch -M main
#   git remote add origin <your-repo-url>
#   git push -u origin main

# Everything in src/ ships with the generator and is yours. main.pjs + index.html too.

# SECRETS — where they actually live (AUDIT 2026-09-21):
#   L1    this browser only ... localStorage `obi_keys` — never in this repo, never in a URL, never logged
#   L2    sealed on the canon . OPERATIONS/VAULT/prais-vault.sealed.txt — the values are sealed with the
#                               vault's PUBLIC key (ML-KEM / FIPS 203) BEFORE they touch git, so the
#                               repository can hold them in the open; only the private key opens them
#   L2.5  the escrow .......... OPERATIONS/VAULT/prais-vault.key.escrow.json — the PRIVATE key wrapped in
#                               a passphrase (PBKDF2-SHA256 × 310 000 → AES-256-GCM) + a public mirror,
#                               so losing one browser is not losing the vault
#   L3    live tests .......... `/vault test` — every row is proven with a real call to the service
#
# THE OPEN SOURCE MARKET, AND THE SECRET SAUCE (2026-09-24):
#   src/market.js ............... THE OPEN SOURCE MARKET — the recon and the play. It fetches
#                                 nine real endpoints (GitHub · npm · HuggingFace · Reddit),
#                                 prints a NUMBER for every channel that answered and the
#                                 REFUSAL VERBATIM for every one that did not, DERIVES the open
#                                 and closed seats from those numbers (an empty seat is a market
#                                 whose leader is under 100 stars — the platform's own field is
#                                 271 repositories with a 69-star leader and ZERO indexes), and
#                                 carries the play: take the index, the reference implementation
#                                 and the on-ramp of the market the estate already lives in.
#   /market .................... scan (measure now) · play · state · log. The recon arms itself
#                                 after boot and every 30 min.
#   src/marketing/OPEN-SOURCE-PLAY.md ... the play, written down (three seats · channels · sequence · KPIs · the gaps declared).
#   src/marketing/awesome-perchance.md .. the index artefact, populated from the live scan and ready to publish (CC0).
#
#   src/secretsauce.js .......... THE SECRET SAUCE — the method, given away free. It is not hidden
#                                 knowledge: it is the MACGYVER PRINCIPLE — build the way out with
#                                 the parts already on the bench. Holds the ten best practices
#                                 (each one already load-bearing in this station's own code), the
#                                 best-kept secrets derived from the measured market, and the ladder
#                                 (start with best practice, then upgrade). The TRAIN lane builds the
#                                 ORDERED corpus — best practice FIRST, then the measurement, then
#                                 the secrets — hashes it and hands it over to download; the station
#                                 cannot fine-tune a model and says so. The FORUMS lane asks Hacker
#                                 News (Algolia), dev.to, GitHub issues, StackExchange and Reddit
#                                 live, with a clock on every call, and keeps every refusal verbatim.
#   /SecretSauce ................ the canon hallmark opens it for 15 minutes (sha-256 only, never
#                                 the plaintext); then best · secrets · upgrade · train · forums ·
#                                 free · state · lock. The canon document is src/canon/SECRET-SAUCE.md.
#                                 The gate is a threshold, not a lock: no service, no account and no
#                                 data sits behind it — the material is meant to be given away.


# THE BRAIN, AND THE DELIVERY (2026-09-25):
#   src/brain.js ............... the mastermind's memory — an INDEX of every artifact, file, document,
#                                command, soul fragment, op, key slot and lane, each pointing at its
#                                source and carrying its digest; the AUTO-SYNC LANE (armed at boot,
#                                then every 5 min: recompute the estate, pull the published manifest,
#                                re-hash the delivery, TRY the write lane and record its failure
#                                VERBATIM); the KEY LEDGER (a 10-char SHA-256 fingerprint per slot —
#                                arrival, rotation and loss are visible, the value is never stored,
#                                logged or sent anywhere); the archive; image sharing.
#   /brain ..................... (no arg) the state · /brain <words> search · sync · rebuild ·
#                                verify [all] re-hash the estate against the register · archive [label] ·
#                                archives · keys · share <path|url> · shares · help
#   The asset register ......... src/sites/mailala/ASSET-MANIFEST.{md,json} — every asset located,
#                                labelled and SHA-256 hashed; the machine copy carries all 242 shipped
#                                file digests AND a TREE DIGEST over them. It is GENERATED, never
#                                hand-edited: re-run the register pass if the tree moves.
#   The dispatch packet ........ src/sites/mailala/SYNC-PACKET.{md,json} — the same work addressed to the
#                                node (agent99-webapp), each artifact with a URL that answers and the
#                                digest to check it by, plus the three lanes as MEASURED: the token-free
#                                read channel WORKS (pull-only), the mesh write is BLOCKED by the
#                                anti-bot gate, the cloudflare lane is BLOCKED with no credential.
#   The census rule ............ the register's census leaves out the four delivery documents themselves
#                                — a self-describing document cannot be enumerated inside itself — and
#                                says so in the file; every other file in src/ is counted and hashed.

# THE MASTER SYNC PIPELINE (2026-09-25, the relay):
#   src/relay.js ................ THE RELAY. One ordered chain, each stage refusing to run on a lie
#                                 from the stage before it: READ (the register + the packet) →
#                                 CENSUS (hash every declared file, and rebuild the register's own
#                                 tree digest from the bytes) → DELIVER (the four truth-documents to
#                                 the host by digest — idempotent, so identical bytes are HELD and
#                                 their URL is reused; then the ADDRESSED SET, where an artifact whose
#                                 bytes have moved is re-carried; then TRY the mesh write and the cloud,
#                                 recording each refusal verbatim) → VERIFY (pull the read channel, then
#                                 re-fetch and re-hash every URL the relay has carried AND every URL the
#                                 packet hands the node) → INDEX (the brain builds over the estate) →
#                                 ARCHIVE (one hashed snapshot, and the run's own digest over its verdicts).
#   /relay ...................... (no arg) run it now · state = the last run without running one ·
#                                 log = the run ledger · help = the doctrine. /pipeline sync is the same
#                                 run. It also arms itself: once ~40 s after boot, then every 30 min.
#   The verdicts ................ REAL / HOLLOW / MISSING / BLOCKED — and the result is COMPLETE only
#                                 when every stage is REAL. A shut door gives HELD; a hollow stage gives
#                                 GAP. "A pipeline reporting COMPLETE with a HOLLOW stage is a lie"
#                                 (REINCARNATION-CONTRACT §3), and that rule is enforced in the code.
#   The census rule, in code ..... SRC_SNAPSHOT minus the four delivery documents and the two panels
#                                 (main.pjs, index.html) = the estate. The same list drives /canon sync,
#                                 so the backup's file list and the census can never drift apart.
#   The delivery ledger .......... kv · relay · deliveries — every URL the relay has carried, with its
#                                 digest. The host addresses CONTENT, so identical bytes return the
#                                 identical URL and nothing is ever duplicated: an artifact is only
#                                 re-carried when it has actually moved.
