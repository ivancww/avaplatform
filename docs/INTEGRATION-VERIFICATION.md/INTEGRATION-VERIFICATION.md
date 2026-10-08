# AVA Independent App Integration Verification

This is the permanent verification method for AVA Studio Admin integration. It records evidence without storing passwords, tokens, signing keys, Script Property values, or private credentials.

## 1. Scope and baseline

Record repository, App ID, production frontend URL, GAS Web App URL, Platform contract (`ava-admin-session-v1`), source commit, production deployment ID, selected immutable GAS version, and verification date. Verify the Platform baseline and the App's current main before changes.

## 2. Source inspection

Inspect the full App repository and applicable scoped instructions. Confirm the Admin entry, retained-opener browser handshake, browser proof transport, origin and App ID checks, expiry and nonce binding, one-time consumption, replay rejection, server-side Platform verification, Official read/write boundaries, and Return to AVA. Confirm existing business logic, Google Sheets, Official Data, and User Layer behavior remain App-owned.

## 3. GAS project inspection

Inspect the entire Apps Script project, not a repository fragment. Verify one effective `doGet`, one effective `doPost`, complete referenced functions, correct POST action routing, request/response JSON contract, Platform endpoint, App ID, and required Script Properties by key name only. Confirm no password, signing key, Platform session token, or Script Property value is exposed to the browser.

## 4. Deployment equivalence

Record the existing production deployment ID and selected immutable script version. Inspect that version's code and compare it with the merged source contract. A source editor version is not production evidence. If stale, create a new immutable version and update the existing deployment while preserving its deployment ID and URL where permissions allow it. Record old and new versions for rollback.

## 5. Browser Proof contract

The browser starts from AVA Studio after one password login. Platform issues an App-scoped, expiring, one-time ticket and nonce. The App retains its opener and sends a handshake. Platform accepts only the exact opened window, registered origin, expected App ID, matching ticket and nonce, and a live Admin session; it then mints a browser-bound proof. The App backend exchanges the proof server-to-server and never treats a copied URL as authorization.

## 6. GAS-to-GAS POST verification

Use an authorized server-side diagnostic with a fresh proof. Verify HTTPS POST from App GAS to Platform, accepted contract, App ID, operation, expiry, and safe rejection of invalid proof. Confirm the App returns a safe JSON error and performs no Official write on rejection.

## 7. Official Read

After a valid exchange, perform the smallest read-only Official operation owned by the App. Record response shape, App ID/contract validation, and evidence that the read was authorized by the Platform proof. Do not infer write permission from UI visibility or a successful read.

## 8. Security negative tests

Independently reject missing ticket, invalid App ID, invalid or missing nonce, missing browserProof, expired ticket, replayed ticket, copied Admin URL without opener/proof, revoked/expired Platform session, and unauthorized Official write. Confirm no data mutation for every rejected case.

## 9. Browser E2E

Verify AVA Studio → App Admin → Admin exchange → Official Read → Return to AVA using the same Platform session and without a second password login. If Cloud Browser cannot follow Google's redirect, record `BLOCKED` for this gate with exact evidence; do not classify the App or server-side exchange as failed and do not claim full E2E PASS.

## 10. Gate classification

Record each gate as `PASS`, `FAIL`, `BLOCKED`, or `NOT TESTED`:

1. GitHub source and deployment equivalence.
2. GAS GET and POST routing.
3. Platform Admin contract compatibility.
4. Authorized server-side Admin exchange.
5. Official Read authorization.
6. Browser-bound Admin launch and return.
7. Security negative tests.
8. Production deployment verification.

An App is not fully Integration Ready if an applicable gate is `FAIL` or `BLOCKED`. `NOT TESTED` remains explicit and is never treated as PASS.

## 11. Production evidence requirements

Retain links or immutable identifiers for the merged PR, source commit, deployment ID/version, sanitized diagnostics, read-only response evidence, negative-test outcomes, and browser classification. Never retain secrets. Server-side evidence and browser evidence must be labelled separately.

## 12. Recovery and rollback

Stop on a security or deployment mismatch. Preserve the existing deployment until the replacement version passes read-only verification. Roll back by selecting the last known-good immutable version in the existing deployment. Do not create a replacement GAS project, overwrite the complete project with a fragment, disable browser proof, or make successful production Official writes during recovery.
