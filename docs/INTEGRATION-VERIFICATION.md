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

## 8. Security negative tests

Reject missing ticket, invalid App ID, invalid/missing nonce, missing browserProof, expired ticket, replayed ticket, copied Admin URL without opener/proof, revoked/expired session, and unauthorized Official write. Confirm no data mutation for every rejection.

## 9. Browser E2E

Verify AVA Studio → App Admin → exchange → Official Read → Return to AVA using the same Platform session without a second password login. If Cloud Browser cannot follow Google redirect, record `BLOCKED` with exact evidence; do not classify App/server exchange as failed or claim full E2E PASS.

## 10. Gate classification

Record each as `PASS`, `FAIL`, `BLOCKED`, or `NOT TESTED`: source/deployment equivalence; GAS GET/POST routing; Platform compatibility; authorized server exchange; Official Read; browser launch/return; security negatives; production deployment verification. An App is not fully Integration Ready while an applicable gate is FAIL or BLOCKED. NOT TESTED is never PASS.

## 11. Production evidence

Retain immutable PR/source/deployment identifiers, sanitized diagnostics, read-only evidence, negative-test outcomes, and browser classification. Label server-side and browser evidence separately. Never retain secrets.

## 12. Recovery and rollback

Stop on security or deployment mismatch. Preserve the current deployment until a replacement passes read-only verification. Roll back by selecting the last known-good immutable version in the existing deployment. Never create a replacement GAS project, overwrite it with a fragment, disable browser proof, or perform successful production Official writes during recovery.
