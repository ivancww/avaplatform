# One-Time-Off Admin — Platform GAS coordinated deployment plan

## Scope
Draft Platform GAS security hardening in PR #84. **No deployed GAS, One-Time-Off App Admin or Platform registration is activated by this source change.**

The existing Platform `gas/Code.gs` already implements:
- `authenticateAdmin`, `logoutAdmin`
- `issueAdminSession`, `requestAdminBrowserProof`, `exchangeAdminSession`, `verifyAdminSession`

PR #84 adds a **generic, per-request allowlist recheck** to the modern browser-bound contract. A removed App ID cannot exchange a pending launch ticket or continue using an already issued Admin Session Proof. No second login or special One-Time-Off token is introduced.

## App integration settings (Script Properties)

| Project | Script Property | Rule |
| --- | --- | --- |
| Existing AVA Platform GAS | `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` | Preserve values; do not publish in source |
| Existing AVA Platform GAS | `AVA_ADMIN_APP_IDS` | Preserve **all** currently authorized App IDs; do **not** append `one-time-off` until live App security, browser, data and deployment gates PASS |
| Existing One-Time-Off GAS | `AVA_PLATFORM_GAS_URL` | Set to the **verified currently deployed** Platform GAS /exec URL during authorized deployment |
| Existing One-Time-Off GAS | `OTO_ADMIN_WRITES_ENABLED` | `false` until a reviewed, reversible Official write test passes |

The Platform `MODULE_REGISTRY` One-Time-Off `admin:false` remains unchanged in this PR. Its future activation requires a **separate** Platform PR after the App owns a verified Admin browser/UI/backend and the existing deployed One-Time-Off GAS has been inspected.

## Mandatory safe deployment steps
1. Review Platform PR #84 Quality Gate, verify behavior for existing authorized Apps, and obtain Product Owner approval.
2. Open the **existing** Platform Apps Script project. Back up full code and check effective `doGet`/`doPost` and the immutable currently selected deployment version.
3. Reconcile the complete file `gas/Code.gs` with the deployed project; never replace a production multi-file project with a fragment.
4. On approval, choose a **new immutable version** in the **existing Platform GAS deployment** (preserve deployment ID and URL). Do not automatically update App registration/allowlists.
5. Verify authorized existing App Session issue/exchange/read/write and removal-of-app negative tests. Record deployment version and a rollback target.
6. In the independent One-Time-Off GAS project add `gas/AVA_OneTimeOff_Admin_Addon.gs` from One-Time-Off PR #12 *only after inspecting its existing doPost route*. Protect every Official write using `verifyAdminSession`.
7. Finish separate One-Time-Off Admin UI + live tests, then authorize One-Time-Off with `AVA_ADMIN_APP_IDS` and a separate Platform Admin registration PR. Read-only before write.
8. Only if the app's Official write behavior and exact version/readback are independently validated should write enablement be approved.

## Status
- Platform source and automated test: PR pending.
- Current deployed Platform GAS code/version parity: NOT VERIFIED.
- Current deployed One-Time-Off GAS complete source/version: BLOCKED.
- One-Time-Off browser Admin and authorized Official Write: NOT IMPLEMENTED / NOT TESTED.
- Production enablement: **DO NOT ACTIVATE**.

No credentials, token values or private client records belong in this document.
