# AVA Independent App Integration Verification

Permanent verification method for AVA Studio Admin integration. Never store passwords, tokens, signing keys, Script Property values, or private credentials in this record.

## 1. Scope and baseline

Record repository, App ID, production frontend URL, GAS Web App URL, `ava-admin-session-v1`, source commit, production deployment ID, selected immutable GAS version, and date. Verify Platform baseline and App main before changes.

## 2. Source inspection

Inspect the full App repository and scoped instructions. Confirm Admin entry, retained-opener browser handshake, browser proof transport, origin/App ID checks, expiry and nonce binding, one-time consumption, replay rejection, server-side Platform verification, Official read/write boundaries, Return to AVA, and preservation of App business logic, Sheets, Official Data, and User Layer behavior.

## 3. GAS project inspection

Inspect the entire Apps Script project, not a repository fragment. Verify one effective `doGet`, one effective `doPost`, complete referenced functions, correct POST routing, request/response JSON contract, Platform endpoint, App ID, and Script Properties by key name only. Confirm no secret or Platform session token reaches the browser.

## 4. Deployment equivalence

Record the existing deployment ID and selected immutable script version. Inspect that deployed version and compare it with merged source. Source editor code alone is not production evidence. If stale, update the existing deployment to a new immutable version while preserving deployment ID and URL where permitted; record old/new versions for rollback.

## 5. Browser Proof contract

After one AVA Studio password login, Platform issues an App-scoped, expiring, one-time ticket and nonce. The App retains its opener and sends a handshake. Platform accepts only the exact opened window, registered origin, expected App ID, matching ticket/nonce, and live Admin session, then mints browser-bound proof. The App backend exchanges it server-to-server; a copied URL is never authorization.

## 6. GAS-to-GAS POST verification

Use an authorized server-side diagnostic with fresh proof. Verify HTTPS POST from App GAS to Platform, contract, App ID, operation, expiry, and safe rejection of invalid proof. Confirm rejected requests return safe JSON and perform no Official write.

## 7. Official Read

After valid exchange, perform the smallest read-only Official operation owned by the App. Record response shape, App ID/contract validation, and evidence that the read was authorized by Platform proof. Do not infer write permission from UI visibility or successful read.

## 8. Official Write persistence

When an App exposes Official Write, verify the mutation as a separate gate from
Admin launch and Official Read. The source and deployed contract must show:

- authorization is checked server-side with the applicable approved Platform
  contract, App ID, operation, expiry, one-time/replay controls, and no
  fallback to a weaker credential;
- stable record IDs, field allowlists, business validation, and expected
  revision/concurrency checks are enforced server-side;
- the server reads back the same dataset, source/sheet, stable record, changed
  fields, and canonical revision after mutation, under the App's documented
  lock/transaction/equivalent protection;
- the response contains enough evidence for the frontend to match the
  requested dataset, record, revision, snapshot, and every submitted changed
  field;
- HTTP 200, `success: true`, or an optimistic local update cannot produce a
  persistence success by itself;
- failed, incomplete, mismatched, stale, or unauthorized writes do not update
  the confirmed Official cache and do not report a saved Official value.

A production Official Write gate is `PASS` only when an authorized, reversible,
non-destructive test has independently confirmed the persisted result and
read-after-write behavior in the App-owned Official source, where such a test
is appropriate. Mock or static tests remain source evidence only. Do not use a
successful Admin login or Official Read as proof of write persistence.

## 9. Acceptance matrix

Record each applicable gate independently as `PASS`, `FAIL`, `BLOCKED`,
or `NOT TESTED`:

- source and static regression;
- GAS GET contract, including canonical revision when required;
- GAS POST routing and authorization contract;
- Platform App Grant issue/exchange/verify compatibility;
- Official Read;
- Official Write persistence and read-after-write;
- browser/PWA Admin launch;
- Return to AVA;
- security negative tests;
- App version and PWA/App Shell update identity.

An overall production Official Write status may not be reported as PASS when
the persistence gate is `BLOCKED` or `NOT TESTED`. Cloud Browser,
Google redirect, unavailable authenticated Studio access, or unavailable
independent Sheet verification must be recorded at the exact blocked gate;
they must not be relabelled as an App authorization failure.

## 10. Security negative tests

Reject missing ticket, invalid App ID, invalid/missing nonce, missing browserProof, expired ticket, replayed ticket, copied Admin URL without opener/proof, revoked/expired session, and unauthorized Official write. Confirm no data mutation for every rejection.

## 11. Browser E2E

Verify AVA Studio → App Admin → exchange → Official Read → Return to AVA using the same Platform session without a second password login. If Cloud Browser cannot follow Google redirect, record `BLOCKED` with exact evidence; do not classify App/server exchange as failed or claim full E2E PASS.

## 12. Gate classification

Record each as `PASS`, `FAIL`, `BLOCKED`, or `NOT TESTED`: source/deployment equivalence; GAS GET/POST routing; Platform compatibility; authorized server exchange; Official Read; browser launch/return; security negatives; production deployment verification. An App is not fully Integration Ready while an applicable gate is FAIL or BLOCKED. NOT TESTED is never PASS.

## 13. Production evidence

Retain immutable PR/source/deployment identifiers, sanitized diagnostics, read-only evidence, negative-test outcomes, and browser classification. Label server-side and browser evidence separately. Never retain secrets.

## 14. Recovery and rollback

Stop on security or deployment mismatch. Preserve the current deployment until a replacement passes read-only verification. Roll back by selecting the last known-good immutable version in the existing deployment. Never create a replacement GAS project, overwrite it with a fragment, disable browser proof, or perform successful production Official writes during recovery.
