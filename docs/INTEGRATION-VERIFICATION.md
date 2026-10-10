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

Record each applicable gate as `PASS`, `FAIL`, `BLOCKED`, or `NOT TESTED`: source/deployment equivalence; GAS GET/POST routing; Platform compatibility; authorized server exchange; Official Read; Official Write persistence and read-after-write; browser/PWA launch/return; App version and PWA/App Shell identity; security negatives; production deployment verification. An App is not fully Integration Ready while an applicable gate is FAIL or BLOCKED. NOT TESTED is never PASS.

## 13. Production evidence

Retain immutable PR/source/deployment identifiers, sanitized diagnostics, read-only evidence, negative-test outcomes, and browser classification. Label server-side and browser evidence separately. Never retain secrets.

## 14. Recovery and rollback

Stop on security or deployment mismatch. Preserve the current deployment until a replacement passes read-only verification. Roll back by selecting the last known-good immutable version in the existing deployment. Never create a replacement GAS project, overwrite it with a fragment, disable browser proof, or perform successful production Official writes during recovery.


## 15. Unified Admin UI verification

For an App that declares Admin capability, verify the App-owned Admin workspace against the latest Mother Standard. This is an experience and evidence gate; it does not copy App business logic or replace the authentication and Official Write security contracts. Saving V1.8 is the accepted UI reference for workspace behavior. Medical v1.1.8 with GAS V17 is the verified Official Read/Write persistence reference and approved legacy compatibility record; neither is a universal dataset or field template.

Record each applicable item independently as PASS, FAIL, BLOCKED or NOT TESTED, with one or more evidence levels.

### Mandatory Admin UI acceptance matrix

- App identity and own human-readable version are visible in the compact Admin header. Return to AVA is present and works from the required Admin surfaces.
- The declared Admin authorization contract is correct. The default browser-bound contract is used unless an exact Platform-approved legacy record is documented. The entry query is routing only.
- A multi-domain Admin uses real tab state: exactly one active content panel is visible; inactive panels are hidden from both visual layout and keyboard navigation; CSS cannot override the hidden-panel state; the active tab is clearly indicated; tab/panel semantics and focus behavior work; Arrow/Home/End behavior is verified where applicable; selecting a tab resets the workspace viewport.
- Tab names and counts are App-specific and match the App-owned workflow. No Saving-specific tab list is imposed on another App.
- Domains with multiple records provide a record selector; stable record IDs are read-only and preserved; disabled records, source order, unknown fields and original data types survive load/edit/save; record identity is server-authoritative and is not inferred solely from the first non-empty field.
- Forms use suitable structured Traditional Chinese controls and labels. Raw JSON is not the primary editor, no Official field is invented or renamed, and read-only domains do not receive unauthorized write controls.
- Local dirty state is detected. Tab switching and record switching protect drafts and offer an intentional cancel, stay or discard choice. Changes are not silently discarded, auto-published or reported as confirmed before persistence.
- Technical details are below the editing workspace in a collapsed-by-default 系統資訊 section. It contains no secrets, credentials, session tokens or Script Property values.
- iPad portrait, iPad landscape, mobile and desktop layouts remain usable, with no unintended horizontal page overflow and accessible narrow-screen tab navigation.
- Official Read loading, success and error states are explicit. Draft data is distinguishable from confirmed Official Data. Save/publish intent, revision conflicts and server validation errors are visible.
- Official Write UX preserves unconfirmed drafts after failure and changes the confirmed Official cache only after complete server read-after-write persistence evidence. HTTP 200, success:true, Admin visibility, Official Read or an optimistic local update is not persistence proof.
- PWA/App Shell lifecycle, independent App update identity, Return to AVA and the App's independent version governance are verified separately from Platform version and from Official Data schema/version.

### Evidence levels

- SOURCE PASS: the repository source, App-owned documentation and static contract show the required behavior. This does not prove runtime, device or production persistence.
- AUTOMATED TEST PASS: repeatable automated tests prove the stated assertion. A fixture or mocked response does not prove authenticated production behavior or persisted Official Write.
- AUTHENTICATED BROWSER PASS: an authenticated browser session verifies the live Admin route, authorization, interaction and return behavior.
- USER DEVICE PASS: the user verifies the live experience on the applicable physical device class, including iPad portrait/landscape where required. Browser emulation is not a physical-device pass.
- PRODUCTION OFFICIAL WRITE PASS: an authorized, reversible and non-destructive production test independently confirms the persisted Official mutation, matching dataset and stable record, changed fields, canonical revision and read-after-write result in the App-owned Official source.

These levels MUST NOT be conflated. A SOURCE PASS or AUTOMATED TEST PASS cannot be relabelled as AUTHENTICATED BROWSER PASS, USER DEVICE PASS or PRODUCTION OFFICIAL WRITE PASS. A production Official Write status remains BLOCKED or NOT TESTED when its own persistence evidence is unavailable, even if Admin launch and Official Read pass.

## 16. Independent App registration compliance and migration record

The registration record and this verification document are the acceptance record for the latest merged Mother Standard. Before a new App is registered, or an existing declared capability is enabled or materially changed, record:

- Mother Standard acknowledgment and the Platform/Mother Standard commit used for the audit.
- Stable App ID, App name, repository, owner, canonical production deployment and current App version.
- Explicit frontend, user and admin capability declarations, including canonical destinations. An unsupported Admin capability is recorded as admin:false; Platform must not fabricate an Admin route.
- Admin UI status when admin:true, including actual tab names/count, record identity rules, schema/field mapping and read-only domains.
- Official Data capability as none, read-only or read/write; App-owned dataset/schema, GAS/backend and Google Sheet identity; supported operations and App-specific validation.
- The applicable authorization contract and any exact Platform-approved legacy compatibility record. A copied Admin URL or avaEntry=admin value is never evidence of authorization.
- Return to AVA, PWA/App Shell update lifecycle, responsive behavior, independent App version governance and the required live deployment evidence.
- Independent evidence status for source, automated, authenticated browser, user device and production Official Write gates.

This checklist is a documented acceptance requirement. The current Platform registration/runtime path does not automatically inspect arbitrary App source, rewrite an App UI, or execute the complete matrix at registration time. Until such enforcement is implemented, report the status exactly as:

> DOCUMENTED REQUIREMENT — RUNTIME ENFORCEMENT NOT IMPLEMENTED

A registry capability flag alone is not a compliance certificate. An App-specific repository may keep a short reference to the latest Mother Standard; it should document only its actual tabs, field/schema mapping, GAS/Sheet identity, supported Official operations, validation and version information. Common Admin UI and Official Data rules remain centralized in the Mother Rules and this verification record.

New Apps, newly developed Admin interfaces and major future Admin UI changes must use this gate from initial implementation. Existing Apps are not automatically rewritten or broken solely to obtain visual identity. Existing App migration is a separately approved App-owned audit and PR that preserves Product Logic, Business Logic, schemas, data, domain workflows, authorization, PWA lifecycle and deployment ownership.
