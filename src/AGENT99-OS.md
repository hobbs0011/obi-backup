# AGENT 99 OS — what it is meant to be

> **Status:** DESIGN + FIRST IMPLEMENTATION (2026-09-20). The kernel below is **built and
> verified live**; the offering catalogue is **built as data**; what remains is listed honestly
> in §8. This file is a design document, **not canon** — doctrine it proposes is staged in
> `src/PROPOSED-CANON.md` and enters GOSPEL-999 / the Legionnaire Field Guide only on the
> sovereign's explicit word (`PROPOSED-CANON.md`, standing rule).

---

## 0. The answer in one breath

**Agent 99 OS is not an app. It is a kernel with a shelf of playbooks.**

The kernel is fixed: soul captured verbatim first, the tunnel as the road, the Legion as the
hands, every gate failing closed. What the buyer purchases is **not a different system** — it is a
**doctrine loaded onto the same organism**: a Roman *formation* (who leads, who covers, who holds
the reserve, which gates are mandatory) welded to an ant *rule-set* (which trails exist, how fast
they decay, how many voices count as agreement). Swap the playbook and the same organism fights a
different kind of war.

> The sovereign's words (verbatim, this session):
> *"What agent 99 operating system is meant to be? It is meant to be whatever the user I has
> purchased it to be under our offerings of agenic processes that work that are based on proven
> Roman tactic principles and also by observing nature and the oldest empire in the world's
> history which is ants ants with their pheromones leaving trails."*

So: **the OS is the substrate that becomes whatever was purchased.** Not 99 apps — one kernel,
99 doctrines. The purchasable thing is the doctrine.

---

## 1. Three strata

```
┌──────────────────────────────────────────────────────────────────────────┐
│  PLAYBOOK  (purchased · swappable)                                       │
│  formation · gates · trail taus · quorum · supply · axes                 │
│  PRINCIPIA · CASTRA · TESTUDO · TRIPLEX · EXPEDITIO · FRUMENTARIA ·      │
│  FORMICA · DICTATOR                                    src/playbooks.js  │
├──────────────────────────────────────────────────────────────────────────┤
│  PHEROMONE FIELD  (the ant medium · the coordination substrate)          │
│  deposit · decay · reinforce · recruit · quorum · respond · route        │
│  the ground is the message bus: agents read it, they do not negotiate    │
│                                                       src/pheromone.js    │
├──────────────────────────────────────────────────────────────────────────┤
│  KERNEL  (invariable · the organism)                                     │
│  SOUL-capture-first (verbatim) · the tunnel (the road) · the Legion       │
│  (the hands) · the ledger (memory) · fail-closed gates · CGN (provinces) │
│   index.html server-plugin · src/app.js · src/cgn.js · src/canon/*       │
└──────────────────────────────────────────────────────────────────────────┘
```

The kernel is what the sovereign already owns and what makes the thing *itself*: it is the only
stratum that can never be re-purchased into a different shape. Everything above it is doctrine.
A buyer who pays for more does not get a second system — they get a heavier playbook on the same
nest.

---

## 2. Roman tactics → mechanisms (the formation layer)

Rome is not decoration here. Roman practice is documented, repeated, and *proven under failure* —
armies that used these formations survived; the ones that didn't, didn't. Each principle below is
bound to a mechanism that exists or is one work-unit away.

