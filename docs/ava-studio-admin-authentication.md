# AVA Studio Admin Authentication Contract

## Independent App Verification and Production Evidence

The canonical verification record for each participating App is `docs/INTEGRATION-VERIFICATION.md`. It must distinguish source inspection from deployed GAS inspection and record the selected immutable Apps Script version, deployment ID, Script Properties by name only, endpoint/App ID contract, GET/POST routing, Platform exchange, Official Read, browser-bound launch/return, negative security tests, and final production classification.

Server-side GAS diagnostics prove only the server-side contract. They do not prove complete browser E2E. A Google redirect or Cloud Browser restriction is `BLOCKED` for the browser gate while independently passing server-side gates remain valid. No App may be called fully Integration Ready while an applicable gate is `FAIL` or `BLOCKED`.

Status: Platform contract established on `main`-derived branch. This document defines the reusable Platform boundary; it does not enable any Independent App Admin capability or move App business logic into AVA Platform.

## Current implementation and gap assessment

Before this change, AVA Studio authenticated a password against the Platform GAS Web App and stored a self-contained HMAC token in `sessionStorage`. Homepage writes rechecked that token, but the token was not revocable, App Admin launches carried no authorization context, and there was no reusable backend verification protocol. `avaEntry=admin` therefore selected a route but could not authenticate it.

The implementation is now split into these Platform-owned pieces:

- [`ava-admin-auth.js`](../ava-admin-auth.js) is the browser contract for login, logout, App launch authorization, and memory/session-scoped transport.
- [`gas/Code.gs`](../gas/Code.gs) owns session activation/revocation, one-time launch tickets, signed AVA Admin Session Proofs, and verification.
- [`index.html`](../index.html) owns the explicit registry capability flags and refuses Admin launch unless `capabilities.admin === true`.

## AVA Studio Admin Hub integration pattern

AVA Studio is the shared Admin management hub. Its Independent Apps directory
is rendered from the Platform `MODULE_REGISTRY`; an App appears only when its
registration declares `capabilities.admin === true` and a canonical
`entryModes.admin` destination. The directory does not contain App-specific
editor pages. Selecting **管理 / Manage** reuses the existing App-bound,
one-time launch-ticket flow and opens the App's own Admin surface. Platform
Homepage and Official Update Feed controls remain under a separate Platform
Management section.

To integrate a future App, the App must first implement and pass its own Admin
security/readiness gate. Platform then adds the reviewed registry capability
and canonical Admin entry; no per-App Studio page or Platform copy of the App
editor is required. An App without those declarations is omitted and cannot
receive a fabricated Admin destination.

## Contract

### 1. Login and identity

AVA User identity and Admin authorization are separate. User onboarding/profile data is not changed by Admin login. AVA Studio sends the password only to the Platform GAS endpoint. On success, the endpoint creates a 30-minute session with an opaque HMAC token and a server-side active-session record. The browser keeps the token in `sessionStorage` only; it is not User data, backup data, QR data, LocalStorage, IndexedDB, or a URL credential.

The Platform route `?avaSurface=admin` is also the dedicated secure browser entry to this same AVA Studio login. In a normal browser it may bypass only the PWA installation UI gate and normal User onboarding so that authorized maintenance and production verification can begin. It does not complete or imitate installation, expose the normal Front/User Platform surface, create a session, or grant Admin authority. Closing that dedicated surface returns to the normal installation guidance. `?avaSurface=admin` and `?avaEntry=admin` remain routing values only; the existing password login and every server-side authorization check below remain mandatory.

### 2. Lifetime and logout

The session expires after 30 minutes and is checked on every protected Platform operation. `logoutAdmin` deletes the server-side active-session record and clears the browser token. A failed, expired, revoked, malformed, or unknown token receives a safe authorization error and must not render or write Admin state. Ending Admin authorization does not delete or alter User identity, User Pages, User Overrides, ordering, visibility, or User-created content.

### 3. App Admin launch

The registry must explicitly declare `capabilities: { frontend, user, admin }`. `admin: false` has no Admin entry. `admin: true` is necessary but insufficient: the App must also be live-verified and registered in the Platform GAS `AVA_ADMIN_APP_IDS` property.

