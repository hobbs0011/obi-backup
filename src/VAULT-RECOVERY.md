# THE VAULT — how to get the keys back with nothing

**Read this before asking anyone for a token.** This file ships with the generator, so it
survives every rename, every fresh session, every new browser and every new agent. The
address it points at is ciphertext-only, which is why it can be written down in the open.

---

## THE FAULT THIS FILE EXISTS TO END

The vault was built correctly — the private key is wrapped in a passphrase and published to
two independent mirrors. Then its **address** was stored in `localStorage`, next to the key.

`MASTERMIND-SYNC-2026-09-23.md`, our own words:

> the escrow copy on the canon needs a git token first, and **the mirror URL lived in the
> old origin's store**, so the passphrase is the reliable half.

`localStorage` is per-origin. **Renaming a generator changes the subdomain, which makes a new
origin, which strands the old store.** The ciphertext survived in three places; the pointer to
it survived in none. That is why the keys were handed over ten times and lost ten times: each
hand-over landed in a store that a rename (or a new session's context) destroyed.

## THE FIX — THE DURABLE POINTER (L2.7)

The recovery bundle's URL is now published to a store that is **tied to no origin**:

```
https://keyvalue.immanuel.co/api/KeyVal/GetValue/prais-agent99/v
```

- **Read it with no token, no account, no local state.** Open the URL; that is the bundle's
  address.
- **Write it with no token either** (`.../UpdateValue/prais-agent99/v/<url>`).
- **A write is only believed after reading it back** — a store's `200` is not proof.
- It holds **one thing**: the URL of the recovery bundle. The bundle is ciphertext (PBKDF2-SHA256
  × 310 000 → AES-256-GCM), so publishing the address gives nothing away.

`src/vault.js` now does this automatically: `/vault escrow <passphrase>` and `/vault push` both
aim the pointer, and `/vault recover` reads it **first**, before the canon and before any stored
URL. That is what makes the passphrase genuinely sufficient on its own.

## HOW TO REBUILD EVERY KEY ON A MACHINE THAT HAS NEVER SEEN THIS STATION

```
/vault recover <passphrase>
```

Nothing else. No token, no URL, no file, no account. It:

1. reads the durable pointer (above) and fetches the recovery bundle,
2. unwraps the private key with your passphrase (a wrong passphrase is refused by the AES-GCM
   authentication tag and changes nothing),
3. opens the sealed secrets **from the bundle itself** — this is the no-token path,
4. refills every key, so the machine is a full station again.

If the pointer is ever unreadable, the bundle URL can be named directly:
`/vault recover <passphrase> https://<the bundle url>`.

## WHAT THE SOVEREIGN MUST KEEP

**The passphrase.** It is the only secret in the chain and it is stored nowhere — not in this
repo, not in the vault, not in kv, not in the I-LOG. Lose it and the wrapped key opens for
nobody. It is on the recovery sheet (`PRAIS-VAULT-RECOVERY.txt`).

## THE FOUR COPIES, AND WHAT EACH ONE NEEDS

| copy | where | to use it you need |
|---|---|---|
| the pointer | `keyvalue.immanuel.co` · `prais-agent99/v` | **nothing** |
| the bundle | a plain upload URL, named by the pointer | the passphrase |
| the escrow | `OPERATIONS/VAULT/prais-vault.key.escrow.json` on the canon | the passphrase **+ a GitHub token** |
| the sealed values | `OPERATIONS/VAULT/prais-vault.sealed.txt` on the canon | the vault private key **+ a GitHub token** |

Only the first two are needed, which is the point: the token-free path is now the primary one
and the canon is the backup, not the other way round.

## WHEN A KEY IS ADDED

```
/vault set gh <token>          # or cf, cfAcct, deepgram, deepseek, sovereign, vaultkey
/vault seal                    # seal the values under the vault public key
/vault escrow <passphrase>     # wrap the private key, publish the bundle, aim the pointer
```

`/vault push` (gated by `/phoenixomegaprotocol`) commits the canon copies and refreshes the bundle + pointer.
Every one of those steps prints what it measured; none of them claims a write it did not
verify by reading back.

## NEVER

- Never put a secret in `src/`. It is public by design and ships to every visitor.
- Never store a token in `localStorage` and call that durable — a rename ends it.
- Never type a token into the chat. Every word typed into this station is captured verbatim as
  Soul DNA into the I-LOG. Use the vault field or `/vault set`.