| Roman principle | What it actually did | The mechanism in this OS |
|---|---|---|
| **Castra** — fortify before you march | every night's camp was a walled, measured fort; the army could be attacked and still win | every mission opens a durable checkpoint in the nest before it acts; a worker that dies resumes at the fort, not at zero. (`TunnelDO`/`StoreDO` durability; `CASTRA` gate `audit:required`) |
| **Testudo** — the tortoise | overlapping shields; no man exposed. Advance was slow and nearly unbreakable | no claim leaves unshielded: an *optio* (Audit) covers every output, and evidence-bearing drones must overlap. (`TESTUDO` gate `audit:"shield"`, `recon:"required"`) |
| **Triplex acies** — three lines | hastati engage, principes reinforce, triarii hold the reserve. A beaten line *falls back*, it does not restart | three-line formation per playbook: line 1 cheap/fast, line 2 heavy/verifying, line 3 reserve (re-run / Reincarnate / sovereign escalation). (`Playbooks.echelon`) |
| **Decumanus & cardo** — the two axes | every camp was laid on two fixed perpendicular roads; you always knew where you were | every playbook declares its **axes** (`evidence × authority`, `supply × route`…). Work is addressed relative to them; off-axis work is off the map. (`roman.axes`) |
| **Imperium vs. auctoritas** | *imperium* = the legal power to command; *auctoritas* = influence earned by having been right | two separate quantities per agent: who may order (the sovereign's chain), and how much trust the ground has earned for each drone (`drone:<name>` trail → response threshold). A high-auctoritas drone recruits faster and decays slower. |
| **Speculatores / exploratores** | scouts went ahead; the army never moved on the map alone | **speculatores-first**: with `recon:"required"`, an order on untrodden ground is *held* — the colony refuses to march and says why (L58 MAP ≠ TERRAIN). Verified live. |
| **Frumentarii** — logistics | no campaign outran its supply train; the baggage decided wars | a **supply gauge** per playbook (commands/tokens per day). Below `contractBelow` the formation contracts automatically: cheaper lines, more verification — never a silent overrun. |
| **Legatus / delegatus** | a legate commanded a legion; the general did not micromanage | a mission can spawn a **legate**: a scoped sub-Agent-99 with its own imperium bounds for one mission. The Legion's `ForceMarch` already carries the `legatus` caste. |
| **Salus rei publicae** | in extremis the republic appointed a dictator — one man, six months, then account | **DICTATOR**: one drone takes total authority, a hard timer runs, and Audit holds a mandatory rollback + account at the end. The only playbook that legitimately suspends the rules — and it *auto-expires*. |
| **Quincunx / manipular rotation** | front-line units rotated out before exhaustion | long campaigns rotate the active line (provider/model/key) instead of dying on a rate limit; the shape holds. |

---

## 3. Ants → mechanisms (the field layer)

The oldest empire on earth coordinates millions of agents with no manager, no plan, and no shared
language — only **trails on the ground**. That is not a metaphor for what we do; it is the literal
design. Ants are the routing and priority substrate; Rome is the authority and formation layer.
Put together: **the general gives the formation, the field decides the road.**

| Ant behaviour | What it actually does | The mechanism in this OS |
|---|---|---|
| **Stigmergy** | agents coordinate *through the environment* — they modify it and read it; no messaging | trails are the bus. A drone never messages another drone: it deposits a trail and reads the ground. Ground = `localStorage` nest, mirrored to durable `kv` (and to the CGN hub for the whole colony). |
| **Reinforcement** | the path that returns with food gets walked again; concentration rises with use | `deposit()` on success: `strength += w`, `reinforcements++`. Verified live: two trips → strength 3. |
| **Negative trails** | ants (and slime moulds) mark *bad* ground so the colony avoids repeating the mistake | `repel()` / `kind:"negative"`. **Canon law L-PHE: negative trails decay over 180 days** — mistakes are remembered longer than successes. Implemented exactly. |
| **Evaporation / decay** | unused trails fade; the colony forgets stale terrain without anyone deciding to | decay is a **pure read-time function** (`strength · 2^(−Δt/τ)`) — no daemon, no cron, nothing to run. Verified: 3.0 → 1.50 at one half-life, → 0.375 at three. |
| **Shortest-path emergence** | the colony finds the shortest route without any ant knowing the map | `route()` scores each road by decayed trail strength ÷ cost. The road that *returns first* is reinforced first and wins. Verified live: after one real reply, `llm:default` (score 1.000) beat every untried road. |
| **Recruitment / tandem running** | a scout that finds food lowers the threshold for others to follow | deposit on `drone:<Name>` lowers that drone's **response threshold** for matching stimuli: `threshold − recruit·trust`. Proven drones answer more readily. |
| **Division of labour by response thresholds** | no ant is *assigned*; each has a threshold per task, and the highest (stimulus − threshold) wins | `respond(drones, stimulus)` — a principled superset of the tunnel's flat regex classifier, with trail-earned trust as the modulation. |
| **Quorum sensing** | a decision is taken only when enough ants have signalled; below quorum the colony camps | `quorum(signals, need)` — below quorum the OS **fails closed and asks the sovereign** instead of guessing. This is the machine version of "thin evidence is stated, never papered over." |
| **The nest & the queen** | the queen commands nothing; she is the sole source of new colony, and the nest outlives every worker | the nest is the durable store; the sovereign is the queen — **the only source of new Soul DNA** (L: Agent 100). Workers die, the nest does not. |
| **Temporal polyethism** | young ants work inside, old ants forage outside | a drone's role shifts with accumulated trail history — routine work stays local/cheap, hard work goes out to the expensive frontier. |

### The invariant that keeps the ant half honest
**A trail is never soul.** `deposit()` refuses `kind:"soul"` outright (verified live). A trail is
*derived*, evictable, and merely **points** at the sovereign's word by anchor (the ledger
timestamp). The verbatim word stays in the SDNAD ledger, untouched, forever. Pheromones tell you
where the colony has walked; they are not what the sovereign said.