AVA Studio requests a two-minute, one-time, App-bound Admin Session ticket and launch nonce. The ticket and nonce are routing inputs only. The selected App is opened in a new window with a retained opener reference; the App must send a handshake message back to AVA Studio. Platform accepts it only when the message source is the exact opened window, the origin is the registered App origin, the App ID, ticket and nonce match, and the Platform Admin session is still valid. Platform then mints a one-time opaque browser proof. The App backend exchanges that proof with the Platform using HTTPS and receives one common, signed `AVA Admin Session Proof`. Platform does not create or persist an App-owned grant record. The proof remains valid only while the originating active AVA Admin session remains active; logout, revocation, or expiry invalidates it at the next verification. A copied URL has no trusted opener or browser proof and must fail closed.

During normal exchange, expired or invalid launch-ticket and browser-proof records are deleted after the failed check. The signed proof is stateless and is rejected when its signature, App ID, expiry, or active Platform session does not validate.

### 4. Official writes

Every Official-data write requires both:

1. App-specific business validation in the Independent App backend/GAS; and
2. Platform verification of the applicable approved Admin authorization
   contract, with the App ID and operation supplied by the backend.

The default contract is the signed `ava-admin-session-v1` proof verified through
`verifyAdminSession`. An approved legacy compatibility record may instead use
`ava-legacy-app-grant-v1` with `issueAppLaunch`,
`exchangeAppLaunch`, and `verifyAppGrant`; it must preserve the same
server-side App binding, expiry, one-time/replay protection, operation
checking, and fail-closed behavior. The active contract and App-specific
operation must be recorded in the App verification record.

The backend must perform verification server-to-server for every write or
according to a documented short cache that never outlives the AVA Admin
authorization. A public/read-only endpoint may remain public where
appropriate. A write endpoint must not become anonymous, and UI visibility,
referrer, query strings, frontend flags, LocalStorage, or `avaEntry=admin`
are never authorization.

For an App-owned GAS Web App, the browser sends the approved proof/grant in a
request body over HTTPS; GAS calls the Platform verification endpoint with
`UrlFetchApp.fetch`, validates `success`, App ID, operation, contract, and
expiry, then performs the App-owned Sheet write. The App must keep its Google
Sheet as a data backend, not as a second password or Google-account allowlist.
Platform credentials and Script Properties stay in the backend deployment
environment.

### 5. Failure and return

Unsupported capability, `avaEntry=admin` without a proof, invalid ticket, expired ticket, revoked session, wrong App ID, failed Platform verification, or failed backend authorization must fail closed with a user-safe message and no Official write. An App returns to AVA Studio using its real registered return destination after Admin work; Return to AVA is navigation, not proof of permission. AVA Studio may be reopened on another authorized device, where a fresh Platform login establishes a fresh device session against the same Official Cloud state.

## Security and ownership boundaries

- `avaEntry=admin` is routing/capability selection only.
- AVA Platform owns common login, Admin sessions, launch authorization, revocation conventions, and verification.
- Each Independent App owns its domain data, schema, calculations, validation, publishing logic, backend, and Official/User merge behavior.
- Admin writes update only the Official Layer. They must not overwrite User Overrides or portable User data.
- Critical Illness is registered with `admin: true` only after its separate App PR consumes and verifies this contract. No Critical Illness repository is changed here.

## Deployment requirements

The Platform GAS deployment must configure `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, and a reviewed comma-separated `AVA_ADMIN_APP_IDS` list. The deployment must be updated separately from source control and tested with the deployed endpoint. Each App backend must configure the Platform verification URL and its App ID, and must not expose the Platform session token or any Script Property to frontend code.
## Approved legacy App compatibility

The default for new and migrated Apps remains `ava-admin-session-v1`. The
Platform may retain `issueAppLaunch`, `exchangeAppLaunch`, and
`verifyAppGrant` only for an explicitly approved legacy compatibility record,
using the separate `ava-legacy-app-grant-v1` contract. A legacy ticket cannot
be exchanged through the browser-bound route, and a browser-bound launch
cannot be exchanged through the legacy route.

Medical is the current verified reference for this compatibility path. Its
production record is documented in
[Medical legacy App Grant launch compatibility](medical-legacy-app-grant-launch.md):
Medical v1.1.8 with Medical GAS V17 has user-verified AVA Studio launch,
Admin initialization, Official Read, Official Write, Google Sheets
synchronization, canonical revision exposure, and persistence after reopening
Admin. This evidence validates the contract semantics; it does not make the
Medical field model, revision formula, or frontend source a universal template.

Legacy support is not a replacement for the browser-bound contract and must
not be used by new Apps without a separate Platform decision. Retirement of
the compatibility route remains a coordinated release decision after all
dependent Apps have migrated or have another approved path.
