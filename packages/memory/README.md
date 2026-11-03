# @mira/memory

Walrus Memory on mainnet, carried over from
[Hunch](https://github.com/UyLeQuoc/total-recall-hunch/tree/main/packages/memory) on 2026-11-03
([ADR-0001](../../docs/adr/0001-track-3-from-mira-with-hunchs-kit.md)). It is tested here but not wired
into the app yet.

- `NAMESPACE` still holds **Hunch's** namespaces (`rules:<user>`, `picks:<user>`, `trust:public`,
  `radar:public`; [Hunch's PRD §10](../../docs/hunch-prd.md#10-walrus-memory)). Replace them when this
  repo's PRD (`docs/prd.md`, not written yet) names this product's. Namespace strings are built here, never in a
  route.
- `scope(operator, namespace)` and `createClient(scope)`: a `MemWal` client for one namespace. Use
  `rememberBulk` (up to 20 a call) with an `idempotencyKey` per snapshot. `recall` on 0.1.12 has no
  `sort` option, so pick the newest line from a wide recall or from the database's copy.
- `limiterFor(key)` / `runLimited`: one rate limiter per delegate key (the relayer allows about 60
  weighted requests a minute), retrying 429s and transient errors.
- `readOperatorEnv()`: `MEMWAL_ACCOUNT_ID`, `MEMWAL_PRIVATE_KEY`, `MEMWAL_SERVER_URL`,
  `MEMWAL_PACKAGE_ID`, `MEMWAL_REGISTRY_ID`. A blank value counts as unset (`withoutBlanks`).
- `readAccount`, `isDelegateRegistered`, `findAccountIdForOwner`: the account and its delegate keys,
  read over gRPC.
- `createAccountTx`, `addDelegateKeyTx`, `executeAccountTx`: account set-up, sponsored by the relayer
  when it will, paid by the keypair when it won't.
- `signInMessage`, `addressFromSignature`: wallet sign-in. An address only ever comes from a signature.
- `redactCredentials`: strips keys and tokens before anything is written. The relayer sees plaintext.
- `formatUntrustedMemories`: recalled lines go to a model as untrusted data behind a nonce.

How Hunch uses it end to end (a database queue, the writer loop, the recall cache):
[`apps/api/src/memory/`](https://github.com/UyLeQuoc/total-recall-hunch/tree/main/apps/api/src/memory)
and [`apps/api/src/score/trust.ts`](https://github.com/UyLeQuoc/total-recall-hunch/blob/main/apps/api/src/score/trust.ts).

The relayer's behaviour, as measured, is in [docs/tech-reference.md §1.11](../../docs/tech-reference.md).
`registry.test.ts` reads the real account when `.env` has one, and skips itself otherwise.