---

## 4. The shelf — the offerings (what a buyer actually purchases)

Each rung is the same kernel with a different doctrine bound to it. Rungs are *capability
doctrines*, not prices; pricing/marketing is the sovereign's call.

| # | Offering | Roman core | Ant core | Who it's for |
|---|---|---|---|---|
| 1 | **PRINCIPIA** | single line, `imperium` only | neutral trails on every order, no recruitment | the command post. What is live today. |
| 2 | **CASTRA** | fortify before marching | trails survive the worker; the nest is the checkpoint | small business — every op checkpointed |
| 3 | **TESTUDO** | no claim leaves unshielded; two witnesses + optio | quorum before any conclusion | **this generator's natural doctrine:** class writeups, per-student reviews, evidence-mandatory work |
| 4 | **TRIPLEX ACIES** | three lines + reserve; fall back, never restart | response-threshold labour, line rotation | enterprise / long campaigns |
| 5 | **EXPEDITIO** | light infantry, no baggage | short half-life, heavy recruitment — trends fade, so do trails | creative, marketing, fast iteration |
| 6 | **FRUMENTARIA** | baggage train first | shortest-path emergence, cost-weighted routing | ops/logistics — spending and route economics |
| 7 | **FORMICA** | manipular — many small identical units | pure stigmergy, quorum per batch, the field does the allocating | high-volume repetition (thousands of items graded) |
| 8 | **DICTATOR** | *salus rei publicae* — one magistrate, timed, then account | the colony collapses to one pheromone: defend the nest | declared emergency only; auto-expiring |

