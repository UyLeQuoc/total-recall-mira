# ADR-0001: Track 3 starts from Mira, with Hunch's Walrus Memory and Tatum kit

- **Status:** Accepted
- **Date:** 2026-11-03
- **Deciders:** Uy ("giờ tôi sẽ làm tiếp track 3, fork repo này … đem những thứ quan trọng rồi đem qua repo
  fork đó bao gồm prd và walrus memory cho dự án kế tiếp")

## Context

- **Track 3 of Total Recall** asks for consumer finance apps ([event rules §6](../event-rules.md)). The
  deadline is Nov 10, 2026, 17:00 UTC.
- **Mira** ([harrymove-ctrl/mira-imessage](https://github.com/harrymove-ctrl/mira-imessage), built Nov 2
  for the YouCam hackathon) is a working iMessage-style assistant. It has:
  - a chat thread with the agent's steps streamed in;
  - a "Mira remembers" card backed by localStorage;
  - a Railway deploy.

  It uses npm and Node.
- **Hunch** ([UyLeQuoc/total-recall-hunch](https://github.com/UyLeQuoc/total-recall-hunch), Track 1) already
  has the parts every Total Recall entry needs, measured on mainnet and testnet:
  - a Walrus Memory client that respects the relayer's real limits;
  - a Tatum gRPC client for Sui;
  - the event rules and a tech reference;
  - a PRD that shipped.

  It uses Bun.

## Decision

- **Fork** Mira as [UyLeQuoc/total-recall-mira](https://github.com/UyLeQuoc/total-recall-mira); the
  `upstream` remote is the original.
- **Carry the packages over as npm workspaces:**
  - `packages/memory` becomes `@mira/memory`, and `packages/chain` becomes `@mira/chain`.
  - Versions match Hunch's lockfile: memwal 0.1.12, `@mysten/sui` 2.38.0, `@mysten/seal` 1.5.2.
  - Three constructors with parameter properties became plain fields, so Node's type stripping loads the
    packages without a build step. The behaviour is unchanged.
- **Carry the docs over:**
  - [event-rules.md](../event-rules.md) and [tech-reference.md](../tech-reference.md);
  - [hunch-prd.md](../hunch-prd.md): Hunch's PRD as the model, with its links pointing back to Hunch;
  - [code-rules.md](../code-rules.md): the stack-neutral part;
  - the ADR template;
  - the link check (`npm run docs:links`) and the history secret scan (`npm run secrets:history`).
- **Hunch's ADR-0002 to ADR-0005 apply here as they are:**
  - [Sui is gRPC only](https://github.com/UyLeQuoc/total-recall-hunch/blob/main/docs/adr/0002-sui-grpc-only.md);
  - [every Sui call goes through Tatum](https://github.com/UyLeQuoc/total-recall-hunch/blob/main/docs/adr/0003-tatum-for-every-sui-call.md);
  - [the public fullnode is the fallback on a 402](https://github.com/UyLeQuoc/total-recall-hunch/blob/main/docs/adr/0004-public-fullnode-fallback-on-402.md);
  - [Sui on testnet, Walrus Memory on mainnet](https://github.com/UyLeQuoc/total-recall-hunch/blob/main/docs/adr/0005-testnet-for-sui-mainnet-for-memory.md).
- **No keys are carried over.** One submission per person: this entry uses its submitter's own Tatum and
  Walrus Memory accounts.
- **npm stays the package manager,** as Mira already uses it.

## Consequences

- **The memory and chain code are tested but not wired into the app.** Chain passes 22 tests. Memory
  passes 11, plus 6 that need a real account and skip without one.
- **Open questions for the PRD:**
  - what the product is;
  - what memory may hold, given that the relayer sees plaintext and memories can't be deleted;
  - where the server keeps state. Mira has no database, and Hunch keeps a database copy of every memory
    line.
- **`NAMESPACE` still holds Hunch's namespaces** until the PRD names this product's.
- **Some things need Node ≥ 22.18:** the scripts, and the server once it imports the packages. `engines`
  still says ≥ 20; raise it when the server imports them.

## Links

[AGENTS.md](../../AGENTS.md) · [packages/memory](../../packages/memory/README.md) ·
[packages/chain](../../packages/chain/README.md) · [Hunch](https://github.com/UyLeQuoc/total-recall-hunch)
