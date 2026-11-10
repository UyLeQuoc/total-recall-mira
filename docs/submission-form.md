# Total Recall submission: the form, filled in

Every field of the form at [recall-tatum-walrus.vercel.app](https://recall-tatum-walrus.vercel.app)
("Submit Project"), in the form's order and with its labels (checked on the live form on 2026-11-10). Copy
each answer from its block. **Due Nov 10, 2026, 17:00 UTC.**

- ✅ filled in, ready to paste
- ✏️ personal: the submitter fills it in
- ⏳ needs a step first

Nothing here is a key or a secret.

## Before you submit

Status checked on 2026-11-10, 09:25 UTC.

| #   | Item                            | Status                                                                                                                                                                                                                               |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | At least 10 memories on mainnet | **8 of 10.** The account holds 1,012 memories, but only 8 are in Mira's `mira:*` namespaces. Use the live app for real (a budget, a cap, a goal, a correction, a skipped buy): each one writes a line, which lands in under a minute |
| 2   | Published blog post             | **Not written.** It must cover what Mira does, how it uses Tatum and Walrus, and how it learned over time ([§5.1](event-rules.md#51-submission-requirements-checklist))                                                              |
| 3   | Demo video, 2 to 3 minutes      | Rendered (2:01) but not uploaded. The file is not in the repo; ask the owner. Upload it (YouTube, public or unlisted) and paste the link                                                                                             |
| 4   | The account fields              | **Decide first:** see [02 Accounts](#02-accounts)                                                                                                                                                                                    |
| 5   | The live app is up              | Done. The web app on Vercel serves the same build as `main`, and `/api/health` reports memory on Walrus and pockets on Sui ([ADR-0008](adr/0008-web-on-vercel-api-on-railway.md))                                                    |

## 01 Contact

| Field                                                                  | Answer                                                                                     |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Email \*                                                               | ✏️                                                                                         |
| Discord handle \*                                                      | ✏️                                                                                         |
| LinkedIn \*                                                            | ✏️                                                                                         |
| Telegram ID _(optional)_                                               | ✏️                                                                                         |
| How did you hear about this event? \*                                  | ✏️ one of: Walrus Socials, Tatum Socials, Ads, Hackathon Listings, Friends, Search, Others |
| Which community or account did you hear about us through? _(optional)_ | ✏️                                                                                         |
| Is this your first Web3 project? \*                                    | ✏️ Yes or No                                                                               |

## 02 Accounts

| Field               | Answer                                                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tatum ID \*         | ⏳ [Tatum dashboard](https://dashboard.tatum.io/): My Account → My Account Info, for the account that owns the key Mira uses                       |
| SUI address \*      | ✏️ the submitter's Sui wallet address                                                                                                              |
| Account ID (SUI) \* | ⏳ the Walrus Memory account Mira writes to: `MEMWAL_ACCOUNT_ID` in the server's environment                                                       |
| MEMWAL_AGENT_ID \*  | ⏳ the public key under "Delegate keys" in the [Memory dashboard](https://memory.walrus.xyz/dashboard), for the delegate key the server signs with |

The live app runs on the team's shared Tatum key and Walrus Memory account
([ADR-0007](adr/0007-shared-memory-account-and-tatum-key.md)). The form ties the entry to these accounts,
and the 10 memories must be in the account it names. Pick one:

1. **Enter the shared accounts' IDs**, if no other entry uses them. Fast; Mira's lines (namespaces start
   with `mira:`) sit next to other apps' lines in that account.
2. **Move to the submitter's own Tatum key and Walrus Memory account today:** a new delegate key, then
   `TATUM_API_KEY_TESTNET`, `MEMWAL_ACCOUNT_ID` and `MEMWAL_PRIVATE_KEY` change on Railway. The 8 lines
   stay in the old account, so at least 10 must be written again. Needed if another entry already uses the
   shared IDs (one submission per person, [event rules §3](event-rules.md#3-eligibility)).

## 03 Project

### Project description \* ✅

```text
Mira, the money friend you text. A Track 3 (Consumer Finance Apps) entry.

You text Mira what you spend the way you'd text a friend: "coffee 5.5", "uber 18", "dinner 84 split 3 ways". She keeps your budget, your weekly caps and your savings goal. Ask "should I buy the $48 serum?" and she checks three stores, your caps, your goal's pace and what she learned from your last answers, then offers "skip it, move $41 to Trip". One tap moves the money between your pockets. It feels like texting; the blockchain stays out of sight.

Walrus Memory (mainnet) is the learning loop. Every lesson becomes one short typed line: a budget, a cap, a goal, a rule ("coffee counts as eating out"), a nudge outcome (skipped, or bought anyway) and the month so far. Those lines change what Mira does next: the next coffee is filed where you said; a skipped $41 buy flags that category from $30, and Mira says why; two "buy anyway" answers raise the threshold so she nags less; and a new phone (scan the QR) greets you with your goal and budget recalled from Walrus. Ask "what do you know about me?" to see every line and its Walrus blob.

Private by design. Memories can't be deleted and the relayer sees plaintext, so exact amounts, goal labels and friends' names stay on the device. The server builds every memory line from a typed fact, rounded ("about $40"), and a recalled line that doesn't parse back into a fact is dropped.

Tatum for every onchain call. Each user's pockets are Sui testnet addresses. Balances, transfer building, execution and confirmation all go through Tatum's native Sui gRPC gateway (GetBalance, ListOwnedObjects, SimulateTransaction, ExecuteTransaction, GetTransaction), paced and counted, with no JSON-RPC. The operator sponsors gas, so a $41 move moves exactly $41 of test money and nobody holds SUI.

Live: https://mira-flax.vercel.app
Code: https://github.com/UyLeQuoc/total-recall-mira
```

### Short demo video (2 to 3 min) \* ⏳

The link to the uploaded video (2:01).

### GitHub repo \* ✅

```text
https://github.com/UyLeQuoc/total-recall-mira
```

### Additional documentation _(optional)_ ✅

The field takes one line. Swap in the blog post's link once it's published.

```text
https://github.com/UyLeQuoc/total-recall-mira/tree/main/docs
```

## 04 Feedback

### How was your experience building with Walrus? \* ✅

```text
Good overall, and it shaped the product more than we expected. rememberBulk with an idempotency key let us send up to 20 lines per request and resubmit failed ones safely. The SDK's in-process mock let every unit test and the browser E2E run in a preview mode that never touches mainnet. Namespaces map cleanly onto what Mira learns (mira:prefs, mira:rules, mira:nudges, mira:habits, one set per user).

The hard parts: a write takes tens of seconds to land, so nothing in the product waits on one (a queue, bulk writes, retries, and the device keeps every fact until its line has a blob id). Memories can't be deleted and the relayer sees plaintext, which is why Mira writes only typed, rounded lines built on the server and never free text. Recall is semantic, so loading everything Mira knows about a user is a recall with a limit of 50 per namespace, plus our own parsing and "newest line per key wins".
```

### How was your experience building with the Tatum AI Builder? \* ✅

```text
We didn't use the AI Builder. We used Tatum's Sui gRPC gateway on testnet for every onchain call. The gateway speaks native gRPC, while @mysten/sui's SuiGrpcClient defaults to gRPC-web, so we plugged in a native transport (@protobuf-ts/grpc-transport and @grpc/grpc-js) with the x-api-key metadata. After that it was solid: a pocket move (simulate, execute, confirm) takes about 2 to 4 seconds. We pace calls to 3 a second, count them per method and show the counts on /api/health.
```

### One bug or friction point with Walrus Memory _(optional)_ ✅

```text
There's no way to read a namespace's lines without a semantic query. The read API (/v1/owners/:owner/memories) lists metadata only, with no text, and recall needs a query. So loading "everything Mira knows about this user" is a recall with a limit of 50 per namespace. On top of that, recall sometimes returns results: [] with dropped_count > 0 (it found matches, then dropped them), so we retry four times with backoff before trusting an empty answer. A "list this namespace with text" call would remove both workarounds.
```

### Social post links _(optional, extra points)_ ✏️

The submitter's links to their posts. A draft to post:

```text
I built Mira for the Walrus × Tatum Total Recall hackathon: the money friend you text. Log spends like you'd text a friend, ask "should I buy this?", and skip-and-save into your goal with one tap. She learns from every answer through Walrus Memory on mainnet, and every money move goes through Tatum's Sui gRPC gateway. Try it: https://mira-flax.vercel.app
```

## The checkbox \*

✏️ "I am 18+ and agree to the Event Rules, the Tatum Terms of Use, the Walrus General Terms of Service and
the Walrus Privacy Policy": the submitter ticks it.