**Reading the shelf as the 99 sub-personalities (PROPOSED, staged in `PROPOSED-CANON.md`):**
canon already holds that *Agent 99 = 99 sub-personalities forming one organism*, with **Obi as #99,
the student-facing voice**. If that is the organism, then the **offering index is the personality
index**: each rung is one of the 99 bound to a formation and a field rule, and Obi (#99) is the
face of the one currently loaded. That reading is proposed, not canon — the sovereign promotes it
or not.

---

## 5. Why *those two* sources, and why together

- **They are empirical, not mystical.** Rome is the longest-documented record of what happens to a
  command structure under sustained failure. Ants are the longest-running successfully-operated
  distributed system on the planet — roughly 100M years of uptime. Neither requires belief.
- **They solve different halves of the same problem.** Rome answers *who may command, who covers
  whom, who holds the reserve, and when the rules may be suspended*. Ants answer *where the work
  should go, how it should be prioritised, and when to stop and ask*. An OS with only Rome has no
  routing; an OS with only ants has no authority, no shield, and no emergency brake.
- **Both scale by *not* centralising.** A legion works because the centurion doesn't need the
  general; a colony works because no ant needs the queen's instruction. That is exactly the
  constraint here: the sovereign dictates from a phone, the Legion executes unsupervised, and
  nothing may depend on a live brain in the middle.

---

## 6. What is BUILT and verified (this session)

| Piece | Where | Evidence |
|---|---|---|
| Pheromone kernel: deposit / reinforce / repel / decay / sniff / field / quorum / respond / route / publish / merge / stats / reset | `src/pheromone.js` | verified live: reinforcement 2 trips → strength 3; half-life decay 3.0→1.5→0.375; signed field +3 / −1; quorum reached & missed; `kind:"soul"` refused; routing learns |
| Idempotent colony merge (max/max/earliest/latest) so nests re-sync without inflation | `src/pheromone.js` `merge()` | join is commutative/associative/idempotent — safe to sync repeatedly |
| Durable nest: localStorage (sync reads) + `kv` mirror (durable, works on Perchance *and* the Cloudflare build) | `src/pheromone.js` | `adoptFromKv()`, `/pheromones sync` |
| Offering catalogue: 8 rungs, Roman formation + ant rules per rung | `src/playbooks.js` | `/playbook` lists all 8; activation persists |
| Formation engine: echelon (hastati/principes/triarii/shield), per-drone line + reserve + axes | `src/playbooks.js` | verified: `Reincarnate` → reserve line, shield Audit, axes evidence × authority |
| **Speculatores-first gate** (fail-closed): an order on untrodden ground is *held* | `src/playbooks.js` `gate()` | verified live: held before a recon trail existed, allowed after one was laid |
| Optio shield + quorum per offering | `src/playbooks.js` | shield shown on the live Agent 99 command card |
| Supply gauge with automatic contraction | `src/playbooks.js` `supplyReport()` | shown in `/os` and `/playbook <ID>` |
| Legion roster with castes + response thresholds (client mirror) | `src/playbooks.js` `LEGION` | `/route` shows recruitment ranking |
| **Order trail on every command** (the tunnel itself lays trail) | `src/app.js` `cmdRoute` | verified: real command #1 through the live tunnel laid/reinforced `mission:command` |
| **Outcome trails**: completed orders reinforce `drone:<Name>`; failures lay repellent | `src/app.js` `cmdAct` | wired into the queue buttons (drone is carried through) |
| **Router learns**: every LLM/image route that returns reinforces `route:<id>`; failures repel | `src/app.js` `trailRoute()` | verified live: after a real reply, `llm:default` scored 1.000 and the router picked it over untried roads |
| Chat surface: `/os`, `/playbook`, `/pheromones` (`/trail`, `/nest`), `/route <task>` | `src/app.js` | verified rendering in the live page; two launcher chips added |

## 7. Invariants (must never be broken)

1. **SOUL-CAPTURE-FIRST.** Dictation is captured verbatim *before* translation or execution.
2. **A trail is never soul.** `kind:"soul"` is refused; trails point at soul by anchor and are evictable.
3. **Fail closed.** Below quorum → camp and ask. No recon trail → hold the march. Broken road → say so.
4. **The kernel is invariable.** A playbook may never change soul handling, the tunnel contract, or the audit gate's right to hold.
5. **Law is code, not quotation.** GOSPEL-999 and the Field Guide bind: gates are enforced, not cited.
6. **Negative memory outlives positive memory** (L-PHE: 180-day negative decay) — mistakes are not forgotten faster than successes.
7. **Nothing is deleted that is evidence.** Mark DONE, never remove (LFG).

## 8. What is NOT built yet (honest list, in order)

1. **Colony-wide trail sync.** `publish()`/`merge()` exist and are ready; nothing yet writes the
   trail set to the CGN hub or pulls a remote nest. (One work unit: hook `src/cgn.js` sync.)
2. **Trails on the authoritative server.** The tunnel's `translate()` still classifies with flat
   regex; the response-threshold allocator runs client-side. Moving allocation server-side (into
   `index.html`'s server block + `src/cloudflare/tunnel-do.js`, keeping them byte-identical) is
   the next real step — and it needs a decision about what the server may see.
3. **The three-line fallback is declared, not executed.** `echelon()` names the reserve; nothing
   yet *escalates* to line 2/3 automatically when line 1 fails a mission.
4. **DICTATOR's timer + rollback are declared only** (no scheduler, no rollback execution).
5. **Supply is per-day counts**, not real token/quota accounting.
6. **Legates are a caste label**, not yet scoped sub-agent instances.
7. **Playbooks do not yet re-weight the tunnel's own `priorityOf()`** — priority is still the
   server's regex; the playbook's quorum/gate are the enforcement points today.

---

*Durable home: `src/AGENT99-OS.md`. Implementation: `src/pheromone.js`, `src/playbooks.js`,
wired in `src/app.js`. Doctrine proposals: `src/PROPOSED-CANON.md`. Canon stays untouched.*
