# Medical approved legacy App Grant compatibility

Medical is the approved reference deployment for the temporary
`ava-legacy-app-grant-v1` compatibility contract. This is a scoped
authorization exception, not a replacement for the default
`ava-admin-session-v1` contract and not a template for unrelated Apps.

## Production contract

- App: `medical`
- Platform frontend: `v1.14.3`
- Platform GAS: production `V6`
- Medical frontend: `v1.1.8`
- Medical GAS: production `V17`
- Admin operation: `medical:official-write`

The flow is:

1. AVA Studio authenticates once and retains the Platform Admin session.
2. Platform issues a Medical-bound, expiring, one-time launch ticket through
   `issueAppLaunch`.
3. Medical exchanges the ticket through `exchangeAppLaunch`.
4. Medical GAS verifies the resulting grant through `verifyAppGrant` with the
   Medical App ID and operation before Official Write.
5. Expiry, one-time/replay, App binding, operation checks, and failure-closed
   behavior remain required. A copied Admin URL without valid authorization
   cannot grant access.

The legacy route is contractually separate from
`ava-admin-session-v1`. It must not be mixed with the browser-bound
ticket/proof exchange, and it must not introduce a second Medical password or
frontend-only authorization.

## Verified Official Data evidence

Medical v1.1.8 / GAS V17 has user-verified:

- AVA Studio → Medical Admin launch and initialization;
- seven Traditional Chinese Admin tabs;
- Official Data Read;
- Official Write to the App-owned Google Sheet;
- persistence after leaving and reopening Admin;
- canonical revision exposed consistently by `checkVersion` and Full
  Bootstrap;
- Return to AVA.

The Medical frontend and GAS preserve App-owned stable IDs, field validation,
expected-revision handling, read-after-write confirmation, and separate User
Override behavior. These are contract semantics to verify in each App, not
Medical-specific identifiers or formulas to copy.

All other Admin-capable Apps continue to use the browser-bound contract unless
they have their own explicit, approved compatibility record. New Apps must not
adopt this legacy route without a separate Platform decision. Removal of the
legacy route remains a coordinated migration decision.
