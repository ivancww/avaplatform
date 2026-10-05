# AVA-CRM independent module registration

## Boundary

- Mother platform: `ivancww/avaplatform`
- Independent production app: `ivancww/AVA-CRM`
- AVA-CRM merged baseline: `1ede580ddf29756db29a074320b91a016e73a101`
- AVA-CRM version at baseline: `v0.3.1`
- AVA Platform registration: `v1.14.0`

CRM source, business logic, IndexedDB database, AI intake, policy aggregation, Review Flow, Client View and PWA remain owned by the independent CRM repository. AVA Platform contains registration and navigation only; there is no `modules/crm` source copy.

## Entry contexts

| AVA context | Destination | Status |
| --- | --- | --- |
| Frontstage | Not verified | `frontend: false`; no URL invented |
| User | Not verified | `user: false`; direct Frontstage edit contract not verified |
| Admin | Not supported | `admin: false`; Platform does not fabricate Admin |

The canonical deployment could not be verified from the current `ivancww/AVA-CRM` repository: its repository metadata has no homepage, no Pages deployment, and no deployment workflow; candidate GitHub Pages URLs return 404. The current merged app also does not implement `avaEntry` routing. The Platform record therefore remains deployment-pending and hidden from Front/User/Admin surfaces until the independent app completes its own deployment and entry contract.

AVA-CRM follow-up is required for a verified deployment URL, `?avaEntry=frontend`, `?avaEntry=user`, unsupported Admin behavior, and a persistent Return to AVA control targeting the canonical AVA Platform destination. Its current Return to AVA href is `https://avaplatform.app/`, which is not verified as the Platform deployment destination.

## Area, preference and visibility

- Module ID: `crm`
- Category: `client-review`
- Area: `workspace`
- Order: `80`
- Icon: existing AVA `users` icon
- Registered once in `MODULE_REGISTRY` with `repository: "ivancww/AVA-CRM"`
- Hidden and disabled while deployment/entry verification is pending
- Not eligible for favourites or homepage placement while disabled
- All capabilities and role visibility explicitly false

The module uses the existing `MODULE_REGISTRY`, favourites, tool library, My Flows and AVA Studio render paths. No CRM-specific parallel registry or navigation system is introduced.

## PWA and update ownership

AVA Platform owns only the `/avaplatform/` service-worker scope and does not copy, cache, clear, or version AVA-CRM application code or private data. Once the independent deployment is verified, AVA-CRM remains authoritative for its own Service Worker and App Shell lifecycle; its App Shell version must remain independent from the Platform version.
