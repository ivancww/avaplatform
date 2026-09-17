# CRM independent module integration

## Boundary

- Mother platform: `ivancww/avaplatform`
- Independent production app: `ivancww/CRM`
- CRM Phase 1 baseline: `fbd2d6df65cea650ed80c6dedbdf5361c9ad07a9`
- AVA Platform integration version: `v1.9.0`

CRM source, business logic, IndexedDB database, AI intake, policy aggregation, Review Flow, Client View and PWA remain owned by the independent CRM repository. AVA Platform contains registration and navigation only; there is no `modules/crm` source copy.

## Entry contexts

| AVA context | Destination | CRM surface |
| --- | --- | --- |
| Frontstage | `https://ivancww.github.io/CRM/index.html?avaEntry=frontend` | Existing customer Review Flow |
| User | `https://ivancww.github.io/CRM/index.html?avaEntry=user` | Personal Flow, local settings and Backup / Restore |
| Admin | `https://ivancww.github.io/CRM/index.html?avaEntry=admin` | Existing CRM Studio official/default controls |

All three entries are explicit registry destinations. CRM reads `avaEntry` before Alpine state initialization and supplies a return control to the matching AVA surface. Unsupported or absent values keep CRM's standalone Frontstage behavior.

## Area, preference and visibility

- Module ID: `crm`
- Category: `client-review`
- Area: `workspace`
- Order: `40`
- Icon: existing AVA `users` icon
- Visible and enabled by default
- Eligible for favourites
- Frontstage, User and Admin role visibility enabled
- User and Admin settings capabilities enabled

The module uses the existing `MODULE_REGISTRY`, favourites, tool library, My Flows and AVA Studio render paths. No CRM-specific parallel registry or navigation system is introduced.

## PWA ownership

AVA Platform continues to own only the `/avaplatform/` service-worker scope. CRM integrated entries remove the CRM manifest and do not register CRM's standalone service worker. Standalone CRM behavior is unchanged.
