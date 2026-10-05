# AVA-CRM independent module integration

## Boundary and verified production source

- Mother platform: `ivancww/avaplatform`
- Independent production app: `ivancww/AVA-CRM`
- Merged AVA-CRM integration baseline: `e97746851a079ac425d4d98d18ba6b7bc42f5213` (PR #3)
- AVA-CRM version at the verified deployment: `v0.3.1`
- Canonical production deployment: `https://ivancww.github.io/AVA-CRM/`

AVA-CRM owns its source, business logic, IndexedDB/User Layer data, policy/customer data, PWA manifest, Service Worker, App Shell update lifecycle, and product workflow. AVA Platform owns registration, navigation, visibility, and common integration authorization only. No AVA-CRM source or private customer/policy data is copied into Platform.

## Entry contract

The live `ava-entry.js` declares `frontend: true`, `user: true`, and
`admin: false`.

| AVA context | Destination | Verified behavior |
| --- | --- | --- |
| Frontstage | `https://ivancww.github.io/AVA-CRM/?avaEntry=frontend` | Customer Frontstage |
| User | `https://ivancww.github.io/AVA-CRM/?avaEntry=user` | Same Frontstage, Edit → Preview → Save Local |
| Admin | No Platform destination | Explicitly unsupported; `avaEntry=admin` safely resolves to Frontstage |

The persistent `返回 AVA / Return to AVA` control targets
`https://ivancww.github.io/avaplatform/`. User mode preserves CRM User Layer
overrides locally and does not modify Official CRM data or private policy data.

## Registration

The app is registered once in `MODULE_REGISTRY`:

- Module ID: `crm`
- Repository: `ivancww/AVA-CRM`
- Enabled, visible, and eligible for favourites
- Frontstage and User role visibility enabled
- User settings enabled
- Admin capability and Admin settings disabled

The Platform must not expose an Admin destination merely because a query string
can be typed. Admin remains disabled until AVA-CRM implements the reusable
Platform Admin launch-ticket exchange, backend App-grant verification, and
Official-write authorization contract.

## Admin authorization boundary

AVA Platform already provides the generic AVA Studio Admin contract documented
in [`ava-studio-admin-authentication.md`](ava-studio-admin-authentication.md):

1. `AVAAdminAuth.sessionToken()` reads a 30-minute browser session handle from
   `sessionStorage`; it is not a permanent credential or User data.
2. Platform GAS verifies the HMAC and active server-side session record.
3. Platform issues a two-minute, one-time, App-bound launch ticket.
4. The Independent App backend exchanges that ticket for a session-bound opaque
   App grant through Platform GAS.
5. The Independent App backend must call `verifyAppGrant` for each Official
   write, alongside its own business authorization and validation.

The Platform contract is generic and reusable. It does not make AVA-CRM Admin
ready: the current AVA-CRM deployment declares `admin: false` and has no
verified App Admin backend/GAS exchange or Official-write verification path.

## PWA and update ownership

AVA Platform owns only the `/avaplatform/` Service Worker scope. AVA-CRM's
worker registers at its own deployment scope with `updateViaCache: "none"`,
performs its own launch-time `registration.update()`, uses network-first Shell
freshness, and safely activates with bounded controller-change reload behavior.
Platform does not cache, clear, or version CRM application code, CRM caches,
IndexedDB, LocalStorage, or App Shell releases.
