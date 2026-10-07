# AVA-CRM independent module integration

## Boundary and verified production source

- Mother platform: `ivancww/avaplatform`
- Independent production app: `ivancww/AVA-CRM`
- Merged AVA-CRM Admin baseline: `1470f8c5c4d62d1016d303ef34deda33ee20bf91` (PR #5)
- AVA-CRM version at the verified deployment: `v0.3.1`
- Canonical production deployment: `https://ivancww.github.io/AVA-CRM/`

AVA-CRM owns its source, business logic, IndexedDB/User Layer data, policy/customer data, PWA manifest, Service Worker, App Shell update lifecycle, and product workflow. AVA Platform owns registration, navigation, visibility, and common integration authorization only. No AVA-CRM source or private customer/policy data is copied into Platform.

## Entry contract

The merged CRM application implements Frontstage, User, and the fail-closed
AVA Studio Admin entry. Platform registration is the canonical cross-App
capability declaration.

| AVA context | Destination | Verified behavior |
| --- | --- | --- |
| Frontstage | `https://ivancww.github.io/AVA-CRM/?avaEntry=frontend` | Customer Frontstage |
| User | `https://ivancww.github.io/AVA-CRM/?avaEntry=user` | Same Frontstage, Edit → Preview → Save Local |
| Admin | `https://ivancww.github.io/AVA-CRM/?avaEntry=admin` | Requires a valid, one-time AVA Studio CRM launch ticket and a backend-exchanged App grant; direct unauthenticated entry fails closed |

The persistent `返回 AVA / Return to AVA` control targets
`https://ivancww.github.io/avaplatform/`. User mode preserves CRM User Layer
overrides locally and does not modify Official CRM data or private policy data.

## Registration

The app is registered once in `MODULE_REGISTRY`:

- Module ID: `crm`
- Repository: `ivancww/AVA-CRM`
- Enabled, visible, and eligible for favourites
- Frontstage, User, and Admin role visibility enabled
- User settings enabled
- Admin capability and Admin settings enabled

The Admin destination is enabled only because AVA-CRM now implements the
reusable Platform launch-ticket exchange, keeps the App grant in memory, calls
Platform `verifyAppGrant` before every allowlisted Official write, and fails
closed when authorization or Official data loading fails.

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

The CRM-owned production GAS endpoint remains
`https://script.google.com/macros/s/AKfycbyvGzKK5v9VEXyTeCmGUKhnVXgO6eh7Hg6FDEfwEIfsd58SCtPdNQvW21wTp9J5FfAX/exec`.
Its merged backend uses canonical App ID `crm`, exchanges one-time launch
tickets through Platform GAS, and verifies the App grant before an allowlisted
Official write. The production Platform `AVA_ADMIN_APP_IDS` property was
verified to include `crm`; registration itself grants no authority.

## PWA and update ownership

AVA Platform owns only the `/avaplatform/` Service Worker scope. AVA-CRM's
worker registers at its own deployment scope with `updateViaCache: "none"`,
performs its own launch-time `registration.update()`, uses network-first Shell
freshness, and safely activates with bounded controller-change reload behavior.
Platform does not cache, clear, or version CRM application code, CRM caches,
IndexedDB, LocalStorage, or App Shell releases.
